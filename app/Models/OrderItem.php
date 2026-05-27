<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model: OrderItem (Item Pesanan)
 *
 * Detail item per baris pesanan.
 *
 * SNAPSHOT PATTERN:
 * Field ukuran, warna, dan harga_satuan adalah SNAPSHOT saat pesanan dibuat.
 * Perubahan di master produk tidak mempengaruhi data ini.
 *
 * Tracking fields:
 * - jumlah_dikirim: diperbarui setiap kali ada OrderShipment
 * - jumlah_diproduksi: diperbarui setiap kali ProductionLog selesai
 */
class OrderItem extends Model
{
    protected $table = 'order_items';

    protected $fillable = [
        'order_id',
        'produk_id',
        'ukuran',       // SNAPSHOT
        'warna',        // SNAPSHOT
        'kuantitas',
        'jumlah_dikirim',
        'jumlah_diproduksi',
        'harga_satuan', // SNAPSHOT dari products.harga_jual
        'subtotal_item',
    ];

    protected $casts = [
        'kuantitas' => 'integer',
        'jumlah_dikirim' => 'integer',
        'jumlah_diproduksi' => 'integer',
        'harga_satuan' => 'integer',
        'subtotal_item' => 'integer',
    ];

    /** Relasi ke header pesanan */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * Relasi ke produk (dengan withTrashed agar tetap tampil meski produk di-softdelete).
     */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'produk_id')->withTrashed();
    }

    /** Relasi ke riwayat pengiriman item ini */
    public function shipments(): HasMany
    {
        return $this->hasMany(OrderShipment::class, 'order_item_id');
    }

    /** Relasi ke log produksi item ini */
    public function productionLogs(): HasMany
    {
        return $this->hasMany(ProductionLog::class, 'order_item_id');
    }

    /**
     * Accessor: Sisa quantity yang belum dikirim.
     * Digunakan untuk validasi partial delivery.
     *
     * @return int
     */
    public function getSisaDikirimAttribute(): int
    {
        return max(0, $this->kuantitas - $this->jumlah_dikirim);
    }

    /**
     * Accessor: Sisa quantity yang belum diproduksi.
     * Digunakan untuk validasi input produksi.
     *
     * @return int
     */
    public function getSisaProduksiAttribute(): int
    {
        return max(0, $this->kuantitas - $this->jumlah_diproduksi);
    }
}
