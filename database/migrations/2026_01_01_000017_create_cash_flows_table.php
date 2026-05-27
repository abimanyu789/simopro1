<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create cash_flows table
 *
 * Arus kas operasional bisnis Provillo.
 * Mencatat semua transaksi keuangan masuk dan keluar.
 *
 * Kategori Pemasukan: penjualan, pemasukan_lainnya
 * Kategori Pengeluaran: operasional, belanja_bahan, upah_karyawan, pengambilan_pribadi
 *
 * referensi_order: opsional, menghubungkan transaksi ke pesanan tertentu
 * bukti_transaksi: path foto bukti pembayaran/kwitansi
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_flows', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal_transaksi');
            $table->enum('jenis', ['pemasukan', 'pengeluaran']);
            $table->string('kategori', 50); // Validated per jenis in backend
            $table->string('deskripsi', 500);
            $table->unsignedBigInteger('nominal'); // Nilai dalam Rupiah (integer)
            $table->foreignId('referensi_order')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('bukti_transaksi')->nullable(); // Path foto bukti
            $table->text('catatan')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('jenis');
            $table->index('tanggal_transaksi');
            $table->index('kategori');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_flows');
    }
};
