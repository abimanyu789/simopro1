<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create products table
 *
 * Master data produk sepatu Provillo.
 * - kode_produk: SKU unik, diinput manual oleh admin
 * - ukuran_tersedia: JSON array ukuran yang tersedia (misal: ["38","39","40","41","42"])
 * - foto_produk: JSON array path foto (multiple photo support)
 * - Soft delete untuk menjaga histori di order_items
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('kode_produk', 50)->unique(); // SKU unik
            $table->string('nama_produk', 255);
            $table->foreignId('kategori_id')->constrained('categories')->restrictOnDelete();
            $table->string('warna', 100);
            $table->unsignedBigInteger('harga_jual'); // Harga dalam Rupiah (integer)
            $table->json('ukuran_tersedia'); // ["38","39","40","41","42"]
            $table->json('foto_produk')->nullable(); // Array path foto
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'tidak aktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes(); // Soft delete agar histori pesanan tetap valid

            // Index untuk pencarian dan filter
            $table->index('status');
            $table->index('kategori_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
