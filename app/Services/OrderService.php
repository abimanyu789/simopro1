<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusLog;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Service: OrderService
 *
 * Mengelola pembuatan pesanan baru, snapshot harga, dan transisi status.
 */
class OrderService
{
    /**
     * Buat pesanan baru beserta items-nya.
     * Mengambil snapshot harga_jual dari master produk.
     */
    public static function create(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $subtotal = 0;
            $itemsToCreate = [];

            // Proses setiap item untuk hitung subtotal dan ambil snapshot harga
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['produk_id']);

                // SNAPSHOT HARGA
                $hargaSatuan = $product->harga_jual;
                $subtotalItem = $hargaSatuan * $item['kuantitas'];
                $subtotal += $subtotalItem;

                $itemsToCreate[] = [
                    'produk_id' => $product->id,
                    'ukuran' => $item['ukuran'],
                    'warna' => $item['warna'],
                    'kuantitas' => $item['kuantitas'],
                    'harga_satuan' => $hargaSatuan,
                    'subtotal_item' => $subtotalItem,
                ];
            }

            // Hitung diskon (Validasi Backend)
            $diskonNilai = $data['diskon_nilai'] ?? 0;
            $diskonNominal = 0;

            if (!empty($data['diskon_tipe'])) {
                if ($data['diskon_tipe'] === 'persen') {
                    if ($diskonNilai > 100) {
                        throw ValidationException::withMessages(['diskon_nilai' => 'Diskon persen tidak boleh melebihi 100%.']);
                    }
                    $diskonNominal = ($diskonNilai / 100) * $subtotal;
                } elseif ($data['diskon_tipe'] === 'nominal') {
                    if ($diskonNilai > $subtotal) {
                        throw ValidationException::withMessages(['diskon_nilai' => 'Diskon nominal tidak boleh melebihi subtotal.']);
                    }
                    $diskonNominal = $diskonNilai;
                }
            }

            $totalHarga = $subtotal - $diskonNominal;

            // Simpan Order
            $order = Order::create([
                'nomor_pesanan' => Order::generateNomor(),
                'customer_id' => $data['customer_id'],
                'tanggal_pesanan' => $data['tanggal_pesanan'],
                'deadline' => $data['deadline'],
                'status' => 'pending',
                'diskon_tipe' => $data['diskon_tipe'] ?? null,
                'diskon_nilai' => $diskonNilai,
                'catatan_diskon' => $data['catatan_diskon'] ?? null,
                'catatan' => $data['catatan'] ?? null,
                'subtotal' => $subtotal,
                'total_harga' => $totalHarga,
            ]);

            // Simpan Order Items
            foreach ($itemsToCreate as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // Catat log status awal
            OrderStatusLog::create([
                'order_id' => $order->id,
                'status_lama' => null,
                'status_baru' => 'pending',
                'catatan' => 'Pesanan baru dibuat',
                'changed_by' => auth()->id()
            ]);

            return $order;
        });
    }

    /**
     * Update status pesanan dan catat log.
     */
    public static function updateStatus(Order $order, string $newStatus, ?string $catatan = null): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $catatan) {
            if (!$order->canTransitionTo($newStatus)) {
                throw ValidationException::withMessages([
                    'status' => "Transisi status dari '{$order->status}' ke '{$newStatus}' tidak valid."
                ]);
            }

            $statusLama = $order->status;
            $order->status = $newStatus;
            $order->save();

            OrderStatusLog::create([
                'order_id' => $order->id,
                'status_lama' => $statusLama,
                'status_baru' => $newStatus,
                'catatan' => $catatan,
                'changed_by' => auth()->id()
            ]);

            return $order;
        });
    }

    /**
     * Hapus pesanan (hanya jika pending).
     */
    public static function delete(Order $order): void
    {
        if ($order->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Hanya pesanan dengan status Pending yang dapat dihapus.'
            ]);
        }

        $order->delete();
    }
}
