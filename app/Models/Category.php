<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model: Category
 *
 * Kategori dipakai oleh products dan raw_materials.
 * Field 'tipe' membedakan apakah kategori untuk produk, bahan baku, atau keduanya.
 */
class Category extends Model
{
    protected $fillable = [
        'nama_kategori',
        'tipe',  // product | raw_material | both
        'deskripsi',
    ];

    /**
     * Relasi ke produk-produk dalam kategori ini.
     *
     * @return HasMany
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'kategori_id');
    }

    /**
     * Relasi ke bahan baku dalam kategori ini.
     *
     * @return HasMany
     */
    public function rawMaterials(): HasMany
    {
        return $this->hasMany(RawMaterial::class, 'kategori_id');
    }
}
