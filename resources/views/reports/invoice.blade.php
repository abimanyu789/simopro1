<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $order->nomor_pesanan }}</title>
    <style>
        /* 
         * Keterangan Styling Invoice PDF
         * Menggunakan CSS tradisional karena DomPDF kurang optimal merender Tailwind/Flexbox modern.
         * Desain difokuskan pada kesan profesional dan rapi untuk kebutuhan cetak kertas.
         */
        body { font-family: 'Helvetica', Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5; margin: 0; padding: 20px; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; overflow: auto; }
        .logo-container { float: left; width: 60%; }
        .logo-container img { max-height: 80px; margin-bottom: 10px; }
        .company-info { font-size: 13px; color: #555; }
        .invoice-title-container { float: right; width: 35%; text-align: right; }
        .invoice-title { font-size: 28px; font-weight: bold; color: #2563eb; margin: 0 0 5px 0; text-transform: uppercase; }
        .invoice-meta { font-size: 13px; color: #666; margin-bottom: 3px; }
        .invoice-meta strong { color: #333; }
        
        .billing-section { margin-bottom: 30px; overflow: auto; }
        .billing-to { float: left; width: 50%; }
        .billing-to h4 { margin: 0 0 10px 0; font-size: 15px; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 5px; display: inline-block;}
        .billing-details p { margin: 0 0 5px 0; font-size: 13px; }

        table.items { w-full; border-collapse: collapse; margin-bottom: 30px; width: 100%; }
        table.items th { background-color: #f8fafc; color: #334155; text-align: left; padding: 12px; font-size: 13px; border-bottom: 2px solid #cbd5e1; }
        table.items td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        table.items .text-right { text-align: right; }
        table.items .text-center { text-align: center; }

        .summary-container { float: right; width: 40%; }
        table.summary { width: 100%; border-collapse: collapse; }
        table.summary td { padding: 8px 12px; font-size: 14px; }
        table.summary tr.total td { font-weight: bold; color: #1e40af; border-top: 2px solid #94a3b8; font-size: 16px; }
        
        .footer { margin-top: 50px; clear: both; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
        .notes { font-size: 13px; background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin-top: 30px; clear: left; width: 50%; float: left; }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo-container">
            @if($setting && $setting->logo_path)
                <img src="{{ public_path('storage/' . $setting->logo_path) }}" alt="Logo">
            @else
                <h2 style="margin:0; color:#1e40af; font-size:24px;">{{ $setting->nama_usaha ?? 'PROVILLO' }}</h2>
            @endif
            <div class="company-info">
                {{ $setting->alamat ?? 'Alamat belum diatur' }}<br>
                Telp: {{ $setting->telepon ?? '-' }} | Email: {{ $setting->email ?? '-' }}<br>
                @if($setting && $setting->npwp)
                NPWP: {{ $setting->npwp }}
                @endif
            </div>
        </div>
        <div class="invoice-title-container">
            <h1 class="invoice-title">INVOICE</h1>
            <div class="invoice-meta"><strong>No. PO:</strong> {{ $order->nomor_pesanan }}</div>
            <div class="invoice-meta"><strong>Tanggal:</strong> {{ $order->tanggal_pesanan->format('d F Y') }}</div>
            <div class="invoice-meta"><strong>Jatuh Tempo:</strong> {{ $order->deadline->format('d F Y') }}</div>
        </div>
    </div>

    <div class="billing-section">
        <div class="billing-to">
            <h4>Ditagihkan Kepada:</h4>
            <div class="billing-details">
                <p><strong>{{ $order->customer->nama_customer }}</strong></p>
                <p>{{ $order->customer->alamat ?? 'Alamat tidak tersedia' }}</p>
                <p>Telp: {{ $order->customer->telepon ?? '-' }}</p>
            </div>
        </div>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th>Item / Deskripsi</th>
                <th class="text-center">Kuantitas</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>
                    <strong>{{ $item->product->nama_produk }}</strong><br>
                    <span style="color:#666; font-size:12px;">Ukuran: {{ $item->ukuran }} | Warna: {{ $item->warna }}</span>
                </td>
                <td class="text-center">{{ $item->kuantitas }} unit</td>
                <td class="text-right">Rp {{ number_format($item->harga_satuan, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="notes">
        <strong>Catatan Pesanan:</strong><br>
        {{ $order->catatan ?? 'Tidak ada catatan khusus.' }}
    </div>

    <div class="summary-container">
        <table class="summary">
            <tr>
                <td>Subtotal</td>
                <td class="text-right">Rp {{ number_format($order->total_harga, 0, ',', '.') }}</td>
            </tr>
            @if($order->diskon_nilai > 0)
            <tr>
                <td>Diskon ({{ $order->diskon_tipe == 'persen' ? $order->diskon_nilai.'%' : 'Nominal' }})</td>
                <td class="text-right" style="color: #dc2626;">
                    - Rp {{ number_format($order->total_harga - $order->total_setelah_diskon, 0, ',', '.') }}
                </td>
            </tr>
            @endif
            <tr class="total">
                <td>Total Tagihan</td>
                <td class="text-right">Rp {{ number_format($order->total_setelah_diskon, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Terima kasih atas kepercayaan Anda bermitra dengan {{ $setting->nama_usaha ?? 'Provillo' }}.</p>
        <p>Dokumen ini di-generate secara otomatis oleh sistem SIMOPRO.</p>
    </div>

</body>
</html>
