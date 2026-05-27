<?php

namespace App\Exports;

use App\Models\CashFlow;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\Exportable;

class CashFlowExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
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
        return CashFlow::query()->whereBetween('tanggal_transaksi', [$this->startDate, $this->endDate])->orderBy('tanggal_transaksi', 'desc');
    }

    public function map($cashFlow): array
    {
        return [
            $cashFlow->tanggal_transaksi->format('d-m-Y'),
            strtoupper($cashFlow->jenis),
            strtoupper(str_replace('_', ' ', $cashFlow->kategori)),
            $cashFlow->referensi ?? '-',
            $cashFlow->deskripsi,
            $cashFlow->nominal,
        ];
    }

    public function headings(): array
    {
        return [
            'Tanggal Transaksi',
            'Jenis Kas',
            'Kategori',
            'Referensi',
            'Deskripsi',
            'Nominal (Rp)',
        ];
    }
}
