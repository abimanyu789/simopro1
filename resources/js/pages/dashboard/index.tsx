import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import Chart from 'react-apexcharts';
import { ShoppingBag, TrendingUp, TrendingDown, Users, Package, Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardIndex({ kpi, chartData, topProducts, filters }: any) {
    
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            maximumFractionDigits: 0 
        }).format(angka);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dashboard', { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            fontFamily: 'inherit',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        colors: ['#10b981', '#ef4444'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            categories: chartData.labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: '#94a3b8' } }
        },
        yaxis: {
            labels: {
                formatter: (value) => 'Rp ' + (value / 1000000).toFixed(1) + 'M',
                style: { colors: '#94a3b8' }
            }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
        },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
        },
        legend: { position: 'top', horizontalAlign: 'right' },
        tooltip: {
            theme: 'light',
            y: { formatter: (val) => formatRupiah(val) }
        }
    };

    const chartSeries = [
        { name: 'Pemasukan', data: chartData.pemasukan },
        { name: 'Pengeluaran', data: chartData.pengeluaran }
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ikhtisar Operasional</h1>
                    <p className="text-slate-500 mt-1">Pantau performa bisnis, penjualan, dan arus kas bulan ini secara real-time.</p>
                </div>
                
                <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 px-2 text-slate-500 border-r border-slate-200">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold">Rentang Tanggal</span>
                    </div>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="text-sm border-none focus:ring-0 w-[130px]" 
                    />
                    <span className="text-slate-300">-</span>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="text-sm border-none focus:ring-0 w-[130px]" 
                    />
                    <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Terapkan
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">PENDING/PROSES</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Pesanan Aktif</p>
                    <h3 className="text-2xl font-black text-slate-900">{kpi.pesanan_aktif} <span className="text-sm text-slate-400 font-normal">PO</span></h3>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">PERIODE INI</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Pemasukan Kotor</p>
                    <h3 className="text-2xl font-black text-slate-900">{formatRupiah(kpi.pendapatan_bulan_ini)}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">PERIODE INI</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Pengeluaran Operasional</p>
                    <h3 className="text-2xl font-black text-slate-900">{formatRupiah(kpi.pengeluaran_bulan_ini)}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">AKTIF</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Tenaga Kerja</p>
                    <h3 className="text-2xl font-black text-slate-900">{kpi.total_karyawan} <span className="text-sm text-slate-400 font-normal">Orang</span></h3>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Tren Keuangan ({chartData.labels.length} Hari Terakhir)</h2>
                            <p className="text-xs text-slate-500 mt-1">Perbandingan Pemasukan (Omzet) vs Pengeluaran (Bahan & Upah)</p>
                        </div>
                    </div>
                    
                    <div className="w-full">
                        <Chart options={chartOptions} series={chartSeries} type="area" height={320} />
                    </div>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Top 5 Produk</h2>
                            <p className="text-xs text-slate-400">Paling banyak dipesan pada periode ini</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {topProducts.length > 0 ? topProducts.map((product: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                        idx === 0 ? 'bg-amber-100 text-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 
                                        idx === 1 ? 'bg-slate-300 text-slate-700' :
                                        idx === 2 ? 'bg-amber-700 text-amber-100' :
                                        'bg-slate-700 text-slate-400'
                                    }`}>
                                        #{idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm text-slate-200">{product.nama}</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Package className="w-3 h-3" /> Unit Terjual
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-lg text-emerald-400">{product.terjual}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-xl">
                                Belum ada penjualan di periode ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
