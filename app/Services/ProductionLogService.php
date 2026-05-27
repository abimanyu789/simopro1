<?php

namespace App\Services;

use App\Models\ProductionLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductBom;
use App\Models\RawMaterialStock;
use App\Models\ProductStock;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Service: ProductionLogService
 *
 * Mengelola logic produksi, termasuk:
 * - Validasi status order & kuantitas
 * - Kalkulasi upah borongan
 * - Potong stok bahan baku (via BOM) saat selesai
 * - Tambah stok produk saat selesai
 * - Rollback saat log dihapus
 */
class ProductionLogService
{
    /**
     * Catat log produksi baru.
     */
    public static function create(array $data): ProductionLog
    {
        return DB::transaction(function () use ($data) {
            $order = Order::findOrFail($data['order_id']);
            $orderItem = OrderItem::with('produk')->findOrFail($data['order_item_id']);
            
            // 1. Validasi pesanan harus berstatus diproses atau produksi
            if (!in_array($order->status, ['diproses', 'produksi'])) {
                throw ValidationException::withMessages([
                    'order_id' => 'Pesanan tidak valid untuk produksi. Status harus Diproses atau Produksi.'
                ]);
            }

            // 2. Validasi jumlah produksi tidak melebihi sisa
            $sisa = $orderItem->sisa_produksi;
            if ($data['jumlah_produksi'] > $sisa) {
                throw ValidationException::withMessages([
                    'jumlah_produksi' => "Jumlah produksi ({$data['jumlah_produksi']}) melebihi sisa yang belum diproduksi ({$sisa} unit)."
                ]);
            }

            // 3. Kalkulasi Upah Borongan (Backend, bukan dari frontend)
            $karyawan = \App\Models\Employee::findOrFail($data['karyawan_id']);
            $upahBorongan = $data['jumlah_produksi'] * $karyawan->upah_borongan;

            $log = ProductionLog::create([
                'order_id' => $data['order_id'],
                'order_item_id' => $data['order_item_id'],
                'karyawan_id' => $data['karyawan_id'],
                'tanggal_produksi' => $data['tanggal_produksi'],
                'tanggal_selesai_produksi' => $data['tanggal_selesai_produksi'] ?? null,
                'jumlah_produksi' => $data['jumlah_produksi'],
                'upah_borongan' => $upahBorongan,
                'status' => $data['status'],
                'catatan' => $data['catatan'] ?? null,
            ]);

            // 4. Jika status langsung 'selesai', jalankan proses penyelesaian
            if ($log->status === 'selesai') {
                self::processCompletion($log, $orderItem, $order);
            } else {
                // Update order status to 'produksi' if it's 'diproses'
                if ($order->status === 'diproses') {
                    $order->status = 'produksi';
                    $order->save();
                    \App\Models\OrderStatusLog::create([
                        'order_id' => $order->id,
                        'status_lama' => 'diproses',
                        'status_baru' => 'produksi',
                        'catatan' => 'Otomatis dimulai dari modul produksi',
                        'changed_by' => auth()->id()
                    ]);
                }
            }

            return $log;
        });
    }

    /**
     * Update log produksi. Terutama untuk merubah status ke 'selesai'.
     */
    public static function update(ProductionLog $log, array $data): ProductionLog
    {
        return DB::transaction(function () use ($log, $data) {
            if ($log->status === 'selesai') {
                throw ValidationException::withMessages([
                    'status' => 'Log produksi yang sudah selesai tidak dapat diubah.'
                ]);
            }

            $order = Order::findOrFail($log->order_id);
            $orderItem = OrderItem::with('produk')->findOrFail($log->order_item_id);

            // Validasi sisa jika jumlah diubah
            if (isset($data['jumlah_produksi']) && $data['jumlah_produksi'] != $log->jumlah_produksi) {
                // Sisa tanpa log ini
                $sisaTanpaIni = $orderItem->kuantitas - ProductionLog::where('order_item_id', $orderItem->id)
                    ->where('status', 'selesai')
                    ->where('id', '!=', $log->id)
                    ->sum('jumlah_produksi');

                if ($data['jumlah_produksi'] > $sisaTanpaIni) {
                    throw ValidationException::withMessages([
                        'jumlah_produksi' => "Melebihi sisa produksi yang diperbolehkan ({$sisaTanpaIni} unit)."
                    ]);
                }
                
                // Recalculate wage
                $karyawan = \App\Models\Employee::findOrFail($data['karyawan_id'] ?? $log->karyawan_id);
                $data['upah_borongan'] = $data['jumlah_produksi'] * $karyawan->upah_borongan;
            }

            $log->update($data);

            if ($log->status === 'selesai') {
                self::processCompletion($log, $orderItem, $order);
            }

            return $log;
        });
    }

