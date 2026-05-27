<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model: ProductionLog (Log Produksi)
 *
 * Mencatat sesi produksi karyawan per order item.
 * Business rules:
 * - Hanya untuk order status diproses/produksi
 * - jumlah_produksi tidak boleh melebihi sisa (kuantitas - jumlah_diproduksi)
 * - Saat status = selesai:
 *   * Stok bahan baku berkurang (via BOM)
 *   * Stok produk bertambah
 *   * order_items.jumlah_diproduksi diperbarui
 * - Saat dihapus: semua efek di-rollback dalam DB::transaction
 *
 * upah_borongan dikalkulasi DI BACKEND (ProductionLogService),
 * bukan di React frontend.
 */
class ProductionLog extends Model
{
    protected $table = 'production_logs';

    protected $fillable = [
        'order_id',
        'order_item_id',
        'karyawan_id',
        'tanggal_produksi',
        'tanggal_selesai_produksi',
        'jumlah_produksi',
        'upah_borongan',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_produksi' => 'date',
        'tanggal_selesai_produksi' => 'date',
        'jumlah_produksi' => 'integer',
        'upah_borongan' => 'decimal:2',
    ];

    /** Relasi ke pesanan */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /** Relasi ke item pesanan */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }

    /** Relasi ke karyawan */
    public function karyawan(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'karyawan_id')->withTrashed();
    }

    /** Scope: log yang sudah selesai */
    public function scopeSelesai($query)
    {
        return $query->where('status', 'selesai');
    }

    /** Scope: log yang masih dalam proses */
    public function scopeDalamProses($query)
    {
        return $query->where('status', 'dalam_proses');
    }
}
