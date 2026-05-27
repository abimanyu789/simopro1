<?php

namespace App\Services;

use App\Models\OrderShipment;
use App\Models\OrderItem;
use App\Models\Order;
use App\Models\ProductStock;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Service: OrderShipmentService
 *
 * Mengelola flow partial delivery (Pengiriman).
 */
class OrderShipmentService
{
    /**
     * Catat pengiriman baru (partial atau full).
     * Mengurangi stok produk jadi (stok_keluar).
     */
    public static function create(array $data): OrderShipment
    {
        return DB::transaction(function () use ($data) {
            $orderItem = OrderItem::with('produk')->findOrFail($data['order_item_id']);
            $order = Order::findOrFail($orderItem->order_id);

            // Validasi sisa yang belum dikirim
            $sisaBelumDikirim = $orderItem->sisa_dikirim;
            if ($data['jumlah_dikirim'] > $sisaBelumDikirim) {
                throw ValidationException::withMessages([
                    'jumlah_dikirim' => "Jumlah dikirim ({$data['jumlah_dikirim']}) melebihi sisa yang belum dikirim ({$sisaBelumDikirim} unit)."
                ]);
            }

            // 1. Catat ke order_shipments
            $shipment = OrderShipment::create([
                'order_id' => $order->id,
                'order_item_id' => $orderItem->id,
                'tanggal_kirim' => $data['tanggal_kirim'],
                'jumlah_dikirim' => $data['jumlah_dikirim'],
                'catatan' => $data['catatan'] ?? null,
                'status' => 'dikirim',
            ]);

            // 2. Update jumlah_dikirim di order_items
            $orderItem->increment('jumlah_dikirim', $data['jumlah_dikirim']);

            // 3. Kurangi stok produk via StockService
            $productStock = ProductStock::firstOrCreate(
                [
                    'produk_id' => $orderItem->produk_id,
                    'ukuran' => $orderItem->ukuran,
                    'warna' => $orderItem->warna
                ],
                ['stok_minimum' => 5]
            );

            StockService::adjust(
                $productStock,
                - (float) $data['jumlah_dikirim'],
                'stok_keluar',
                "Pengiriman pesanan #{$order->nomor_pesanan}",
                OrderShipment::class,
                $shipment->id
            );

            return $shipment;
        });
    }
}
