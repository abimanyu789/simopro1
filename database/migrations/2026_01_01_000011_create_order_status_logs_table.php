<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create order_status_logs table
 *
 * Audit trail untuk setiap perpindahan status pesanan.
 * Setiap kali status order berubah, sistem mencatat:
 * - status sebelumnya
 * - status baru
 * - siapa yang mengubah (user)
 * - kapan diubah
 * - catatan opsional
 *
 * Data ini ditampilkan di modal Detail Pesanan sebagai "Riwayat Status".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('status_lama', 50)->nullable(); // null = order baru dibuat
            $table->string('status_baru', 50);
            $table->text('catatan')->nullable();
            // User yang mengubah status (nullable karena bisa auto-system)
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_logs');
    }
};
