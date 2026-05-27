<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create categories table
 *
 * Kategori digunakan oleh products dan raw_materials.
 * Tipe kategori membedakan apakah kategori untuk produk atau bahan baku.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kategori', 100);
            // Tipe: product = untuk produk, raw_material = untuk bahan baku, both = keduanya
            $table->enum('tipe', ['product', 'raw_material', 'both'])->default('both');
            $table->text('deskripsi')->nullable();
            $table->timestamps();

            // Index untuk pencarian cepat
            $table->index('tipe');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
