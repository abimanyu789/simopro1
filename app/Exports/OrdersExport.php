<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

/**
 * Class: OrdersExport
 *
 * Tujuan: Mengekspor daftar pesanan beserta rincian customer, harga, dan status ke dalam format Excel (.xlsx).
 * Class ini menggunakan interface dari package Maatwebsite/Excel.
 */
class OrdersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    /**
     * Mengambil seluruh data pesanan yang akan di-export.
     * Menggunakan eager loading pada relasi 'customer' untuk menghindari N+1 query.
     */
    public function collection()
    {
        return Order::with('customer')->latest()->get();
    }

    /**
     * Mapping data per baris yang akan ditulis ke file Excel.
     * 
     * @param Order $order Instansi model order dari collection
     * @return array Array data yang mewakili satu baris
     */
    public function map($order): array
    {
        return [
            $order->nomor_pesanan,
            $order->customer ? $order->customer->nama_customer : 'N/A',
            $order->tanggal_pesanan->format('d-m-Y'),
            $order->deadline->format('d-m-Y'),
            $order->status,
            $order->total_harga,
            $order->diskon_tipe,
            $order->diskon_nilai,
            $order->total_setelah_diskon,
            $order->catatan,
        ];
    }

    /**
     * Menentukan judul (header) untuk setiap kolom di baris paling atas Excel.
     */
    public function headings(): array
    {
        return [
            'Nomor Pesanan',
            'Nama Customer',
            'Tanggal Pesan',
            'Tenggat Waktu (Deadline)',
            'Status Pesanan',
            'Total Harga Kotor',
            'Tipe Diskon',
            'Nilai Diskon',
            'Total Bersih (Net)',
            'Catatan',
        ];
    }
}
