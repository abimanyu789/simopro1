<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\CashFlow;
use App\Models\Product;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

/**
 * Controller utama untuk halaman Dashboard Analitik.
 * Berfungsi untuk mengumpulkan, menghitung, dan menyajikan metrik kunci (KPI)
 * serta data seri waktu (time-series) untuk chart di frontend.
 */
class DashboardController extends Controller
{
    /**
     * Memproses metrik dan merender halaman Dashboard Utama.
     */
    public function index(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->start_date) : Carbon::now()->startOfMonth();
        $endDate = $request->input('end_date') ? Carbon::parse($request->end_date)->endOfDay() : Carbon::now()->endOfDay();

        // 1. Kalkulasi KPI Utama (Key Performance Indicators)
        $pesananAktif = Order::whereIn('status', ['pending', 'diproses', 'produksi'])->count(); // Snapshot of current state
        $totalPendapatanBulanIni = CashFlow::where('jenis', 'pemasukan')->whereBetween('tanggal_transaksi', [$startDate, $endDate])->sum('nominal');
        $totalPengeluaranBulanIni = CashFlow::where('jenis', 'pengeluaran')->whereBetween('tanggal_transaksi', [$startDate, $endDate])->sum('nominal');
        $jumlahKaryawan = Employee::aktif()->count();

        // 2. Data Time-Series untuk Grafik Arus Kas
        $chartDates = [];
        $pemasukanSeries = [];
        $pengeluaranSeries = [];

        $diffInDays = $startDate->diffInDays($endDate);
        if ($diffInDays > 30) {
            $diffInDays = 30; // Limit to 30 points to avoid clutter
            $startDate = $endDate->copy()->subDays(30);
        }

        for ($i = $diffInDays; $i >= 0; $i--) {
            $date = $endDate->copy()->subDays($i)->format('Y-m-d');
            $chartDates[] = $endDate->copy()->subDays($i)->format('d M'); 
            
            $pemasukanSeries[] = CashFlow::where('jenis', 'pemasukan')
                ->whereDate('tanggal_transaksi', $date)
                ->sum('nominal');

            $pengeluaranSeries[] = CashFlow::where('jenis', 'pengeluaran')
                ->whereDate('tanggal_transaksi', $date)
                ->sum('nominal');
        }

        // 3. Data Produk Terlaris
        $topProducts = Product::withSum(['orderItems as total_terjual' => function ($query) use ($startDate, $endDate) {
            $query->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate]);
            });
        }], 'kuantitas')
            ->orderByDesc('total_terjual')
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'nama' => $product->nama_produk,
                    'terjual' => $product->total_terjual ?? 0
                ];
            });

        // 4. Return data ke Inertia
        return Inertia::render('dashboard/index', [
            'kpi' => [
                'pesanan_aktif' => $pesananAktif,
                'pendapatan_bulan_ini' => (float) $totalPendapatanBulanIni,
                'pengeluaran_bulan_ini' => (float) $totalPengeluaranBulanIni,
                'total_karyawan' => $jumlahKaryawan,
            ],
            'chartData' => [
                'labels' => $chartDates,
                'pemasukan' => $pemasukanSeries,
                'pengeluaran' => $pengeluaranSeries
            ],
            'topProducts' => $topProducts,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ]
        ]);
    }
}
