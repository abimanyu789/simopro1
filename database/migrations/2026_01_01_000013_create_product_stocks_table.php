<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create product_stocks table
 *
 * Stok produk per SKU + ukuran + warna.
 * Entry otomatis dibuat saat produk baru ditambah (event model).
 *
 * Status stok dikalkulasi via Eloquent Accessor (backend):
 * - tersedia: stok_saat_ini >= stok_minimum
 * - menipis: stok_saat_ini < stok_minimum && stok_saat_ini > 0
 * - habis: stok_saat_ini = 0
 *
 * PENTING: stok_saat_ini TIDAK bisa diedit langsung.
 * Hanya bisa berubah via StockService::adjust()
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produk_id')->constrained('products')->cascadeOnDelete();
            $table->string('ukuran', 10); // Ukuran produk
            $table->string('warna', 100); // Warna produk
            $table->unsignedInteger('stok_saat_ini')->default(0); // Hanya via StockService
            $table->unsignedInteger('stok_minimum')->default(5); // Threshold alert
            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Unique: satu entry per kombinasi produk+ukuran+warna
            $table->unique(['produk_id', 'ukuran', 'warna']);
            $table->index('produk_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_stocks');
    }
};
