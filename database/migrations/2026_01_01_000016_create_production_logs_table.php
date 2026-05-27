<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create production_logs table
 *
 * Log produksi harian karyawan.
 * Setiap baris = satu sesi produksi oleh satu karyawan untuk satu item pesanan.
 *
 * Kalkulasi otomatis (dilakukan di backend - ProductionLogService):
 * - upah_borongan = jumlah_produksi × employees.upah_borongan
 *
 * Ketika status berubah ke 'selesai':
 * 1. Stok bahan baku berkurang (via BOM × jumlah_produksi)
 * 2. Stok produk bertambah
 * 3. order_items.jumlah_diproduksi diperbarui
 * 4. Cek apakah semua item order sudah selesai → update order status
 *
 * Ketika log dihapus (rollback):
 * 1. Semua efek di atas di-reverse dalam DB::transaction
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->restrictOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items')->restrictOnDelete();
            $table->foreignId('karyawan_id')->constrained('employees')->restrictOnDelete();
            $table->date('tanggal_produksi');
            $table->date('tanggal_selesai_produksi')->nullable();
            $table->unsignedInteger('jumlah_produksi'); // Unit yang diproduksi
            $table->decimal('upah_borongan', 12, 2)->default(0); // jumlah × upah_per_unit
            $table->enum('status', ['dalam_proses', 'selesai'])->default('dalam_proses');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('karyawan_id');
            $table->index('status');
            $table->index('order_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_logs');
    }
};
