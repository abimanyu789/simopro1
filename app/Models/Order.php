<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model: Order (Pesanan)
 *
 * Header pesanan customer.
 * Status machine: pending → diproses → produksi → selesai → closed
 *
 * Business rules:
 * - Hanya status 'pending' yang bisa dihapus
 * - Perpindahan status harus berurutan (kecuali closed bisa dari selesai langsung)
 * - Setiap perpindahan status dicatat di order_status_logs
 */
class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nomor_pesanan',
        'customer_id',
        'tanggal_pesanan',
        'deadline',
        'status',
        'diskon_tipe',
        'diskon_nilai',
        'catatan_diskon',
        'catatan',
        'subtotal',
        'total_harga',
    ];

    protected $casts = [
        'tanggal_pesanan' => 'date',
        'deadline' => 'date',
        'subtotal' => 'integer',
        'total_harga' => 'integer',
        'diskon_nilai' => 'decimal:2',
    ];

    /** Urutan status valid */
    public const STATUS_FLOW = ['pending', 'diproses', 'produksi', 'selesai', 'closed'];

    /** Relasi ke customer */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * Relasi ke item-item pesanan.
     * Eager load produk untuk tampilan detail.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /** Relasi ke riwayat pengiriman (partial delivery) */
    public function shipments(): HasMany
    {
        return $this->hasMany(OrderShipment::class, 'order_id');
    }

    /** Relasi ke riwayat status */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class, 'order_id');
    }

    /** Relasi ke log produksi */
    public function productionLogs(): HasMany
    {
        return $this->hasMany(ProductionLog::class, 'order_id');
    }

    /** Relasi ke arus kas yang mereferensikan pesanan ini */
    public function cashFlows(): HasMany
    {
        return $this->hasMany(CashFlow::class, 'referensi_order');
    }

    /**
     * Generate nomor pesanan berikutnya.
     * Format: ORD-YYYYMMDD-XXX (3 digit sequence)
     *
     * @return string
     */
    public static function generateNomor(): string
    {
        $today = now()->format('Ymd');
        $prefix = "ORD-{$today}-";

        $lastOrder = static::withTrashed()
            ->where('nomor_pesanan', 'like', $prefix . '%')
            ->orderBy('nomor_pesanan', 'desc')
            ->first();

        if ($lastOrder) {
            $lastSeq = (int) substr($lastOrder->nomor_pesanan, -3);
            return $prefix . str_pad($lastSeq + 1, 3, '0', STR_PAD_LEFT);
        }

        return $prefix . '001';
    }

    /**
     * Accessor: hitung persentase progress produksi.
     * Progress = (total jumlah_diproduksi / total kuantitas) × 100
     *
     * @return float
     */
    public function getProgressProduksiAttribute(): float
    {
        $totalKuantitas = $this->items->sum('kuantitas');
        if ($totalKuantitas === 0) {
            return 0;
        }
        $totalDiproduksi = $this->items->sum('jumlah_diproduksi');
        return round(($totalDiproduksi / $totalKuantitas) * 100, 1);
    }

    /**
     * Cek apakah order bisa dipindah ke status berikutnya.
     *
     * @param string $newStatus
     * @return bool
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $currentIndex = array_search($this->status, self::STATUS_FLOW);
        $newIndex = array_search($newStatus, self::STATUS_FLOW);

        if ($currentIndex === false || $newIndex === false) {
            return false;
        }

        // Hanya boleh maju satu step (atau closed langsung dari selesai)
        return $newIndex === $currentIndex + 1;
    }

    /** Scope: pesanan aktif (belum closed) */
    public function scopeAktif($query)
    {
        return $query->whereNotIn('status', ['closed']);
    }
}
