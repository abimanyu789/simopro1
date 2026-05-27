<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Model: ProductStock (Stok Produk)
 *
 * Stok produk per kombinasi produk+ukuran+warna.
 * Dibuat otomatis saat produk baru ditambahkan.
 *
 * PENTING:
 * - stok_saat_ini TIDAK boleh diubah langsung via update()
 * - Semua perubahan stok harus melalui StockService::adjust()
 * - Status stok dikalkulasi via Eloquent Accessor (backend, bukan frontend)
 */
class ProductStock extends Model
{
    protected $table = 'product_stocks';

    protected $fillable = [
        'produk_id',
        'ukuran',
        'warna',
        'stok_saat_ini',
        'stok_minimum',
        'keterangan',
    ];

    protected $casts = [
        'stok_saat_ini' => 'integer',
        'stok_minimum' => 'integer',
    ];

    /** Relasi ke produk */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'produk_id')->withTrashed();
    }

    /**
     * Relasi polymorphic ke stock_logs.
     * Semua perubahan stok produk ini tercatat di sini.
     */
    public function stockLogs(): MorphMany
    {
        return $this->morphMany(StockLog::class, 'stockable');
    }

    /**
     * Accessor: Status stok dikalkulasi di BACKEND (bukan frontend).
     *
     * tersedia = stok >= minimum
     * menipis  = stok < minimum && stok > 0
     * habis    = stok = 0
     *
     * @return string
     */
    public function getStatusStokAttribute(): string
    {
        if ($this->stok_saat_ini === 0) {
            return 'habis';
        }
        if ($this->stok_saat_ini < $this->stok_minimum) {
            return 'menipis';
        }
        return 'tersedia';
    }

    /**
     * Scope: stok yang perlu diperhatikan (menipis atau habis).
     * Digunakan untuk badge notifikasi di sidebar.
     */
    public function scopePerluPerhatian($query)
    {
        return $query->where(function ($q) {
            $q->where('stok_saat_ini', 0)
              ->orWhereColumn('stok_saat_ini', '<', 'stok_minimum');
        });
    }
}
