<?php

namespace App\Services;

use App\Models\StockLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Service: StockService
 *
 * Mengelola semua perubahan stok produk maupun bahan baku.
 * PENTING: Jangan pernah mengubah stok langsung dari model. Selalu gunakan service ini
 * agar audit trail (stock_logs) selalu konsisten dan DB transaction terjamin.
 */
class StockService
{
    /**
     * Menyesuaikan stok dan mencatat log.
     *
     * @param Model $stockModel Instance dari ProductStock atau RawMaterialStock
     * @param float $jumlah Jumlah penyesuaian (positif untuk masuk, negatif untuk keluar)
     * @param string $jenis Jenis pergerakan (stok_masuk, stok_keluar, adjustment, dll)
     * @param string|null $keterangan Catatan tambahan opsional
     * @param string|null $referensiTipe Tipe model referensi (opsional, misal OrderShipment::class)
     * @param int|null $referensiId ID model referensi (opsional)
     * @return StockLog
     * @throws Exception Jika stok menjadi negatif
     */
    public static function adjust(
        Model $stockModel,
        float $jumlah,
        string $jenis,
        ?string $keterangan = null,
        ?string $referensiTipe = null,
        ?int $referensiId = null
    ): StockLog {
        // Hanya model yang valid
        $validClasses = [\App\Models\ProductStock::class, \App\Models\RawMaterialStock::class];
        if (!in_array(get_class($stockModel), $validClasses)) {
            throw new Exception("Model stok tidak valid.");
        }

        return DB::transaction(function () use ($stockModel, $jumlah, $jenis, $keterangan, $referensiTipe, $referensiId) {
            // Lock row untuk mencegah race condition (PENTING untuk concurrency)
            $stock = get_class($stockModel)::lockForUpdate()->findOrFail($stockModel->id);

            $stokSebelum = (float) $stock->stok_saat_ini;
            $stokSesudah = $stokSebelum + $jumlah;

            // Validasi stok negatif
            if ($stokSesudah < 0) {
                $nama = method_exists($stock, 'produk') ? $stock->produk->nama_produk : $stock->bahan->nama_bahan;
                throw new Exception("Stok tidak mencukupi untuk '{$nama}'. Stok saat ini: {$stokSebelum}");
            }

            // Update stok
            $stock->stok_saat_ini = $stokSesudah;
            $stock->save();

            // Catat ke log
            return StockLog::create([
                'stockable_type' => get_class($stock),
                'stockable_id'   => $stock->id,
                'jenis'          => $jenis,
                'jumlah'         => $jumlah,
                'stok_sebelum'   => $stokSebelum,
                'stok_sesudah'   => $stokSesudah,
                'keterangan'     => $keterangan,
                'referensi_tipe' => $referensiTipe,
                'referensi_id'   => $referensiId,
                'created_by'     => auth()->id(),
            ]);
        });
    }
}
