<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model: Customer
 *
 * Data customer Provillo.
 * kode_customer di-generate otomatis oleh sistem saat create.
 * Business rule: tidak boleh dihapus jika masih ada order aktif (bukan closed).
 */
class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'kode_customer',
        'nama_customer',
        'nama_penanggungjawab',
        'kategori',
        'nomor_hp',
        'email',
        'alamat',
        'kota',
        'catatan',
        'status',
    ];

    /** Relasi ke semua pesanan customer ini */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    /**
     * Relasi ke pesanan yang masih aktif (bukan closed).
     * Digunakan untuk validasi delete.
     */
    public function ordersAktif(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id')
            ->whereNotIn('status', ['closed']);
    }

    /**
     * Generate kode customer berikutnya.
     * Format: CUST-XXXX (4 digit, zero-padded)
     *
     * @return string
     */
    public static function generateKode(): string
    {
        $last = static::withTrashed()->orderBy('id', 'desc')->first();
        $nextNumber = $last ? ($last->id + 1) : 1;
        return 'CUST-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /** Scope: hanya customer aktif */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }
}
