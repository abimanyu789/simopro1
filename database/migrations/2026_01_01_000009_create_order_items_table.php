<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create order_items table
 *
 * Detail item per pesanan.
 *
 * PENTING - Snapshot Pattern:
 * - ukuran dan warna di sini adalah SNAPSHOT saat pesanan dibuat
 * - harga_satuan adalah SNAPSHOT dari products.harga_jual saat order dibuat
 * - Perubahan data master produk tidak akan mengubah data pesanan lama
 *
 * Field tracking:
 * - jumlah_dikirim: tracking partial delivery (update via OrderShipment)
 * - jumlah_diproduksi: tracking progress produksi (update via ProductionLog)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('produk_id')->constrained('products')->restrictOnDelete();
            $table->string('ukuran', 10); // SNAPSHOT - ukuran saat order dibuat
            $table->string('warna', 100); // SNAPSHOT - warna saat order dibuat
            $table->unsignedInteger('kuantitas'); // Jumlah unit yang dipesan
            $table->unsignedInteger('jumlah_dikirim')->default(0); // P0: tracking pengiriman
            $table->unsignedInteger('jumlah_diproduksi')->default(0); // Tracking produksi
            $table->unsignedBigInteger('harga_satuan'); // SNAPSHOT harga saat order
            $table->unsignedBigInteger('subtotal_item'); // harga_satuan × kuantitas
            $table->timestamps();

            // Index untuk query produksi dan pengiriman
            $table->index('order_id');
            $table->index('produk_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
