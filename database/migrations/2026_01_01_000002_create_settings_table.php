<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Create settings table
 *
 * Tabel singleton (id=1 selalu) untuk konfigurasi sistem global.
 * Data digunakan oleh semua template PDF, header aplikasi, dll.
 * Didesain sebagai singleton (hanya satu baris) agar mudah diakses.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary()->default(1);
            $table->string('nama_usaha', 255)->nullable();
            $table->text('deskripsi')->nullable();
            $table->text('alamat')->nullable();
            $table->string('telepon', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('logo_path', 255)->nullable(); // path logo di storage/public
            $table->string('npwp', 25)->nullable();
            $table->timestamps();
        });

        // Seed default setting row (singleton id=1)
        DB::table('settings')->insert([
            'id' => 1,
            'nama_usaha' => 'Provillo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
