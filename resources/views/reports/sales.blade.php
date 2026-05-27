<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan - {{ $companyName }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #2563eb; }
        .header h1 { margin: 0; color: #1e293b; font-size: 24px; }
        .header p { margin: 5px 0; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { font-weight: bold; background-color: #f1f5f9; }
        .badge { display: inline-block; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .bg-green { background-color: #dcfce7; color: #166534; }
        .bg-blue { background-color: #dbeafe; color: #1e40af; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $companyName }}</h1>
        <p>Laporan Penjualan (Pesanan Diproses & Selesai)</p>
        <p>Periode: {{ \Carbon\Carbon::parse($startDate)->format('d M Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d M Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nomor PO</th>
                <th>Customer</th>
                <th>Status Pembayaran</th>
                <th class="text-right">Total Nilai (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($orders as $index => $order)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($order->tanggal_pesanan)->format('d/m/Y') }}</td>
                <td><strong>{{ $order->nomor_pesanan }}</strong></td>
                <td>{{ $order->customer->nama_customer ?? '-' }}</td>
                <td>
                    @if($order->status_pembayaran == 'lunas')
                        <span class="badge bg-green">LUNAS</span>
                    @else
                        <span class="badge bg-blue">{{ strtoupper(str_replace('_', ' ', $order->status_pembayaran)) }}</span>
                    @endif
                </td>
                <td class="text-right">{{ number_format($order->total_harga, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="text-center" style="padding: 20px;">Tidak ada transaksi pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
        @if(count($orders) > 0)
        <tfoot>
            <tr class="total-row">
                <td colspan="5" class="text-right">TOTAL PENDAPATAN KOTOR:</td>
                <td class="text-right">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    <div style="margin-top: 40px; text-align: right;">
        <p>Dicetak Pada: {{ now()->format('d/m/Y H:i') }}</p>
        <p>Oleh: {{ auth()->user()->username ?? 'Sistem' }}</p>
    </div>
</body>
</html>
