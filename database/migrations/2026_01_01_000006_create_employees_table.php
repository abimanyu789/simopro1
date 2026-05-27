<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create employees table
 *
 * Master data karyawan Provillo.
 * Field penting:
 * - upah_borongan: upah per unit produksi (digunakan untuk kalkulasi otomatis)
 * - jenis_kelamin: wajib untuk laporan dan kalkulasi masa depan
 * - Soft delete agar histori produksi tetap valid
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('foto_karyawan')->nullable(); // Path foto karyawan di storage
            $table->string('nama_karyawan', 255);
            $table->string('divisi', 100); // Divisi/departemen karyawan
            $table->string('posisi', 100); // Jabatan karyawan
            $table->enum('jenis_kelamin', ['laki-laki', 'perempuan']); // Wajib - P0 requirement
            $table->date('tanggal_lahir');
            $table->string('nomor_hp', 20);
            $table->string('email', 100)->nullable();
            $table->text('alamat')->nullable();
            $table->date('tanggal_bergabung');
            $table->string('nomor_rekening', 50)->nullable(); // Untuk transfer gaji
            $table->decimal('upah_borongan', 12, 2)->default(0); // Upah per unit produksi - P0 requirement
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'nonaktif', 'cuti'])->default('aktif');
            $table->timestamps();
            $table->softDeletes(); // Soft delete agar histori produksi tetap valid

            $table->index('status');
            $table->index('divisi');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
