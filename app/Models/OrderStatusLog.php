<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model: OrderStatusLog (Riwayat Status Pesanan)
 *
 * Setiap baris = satu perpindahan status pada pesanan.
 * Ditampilkan di modal Detail Pesanan sebagai timeline riwayat.
 * changed_by nullable karena status bisa berubah otomatis oleh sistem.
 */
class OrderStatusLog extends Model
{
    protected $table = 'order_status_logs';

    public $timestamps = false; // Hanya created_at, tidak ada updated_at

    protected $fillable = [
        'order_id',
        'status_lama',
        'status_baru',
        'catatan',
        'changed_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /** Relasi ke pesanan */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /** Relasi ke user yang mengubah status (nullable) */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Boot: set created_at otomatis jika belum di-set.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if (!$model->created_at) {
                $model->created_at = now();
            }
        });
    }
}
