<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Model: User
 *
 * User adalah admin atau owner sistem Provillo.
 * Autentikasi menggunakan username + password (bukan email).
 * Role menentukan level akses: admin (full) atau owner (view+approve).
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Kolom yang dapat diisi secara mass-assignment.
     * username: untuk login (bukan email)
     * role: admin | owner
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'foto',
    ];

    /** Kolom yang disembunyikan dalam serialisasi JSON */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /** Casting tipe data otomatis */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Cek apakah user adalah admin.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Cek apakah user adalah owner.
     *
     * @return bool
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }
}
