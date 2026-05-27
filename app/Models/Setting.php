<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model: Setting (Konfigurasi Sistem)
 *
 * Singleton model - selalu hanya ada satu baris (id=1).
 * Digunakan di semua template PDF dan header aplikasi.
 *
 * Gunakan Setting::get() sebagai helper untuk mengambil settings aktif.
 * JANGAN hardcode nama usaha atau logo di kode.
 */
class Setting extends Model
{
    protected $table = 'settings';

    protected $fillable = [
        'nama_usaha',
        'deskripsi',
        'alamat',
        'telepon',
        'email',
        'logo_path',
        'npwp',
    ];

    /**
     * Ambil konfigurasi sistem (singleton id=1).
     * Dibuat helper statis agar mudah diakses dari mana saja.
     *
     * @return static
     */
    public static function get(): static
    {
        return static::firstOrCreate(
            ['id' => 1],
            ['nama_usaha' => 'Provillo']
        );
    }

    /**
     * Accessor: URL logo perusahaan.
     * Digunakan di header PDF dan navbar.
     *
     * @return string|null
     */
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }
        return asset('storage/' . $this->logo_path);
    }
}
