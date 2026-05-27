<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model: Employee (Karyawan)
 *
 * Data karyawan yang terlibat dalam produksi.
 * Field kritis:
 * - upah_borongan: nominal upah per unit (untuk kalkulasi otomatis)
 * - jenis_kelamin: wajib ada (P0 requirement)
 */
class Employee extends Model
{
    use SoftDeletes;

    protected $table = 'employees';

    protected $fillable = [
        'foto_karyawan',
        'nama_karyawan',
        'divisi',
        'posisi',
        'jenis_kelamin',
        'tanggal_lahir',
        'nomor_hp',
        'email',
        'alamat',
        'tanggal_bergabung',
        'nomor_rekening',
        'upah_borongan',
        'deskripsi',
        'status',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_bergabung' => 'date',
        'upah_borongan' => 'decimal:2',
    ];

    /**
     * Relasi ke log produksi karyawan ini.
     * Digunakan untuk cek apakah karyawan masih punya produksi aktif sebelum hapus.
     */
    public function productionLogs(): HasMany
    {
        return $this->hasMany(ProductionLog::class, 'karyawan_id');
    }

    /**
     * Relasi ke log produksi yang masih dalam proses.
     * Business rule: karyawan tidak boleh dihapus jika masih ada produksi aktif.
     */
    public function productionLogsAktif(): HasMany
    {
        return $this->hasMany(ProductionLog::class, 'karyawan_id')
            ->where('status', 'dalam_proses');
    }

    /** Scope: hanya karyawan aktif */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Accessor: URL foto karyawan.
     *
     * @return string|null
     */
    public function getFotoUrlAttribute(): ?string
    {
        if (!$this->foto_karyawan) {
            return null;
        }
        return asset('storage/' . $this->foto_karyawan);
    }
}
