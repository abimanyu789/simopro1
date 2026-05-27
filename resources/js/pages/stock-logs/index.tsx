import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Search, History, ArrowDownToLine, ArrowUpToLine, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function StockLogIndex({ logs, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [tipeFilter, setTipeFilter] = useState(filters.tipe || '');
    const [jenisFilter, setJenisFilter] = useState(filters.jenis || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/stock-logs', { search, tipe: tipeFilter, jenis: jenisFilter }, { preserveState: true });
    };

    const getIcon = (jenis: string) => {
        if (jenis === 'stok_masuk') return <ArrowDownToLine className="w-4 h-4 text-emerald-600" />;
        if (jenis === 'stok_keluar') return <ArrowUpToLine className="w-4 h-4 text-red-600" />;
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
    };

    const getBadgeClass = (jenis: string) => {
        if (jenis === 'stok_masuk') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        if (jenis === 'stok_keluar') return 'bg-red-50 text-red-700 border border-red-100';
        return 'bg-blue-50 text-blue-700 border border-blue-100';
    };

    const getJenisLabel = (jenis: string) => {
        if (jenis === 'stok_masuk') return 'STOK MASUK';
        if (jenis === 'stok_keluar') return 'STOK KELUAR';
        return 'KOREKSI';
    };

    return (
        <AppLayout>
            <Head title="Riwayat Stok" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Riwayat Pergerakan Stok</h1>
                    <p className="text-slate-500 mt-1">Audit log semua aktivitas penambahan dan pengurangan stok.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari keterangan referensi..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={tipeFilter}
                            onChange={e => {
                                setTipeFilter(e.target.value);
                                router.get('/stock-logs', { search, tipe: e.target.value, jenis: jenisFilter }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 min-w-[160px]"
                        >
                            <option value="">Semua Tipe Entitas</option>
                            <option value="product">Produk Jadi</option>
                            <option value="raw_material">Bahan Baku</option>
                        </select>
                        <select
                            value={jenisFilter}
                            onChange={e => {
                                setJenisFilter(e.target.value);
                                router.get('/stock-logs', { search, tipe: tipeFilter, jenis: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 min-w-[160px]"
                        >
                            <option value="">Semua Pergerakan</option>
                            <option value="stok_masuk">Stok Masuk</option>
                            <option value="stok_keluar">Stok Keluar</option>
                            <option value="adjustment">Koreksi (Adjs)</option>
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Waktu & User</th>
                                <th className="px-6 py-4">Item (Produk/Bahan)</th>
                                <th className="px-6 py-4">Jenis</th>
                                <th className="px-6 py-4 text-right">Perubahan</th>
                                <th className="px-6 py-4 text-right">Saldo Akhir</th>
                                <th className="px-6 py-4">Keterangan / Referensi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.data.length > 0 ? logs.data.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">
                                            {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                                        </p>
                                        <p className="text-xs text-slate-500">Oleh: {log.created_by?.username || 'Sistem'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{log.item_name}</span>
                                            <span className="text-[11px] text-slate-500">{log.item_detail}</span>
                                            <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                                {log.stockable_type.includes('ProductStock') ? 'PRODUK JADI' : 'BAHAN BAKU'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${getBadgeClass(log.jenis)}`}>
                                            {getIcon(log.jenis)}
                                            {getJenisLabel(log.jenis)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-bold text-lg ${log.jumlah > 0 ? 'text-emerald-600' : log.jumlah < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                            {log.jumlah > 0 ? '+' : ''}{parseFloat(log.jumlah)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                                        {parseFloat(log.saldo_akhir)}
                                    </td>
                                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-500" title={log.keterangan}>
                                        {log.keterangan}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <History className="w-12 h-12 text-slate-300 mb-3" />
                                            <p>Tidak ada riwayat pergerakan stok yang ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <span className="text-sm text-slate-500">
                            Menampilkan {logs.data.length} dari {logs.total} log
                        </span>
                        <div className="flex gap-2">
                            {logs.links.map((link: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-1 text-sm rounded-lg border ${
                                        link.active 
                                            ? 'bg-blue-600 text-white border-blue-600' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
