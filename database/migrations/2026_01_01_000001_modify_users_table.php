<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Modify users table
 *
 * Menambahkan field username dan role ke tabel users bawaan Laravel
 * untuk mendukung sistem autentikasi berbasis username (bukan email)
 * dan RBAC sederhana (admin/owner).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Tambah field username (unique) untuk login
            $table->string('username')->unique()->after('id');
            // Tambah role untuk RBAC: admin (full access) atau owner (view+approve)
            $table->enum('role', ['admin', 'owner'])->default('admin')->after('password');
            // Tambah field foto profil (opsional)
            $table->string('foto')->nullable()->after('role');
            // Email tidak wajib di sistem ini
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'role', 'foto']);
        });
    }
};
