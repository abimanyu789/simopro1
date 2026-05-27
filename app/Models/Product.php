<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model: Product
 *
 * Master data produk sepatu Provillo.
 * - ukuran_tersedia: JSON array, di-cast otomatis menjadi PHP array
 * - foto_produk: JSON array path foto, di-cast otomatis
 * - SoftDeletes: agar histori order_items tetap valid setelah produk "dihapus"
 */
class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'kategori_id',
        'warna',
        'harga_jual',
        'ukuran_tersedia',
        'foto_produk',
        'deskripsi',
        'status',
    ];

    /** Cast JSON fields menjadi array PHP secara otomatis */
    protected $casts = [
        'ukuran_tersedia' => 'array', // ["38","39","40","41","42"]
        'foto_produk' => 'array',     // ["path/to/photo1.jpg", ...]
        'harga_jual' => 'integer',
    ];

    /**
     * Relasi ke kategori produk.
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'kategori_id');
    }

    /**
     * Relasi ke item-item dalam pesanan yang menggunakan produk ini.
     * Digunakan untuk validasi delete (produk tidak boleh dihapus jika ada di order aktif).
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'produk_id');
    }

    /**
     * Relasi ke stok produk (multiple rows per ukuran+warna).
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(ProductStock::class, 'produk_id');
    }

    /**
     * Relasi ke Bill of Materials produk ini.
     */
    public function bom(): HasMany
    {
        return $this->hasMany(ProductBom::class, 'produk_id');
    }

    /**
     * Scope: hanya produk aktif.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Accessor: URL foto pertama (untuk tampilan thumbnail).
     *
     * @return string|null
     */
    public function getFotoUtamaAttribute(): ?string
    {
        if (empty($this->foto_produk)) {
            return null;
        }
        return asset('storage/' . $this->foto_produk[0]);
    }
}
