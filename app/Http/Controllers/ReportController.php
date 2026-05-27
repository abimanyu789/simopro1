<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\CashFlowExport;
use App\Exports\ProductionLogExport;

/**
 * Controller Manajemen Laporan (Reports).
 * Menyediakan antarmuka untuk mencetak berbagai dokumen operasional (PDF/Excel)
 */
class ReportController extends Controller
{
    /**
     * Halaman Utama Menu Laporan
     */
    public function index()
    {
        return Inertia::render('reports/index');
    }

    /**
     * Download Laporan Penjualan (Pesanan) dalam format PDF
     */
    public function exportSalesPdf(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // Mengambil data order dalam rentang waktu dengan item dan customer
        $orders = Order::with(['customer', 'items.product'])
            ->whereBetween('tanggal_pesanan', [$startDate, $endDate])
            ->whereIn('status', ['selesai', 'diproses', 'produksi']) // Kolom 'status' sesuai migration
            ->latest('tanggal_pesanan')
            ->get();

        $totalRevenue = $orders->sum('total_harga');
        
        // Memuat view Blade khusus untuk dicetak oleh dompdf
        $pdf = Pdf::loadView('reports.sales', [
            'orders' => $orders,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'totalRevenue' => $totalRevenue,
            'companyName' => 'PROVILLO MANUFAKTUR'
        ]);

        return $pdf->download('Laporan_Penjualan_Provillo_' . $startDate . '_sd_' . $endDate . '.pdf');
    }
    public function exportCashFlowExcel(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        return Excel::download(new CashFlowExport($startDate, $endDate), 'Laporan_Arus_Kas_'.$startDate.'_sd_'.$endDate.'.xlsx');
    }

    public function exportProductionExcel(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        return Excel::download(new ProductionLogExport($startDate, $endDate), 'Laporan_Produksi_'.$startDate.'_sd_'.$endDate.'.xlsx');
    }
}
