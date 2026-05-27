<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create raw_materials table
 *
 * Master data bahan baku untuk produksi sepatu.
 * - satuan: unit pengukuran bahan (pcs, meter, kg, liter, roll)
 * - harga_beli: harga beli per satuan
 * - Soft delete agar histori produksi tetap valid
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raw_materials', function (Blueprint $table) {
            $table->id();
            $table->string('kode_bahan', 50)->unique(); // SKU unik bahan baku
            $table->string('nama_bahan', 255);
            $table->foreignId('kategori_id')->constrained('categories')->restrictOnDelete();
            $table->enum('satuan', ['pcs', 'meter', 'kg', 'liter', 'roll', 'lembar', 'pasang']);
            $table->unsignedBigInteger('harga_beli'); // Harga beli per satuan dalam Rupiah
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'tidak aktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes(); // Soft delete untuk menjaga histori produksi

            $table->index('status');
            $table->index('kategori_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raw_materials');
    }
};
