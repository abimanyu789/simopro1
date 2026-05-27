<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Model: StockLog (Log Pergerakan Stok)
 *
 * Audit trail lengkap semua perubahan stok.
 * Menggunakan polymorphic relation ke ProductStock ATAU RawMaterialStock.
 *
 * Semua record di sini hanya dibuat oleh StockService::adjust(),
 * TIDAK dari model langsung.
 */
class StockLog extends Model
{
    protected $table = 'stock_logs';

    public $timestamps = false; // Hanya created_at

    protected $fillable = [
        'stockable_type',
        'stockable_id',
        'jenis',
        'jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'keterangan',
        'referensi_tipe',
        'referensi_id',
        'created_by',
    ];

    protected $casts = [
        'jumlah' => 'decimal:3',
        'stok_sebelum' => 'decimal:3',
        'stok_sesudah' => 'decimal:3',
        'created_at' => 'datetime',
    ];

    /**
     * Relasi polymorphic: bisa ke ProductStock atau RawMaterialStock.
     */
    public function stockable(): MorphTo
    {
        return $this->morphTo();
    }

    /** Relasi ke user yang membuat log */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Boot: set created_at otomatis */
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
