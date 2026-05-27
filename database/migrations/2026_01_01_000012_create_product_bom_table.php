<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create product_bom table (Bill of Materials) - P0-BLOCKER
 *
 * BOM mendefinisikan kebutuhan bahan baku per unit produk.
 * Contoh: Sepatu model X ukuran 40 membutuhkan:
 * - 0.5 meter kulit sapi
 * - 2 pcs sol karet
 *
 * BOM digunakan saat produksi selesai untuk:
 * - Otomatis mengurangi stok bahan baku
 * - Kalkulasi: jumlah_produksi × jumlah_per_unit per bahan
 *
 * jumlah_per_unit menggunakan DECIMAL agar bisa menyimpan pecahan
 * (misal 0.5 meter per pasang sepatu)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_bom', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produk_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('bahan_id')->constrained('raw_materials')->restrictOnDelete();
            // Jumlah bahan per unit produk - DECIMAL untuk mendukung pecahan
            $table->decimal('jumlah_per_unit', 10, 3)->comment('misal: 0.5 m² kulit per pasang sepatu');
            $table->string('satuan', 20)->nullable(); // Satuan opsional (override dari bahan baku)
            $table->timestamps();

            // Unique constraint: satu produk hanya boleh punya satu entry per bahan
            $table->unique(['produk_id', 'bahan_id']);
            $table->index('produk_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_bom');
    }
};
