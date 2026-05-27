<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model: OrderShipment (Riwayat Pengiriman)
 *
 * Setiap baris = satu kejadian pengiriman (partial atau full).
 * Dibuat ketika admin klik "Tambah Pengiriman" di halaman pesanan.
 */
class OrderShipment extends Model
{
    protected $table = 'order_shipments';

    protected $fillable = [
        'order_id',
        'order_item_id',
        'tanggal_kirim',
        'jumlah_dikirim',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_kirim' => 'date',
        'jumlah_dikirim' => 'integer',
    ];

    /** Relasi ke header pesanan */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /** Relasi ke item pesanan yang dikirim */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }
}