    /**
     * Menghapus log produksi dan melakukan rollback jika sudah selesai.
     */
    public static function delete(ProductionLog $log): void
    {
        DB::transaction(function () use ($log) {
            if ($log->status === 'selesai') {
                $orderItem = OrderItem::findOrFail($log->order_item_id);
                
                // 1. Rollback order_item jumlah_diproduksi
                $orderItem->decrement('jumlah_diproduksi', $log->jumlah_produksi);

                // 2. Rollback stok produk (Kurangi)
                $productStock = ProductStock::where('produk_id', $orderItem->produk_id)
                    ->where('ukuran', $orderItem->ukuran)
                    ->where('warna', $orderItem->warna)
                    ->first();
                    
                if ($productStock) {
                    StockService::adjust(
                        $productStock,
                        - (float) $log->jumlah_produksi,
                        'adjustment',
                        "Rollback produksi log #{$log->id}",
                        ProductionLog::class,
                        $log->id
                    );
                }

                // 3. Rollback stok bahan baku (Tambah kembali berdasarkan BOM)
                $boms = ProductBom::where('produk_id', $orderItem->produk_id)->get();
                foreach ($boms as $bom) {
                    $jumlahBahan = (float) $bom->jumlah_per_unit * $log->jumlah_produksi;
                    $rawMaterialStock = RawMaterialStock::where('bahan_id', $bom->bahan_id)->first();
                    if ($rawMaterialStock) {
                        StockService::adjust(
                            $rawMaterialStock,
                            $jumlahBahan,
                            'adjustment',
                            "Rollback produksi log #{$log->id}",
                            ProductionLog::class,
                            $log->id
                        );
                    }
                }
            }

            $log->delete();
        });
    }

    /**
     * Internal: Proses saat log produksi ditandai selesai.
     */
    private static function processCompletion(ProductionLog $log, OrderItem $orderItem, Order $order): void
    {
        // 1. Increment jumlah_diproduksi di order_item
        $orderItem->increment('jumlah_diproduksi', $log->jumlah_produksi);

        // 2. Tambah Stok Produk
        $productStock = ProductStock::firstOrCreate(
            [
                'produk_id' => $orderItem->produk_id,
                'ukuran' => $orderItem->ukuran,
                'warna' => $orderItem->warna
            ],
            ['stok_minimum' => 5]
        );

        StockService::adjust(
            $productStock,
            (float) $log->jumlah_produksi,
            'hasil_produksi',
            "Produksi pesanan #{$order->nomor_pesanan}",
            ProductionLog::class,
            $log->id
        );

        // 3. Kurangi Stok Bahan Baku (BOM)
        $boms = ProductBom::where('produk_id', $orderItem->produk_id)->get();
        foreach ($boms as $bom) {
            $jumlahBahan = (float) $bom->jumlah_per_unit * $log->jumlah_produksi;
            $rawMaterialStock = RawMaterialStock::where('bahan_id', $bom->bahan_id)->first();
            
            if ($rawMaterialStock) {
                StockService::adjust(
                    $rawMaterialStock,
                    -$jumlahBahan,
                    'pemakaian_produksi',
                    "Produksi pesanan #{$order->nomor_pesanan}",
                    ProductionLog::class,
                    $log->id
                );
            }
        }

        // 4. Cek apakah semua item sudah diproduksi untuk otomatis update status pesanan
        $order->load('items');
        $allCompleted = true;
        foreach ($order->items as $item) {
            if ($item->jumlah_diproduksi < $item->kuantitas) {
                $allCompleted = false;
                break;
            }
        }

        if ($allCompleted && $order->status !== 'selesai' && $order->status !== 'closed') {
            $statusLama = $order->status;
            $order->status = 'selesai';
            $order->save();

            \App\Models\OrderStatusLog::create([
                'order_id' => $order->id,
                'status_lama' => $statusLama,
                'status_baru' => 'selesai',
                'catatan' => 'Semua item telah diproduksi',
                'changed_by' => auth()->id()
            ]);
        }
    }
}
