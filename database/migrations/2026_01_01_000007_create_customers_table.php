<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create customers table
 *
 * Master data customer/pembeli produk Provillo.
 * - kode_customer: auto-generate oleh sistem (format: CUST-XXXX)
 * - kategori: segmen customer (eceran, grosir, reseller, b2b)
 * - Soft delete agar histori pesanan tetap valid
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('kode_customer', 20)->unique(); // Auto-generate: CUST-0001
            $table->string('nama_customer', 255); // Nama toko/perusahaan
            $table->string('nama_penanggungjawab', 255); // Nama PIC
            $table->enum('kategori', ['eceran', 'grosir', 'reseller', 'b2b'])->default('eceran');
            $table->string('nomor_hp', 20);
            $table->string('email', 100)->nullable();
            $table->text('alamat')->nullable();
            $table->string('kota', 100)->nullable();
            $table->text('catatan')->nullable();
            $table->enum('status', ['aktif', 'tidak aktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes(); // Soft delete agar histori pesanan tetap valid

            $table->index('status');
            $table->index('kategori');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
