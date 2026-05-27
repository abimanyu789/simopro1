<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model: RawMaterial
 *
 * Master data bahan baku untuk produksi sepatu.
 * Setelah bahan baku dibuat, raw_material_stocks otomatis dibuat (via Observer/event).
 */
class RawMaterial extends Model
{
    use SoftDeletes;

    protected $table = 'raw_materials';

    protected $fillable = [
        'kode_bahan',
        'nama_bahan',
        'kategori_id',
        'satuan',
        'harga_beli',
        'deskripsi',
        'status',
    ];

    protected $casts = [
        'harga_beli' => 'integer',
    ];

    /** Relasi ke kategori bahan baku */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'kategori_id');
    }

    /**
     * Relasi ke stok bahan baku (satu entry per bahan).
     */
    public function stock(): HasOne
    {
        return $this->hasOne(RawMaterialStock::class, 'bahan_id');
    }

    /**
     * Relasi ke BOM yang menggunakan bahan baku ini.
     * Digunakan untuk validasi delete.
     */
    public function productBoms(): HasMany
    {
        return $this->hasMany(ProductBom::class, 'bahan_id');
    }

    /** Scope: hanya bahan aktif */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }
}
