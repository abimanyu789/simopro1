<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model: CashFlow (Arus Kas)
 *
 * Mencatat semua transaksi keuangan operasional Provillo.
 *
 * Kategori valid per jenis:
 * - Pemasukan: penjualan, pemasukan_lainnya
 * - Pengeluaran: operasional, belanja_bahan, upah_karyawan, pengambilan_pribadi
 *
 * referensi_order: opsional, terhubung ke order terkait (misal: pembayaran dari pesanan).
 */
class CashFlow extends Model
{
    protected $table = 'cash_flows';

    protected $fillable = [
        'tanggal_transaksi',
        'jenis',
        'kategori',
        'deskripsi',
        'nominal',
        'referensi_order',
        'bukti_transaksi',
        'catatan',
        'created_by',
    ];

    protected $casts = [
        'tanggal_transaksi' => 'date',
        'nominal' => 'integer',
    ];

    /** Kategori valid untuk setiap jenis transaksi */
    public const KATEGORI_PEMASUKAN = ['penjualan', 'pemasukan_lainnya'];
    public const KATEGORI_PENGELUARAN = ['operasional', 'belanja_bahan', 'upah_karyawan', 'pengambilan_pribadi'];

    /** Relasi ke order yang direferensikan (optional) */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'referensi_order');
    }

    /** Relasi ke user yang membuat transaksi */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Scope: hanya pemasukan */
    public function scopePemasukan($query)
    {
        return $query->where('jenis', 'pemasukan');
    }

    /** Scope: hanya pengeluaran */
    public function scopePengeluaran($query)
    {
        return $query->where('jenis', 'pengeluaran');
    }

    /**
     * Accessor: URL bukti transaksi.
     *
     * @return string|null
     */
    public function getBuktiUrlAttribute(): ?string
    {
        if (!$this->bukti_transaksi) {
            return null;
        }
        return asset('storage/' . $this->bukti_transaksi);
    }
}
