<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create stock_logs table
 *
 * Audit trail lengkap untuk SEMUA perubahan stok (produk dan bahan baku).
 * Menggunakan morphable pattern (stockable_type + stockable_id) agar
 * satu tabel bisa melayani dua jenis stok.
 *
 * Jenis movement:
 * - stok_masuk: penambahan manual
 * - stok_keluar: pengiriman (partial delivery)
 * - adjustment: koreksi manual
 * - hasil_produksi: stok produk bertambah dari produksi
 * - pemakaian_produksi: stok bahan berkurang untuk produksi
 *
 * PENTING: Semua perubahan stok WAJIB melalui StockService::adjust()
 * yang secara otomatis mencatat ke tabel ini dalam DB transaction.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_logs', function (Blueprint $table) {
            $table->id();
            // Polymorphic: bisa ke product_stocks atau raw_material_stocks
            $table->morphs('stockable'); // stockable_type + stockable_id
            $table->enum('jenis', ['stok_masuk', 'stok_keluar', 'adjustment', 'hasil_produksi', 'pemakaian_produksi']);
            $table->decimal('jumlah', 12, 3); // Positif = masuk, Negatif = keluar
            $table->decimal('stok_sebelum', 12, 3)->default(0); // Stok sebelum perubahan
            $table->decimal('stok_sesudah', 12, 3)->default(0); // Stok sesudah perubahan
            $table->text('keterangan')->nullable(); // Keterangan perubahan
            // Referensi ke transaksi sumber (optional)
            $table->string('referensi_tipe', 50)->nullable(); // ProductionLog, OrderShipment, dll
            $table->unsignedBigInteger('referensi_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index('jenis');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_logs');
    }
};
