<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Model: RawMaterialStock (Stok Bahan Baku)
 *
 * Satu entry per bahan baku.
 * Menggunakan DECIMAL untuk mendukung bahan yang diukur dalam pecahan
 * (misal: 0.5 meter kulit, 2.5 kg bahan).
 *
 * Status stok dikalkulasi di backend via Eloquent Accessor,
 * bukan di React frontend.
 */
class RawMaterialStock extends Model
{
    protected $table = 'raw_material_stocks';

    protected $fillable = [
        'bahan_id',
        'stok_saat_ini',
        'stok_minimum',
        'satuan',
        'keterangan',
    ];

    protected $casts = [
        'stok_saat_ini' => 'decimal:3',
        'stok_minimum' => 'decimal:3',
    ];

    /** Relasi ke bahan baku */
    public function bahan(): BelongsTo
    {
        return $this->belongsTo(RawMaterial::class, 'bahan_id')->withTrashed();
    }

    /** Relasi polymorphic ke stock_logs */
    public function stockLogs(): MorphMany
    {
        return $this->morphMany(StockLog::class, 'stockable');
    }

    /**
     * Accessor: Status stok (backend calculation, bukan di frontend).
     *
     * @return string tersedia|menipis|habis
     */
    public function getStatusStokAttribute(): string
    {
        if ((float) $this->stok_saat_ini <= 0) {
            return 'habis';
        }
        if ((float) $this->stok_saat_ini < (float) $this->stok_minimum) {
            return 'menipis';
        }
        return 'tersedia';
    }

    /** Scope: stok yang perlu diperhatikan */
    public function scopePerluPerhatian($query)
    {
        return $query->where(function ($q) {
            $q->where('stok_saat_ini', '<=', 0)
              ->orWhereColumn('stok_saat_ini', '<', 'stok_minimum');
        });
    }
}
