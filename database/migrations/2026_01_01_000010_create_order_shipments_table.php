<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create order_shipments table (P0-BLOCKER)
 *
 * Tabel untuk tracking partial delivery pesanan.
 * Setiap baris = satu kejadian pengiriman (sebagian atau seluruh item).
 *
 * Flow:
 * Admin klik "Tambah Pengiriman" → isi form → sistem catat di sini
 * + update order_items.jumlah_dikirim
 * + kurangi product_stocks via StockService
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->restrictOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items')->restrictOnDelete();
            $table->date('tanggal_kirim');
            $table->unsignedInteger('jumlah_dikirim'); // Jumlah unit yang dikirim
            $table->enum('status', ['dikirim', 'diterima', 'dikembalikan'])->default('dikirim');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('order_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_shipments');
    }
};
