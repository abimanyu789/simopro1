import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Halaman Cetak Laporan (Reports)
 * Menyediakan antarmuka bagi pengguna untuk memilih rentang tanggal
 * dan mengunduh laporan PDF operasional.
 */
export default function ReportsIndex() {
    
    // State manajemen tanggal untuk filter laporan
    // Secara default, diset ke tanggal 1 (awal bulan) hingga hari ini
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    // ---------------------------------------------------------
    // RENDER UI TAMPILAN
    // ---------------------------------------------------------
    return (
        <AppLayout>
            <Head title="Cetak Laporan" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Pusat Laporan & Ekspor</h1>
                <p className="text-slate-500 mt-1">Unduh berbagai rekap data operasional dalam format PDF terstruktur.</p>
            </div>

            {/* Area Filter Global */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-end gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" /> Dari Tanggal
                    </label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" /> Sampai Tanggal
                    </label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex-1 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2">
                    <Filter className="w-5 h-5 text-blue-500 shrink-0" />
                    <p>Pilih rentang tanggal di samping untuk menyaring data pada semua jenis laporan di bawah ini.</p>
                </div>
            </div>

            {/* Grid Kartu Laporan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Laporan Penjualan (Pesanan) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-blue-300 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Laporan Penjualan</h2>
                    <p className="text-sm text-slate-500 flex-1 mb-6">
                        Rekap semua pesanan pelanggan (status: diproses & selesai) beserta total pendapatan kotor berdasarkan rentang tanggal.
                    </p>
                    
                    {/* Menggunakan link langsung (<a>) alih-alih <Link Inertia> 
                        karena PDF download harus di-handle oleh native browser request */}
                    <a 
                        href={`/reports/sales-pdf?start_date=${startDate}&end_date=${endDate}`}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl transition-colors"
                    >
                        <Download className="w-4 h-4" /> Unduh PDF
                    </a>
                </div>

                {/* (Placeholder) Laporan Arus Kas */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-emerald-300 transition-colors opacity-75">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Laporan Arus Kas</h2>
                    <p className="text-sm text-slate-500 flex-1 mb-6">
                        Buku kas detail berisi semua transaksi uang masuk dan uang keluar harian pada rentang waktu. (Tahap Pengembangan Selanjutnya)
                    </p>
                    <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                        Akan Hadir
                    </button>
                </div>

                {/* (Placeholder) Laporan Produksi & Upah */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-purple-300 transition-colors opacity-75">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Laporan Produksi & Upah</h2>
                    <p className="text-sm text-slate-500 flex-1 mb-6">
                        Rekapitulasi output produksi harian pabrik dan rincian upah borongan untuk masing-masing karyawan. (Tahap Pengembangan Selanjutnya)
                    </p>
                    <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                        Akan Hadir
                    </button>
                </div>

            </div>
        </AppLayout>
    );
}
