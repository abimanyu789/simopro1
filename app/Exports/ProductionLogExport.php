<?php

namespace App\Exports;

use App\Models\ProductionLog;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\Exportable;

class ProductionLogExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    use Exportable;

    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function query()
    {
        return ProductionLog::query()
            ->with(['karyawan', 'order', 'orderItem.product'])
            ->whereBetween('tanggal_produksi', [$this->startDate, $this->endDate])
            ->orderBy('tanggal_produksi', 'desc');
    }

    public function map($log): array
    {
        return [
            $log->tanggal_produksi->format('d-m-Y'),
            $log->karyawan->nama_karyawan ?? '-',
            $log->order->nomor_pesanan ?? '-',
            $log->orderItem->product->nama_produk ?? '-',
            $log->jumlah_produksi,
            strtoupper(str_replace('_', ' ', $log->status)),
            $log->tanggal_selesai_produksi ? $log->tanggal_selesai_produksi->format('d-m-Y') : '-',
            $log->catatan ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'Tanggal Produksi',
            'Nama Karyawan',
            'Nomor PO',
            'Produk',
            'Jumlah Unit',
            'Status',
            'Tanggal Selesai',
            'Catatan',
        ];
    }
}
