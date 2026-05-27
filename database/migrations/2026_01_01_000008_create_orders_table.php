<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create orders table
 *
 * Header pesanan customer. Setiap pesanan memiliki status yang berurutan:
 * Pending → Diproses → Produksi → Selesai → Closed
 *
 * Field penting:
 * - nomor_pesanan: auto-generate format ORD-YYYYMMDD-XXX
 * - subtotal: total sebelum diskon (kalkulasi dari order_items)
 * - total_harga: total setelah diskon
 * - diskon_tipe/nilai: diskon bisa persen atau nominal
 * - Soft delete: hanya order Pending yang bisa dihapus (business rule)
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pesanan', 30)->unique(); // ORD-20240101-001
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->date('tanggal_pesanan');
            $table->date('deadline');
            $table->enum('status', ['pending', 'diproses', 'produksi', 'selesai', 'closed'])->default('pending');
            $table->enum('diskon_tipe', ['persen', 'nominal'])->nullable();
            $table->decimal('diskon_nilai', 12, 2)->nullable()->default(0);
            $table->string('catatan_diskon')->nullable();
            $table->text('catatan')->nullable();
            $table->unsignedBigInteger('subtotal')->default(0); // Total sebelum diskon
            $table->unsignedBigInteger('total_harga')->default(0); // Total setelah diskon
            $table->timestamps();
            $table->softDeletes(); // Soft delete, hanya Pending yang bisa dihapus

            // Index untuk filter status dan customer
            $table->index('status');
            $table->index('customer_id');
            $table->index('tanggal_pesanan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
