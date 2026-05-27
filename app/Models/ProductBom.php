<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model: ProductBom (Bill of Materials)
 *
 * Menghubungkan produk ke bahan baku yang dibutuhkan per unit.
 * Contoh: Sepatu Model X butuh 0.5 meter kulit + 2 pcs sol.
 *
 * Digunakan oleh ProductionLogService saat produksi selesai
 * untuk mengurangi stok bahan baku secara otomatis.
 * Formula: jumlah_bahan = bom.jumlah_per_unit × production_log.jumlah_produksi
 */
class ProductBom extends Model
{
    protected $table = 'product_bom';

    protected $fillable = [
        'produk_id',
        'bahan_id',
        'jumlah_per_unit',
        'satuan',
    ];

    protected $casts = [
        'jumlah_per_unit' => 'decimal:3',
    ];

    /** Relasi ke produk */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'produk_id')->withTrashed();
    }

    /** Relasi ke bahan baku */
    public function bahan(): BelongsTo
    {
        return $this->belongsTo(RawMaterial::class, 'bahan_id')->withTrashed();
    }
}
