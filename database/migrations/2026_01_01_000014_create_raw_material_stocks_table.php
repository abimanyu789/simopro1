<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create raw_material_stocks table
 *
 * Stok bahan baku per material.
 * Struktur serupa dengan product_stocks.
 *
 * Stok berkurang otomatis saat produksi selesai (via BOM × jumlah_produksi).
 * Stok bertambah melalui form "Tambah Stok" atau import.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raw_material_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bahan_id')->constrained('raw_materials')->cascadeOnDelete();
            $table->decimal('stok_saat_ini', 12, 3)->default(0); // Decimal untuk bahan seperti meter/kg
            $table->decimal('stok_minimum', 12, 3)->default(0); // Threshold alert
            $table->string('satuan', 20)->nullable(); // Override satuan dari bahan baku
            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Unique: satu entry per bahan baku
            $table->unique('bahan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raw_material_stocks');
    }
};
