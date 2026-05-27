import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Search, Eye, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

export default function OrderIndex({ orders, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [paymentFilter, setPaymentFilter] = useState(filters.status_pembayaran || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/orders', { search, status: statusFilter, status_pembayaran: paymentFilter }, { preserveState: true });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'pending': 'bg-slate-100 text-slate-700',
            'diproses': 'bg-blue-100 text-blue-700',
            'selesai': 'bg-emerald-100 text-emerald-700',
            'dibatalkan': 'bg-red-100 text-red-700',
        };

        return colors[status] || colors['pending'];
    };

    const getPaymentColor = (status: string) => {
        const colors: Record<string, string> = {
            'belum_dibayar': 'bg-red-50 text-red-700 border-red-200',
            'dibayar_sebagian': 'bg-amber-50 text-amber-700 border-amber-200',
            'lunas': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };

        return colors[status] || colors['belum_dibayar'];
    };

    const formatRupiah = (angka: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    return (
        <AppLayout>
            <Head title="Manajemen Pesanan" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Pesanan</h1>
                    <p className="text-slate-500 mt-1">Kelola data pemesanan customer, pengiriman, dan pembayaran.</p>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/orders/export-excel" target="_blank" className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-200 transition-colors shadow-sm font-medium text-sm border border-emerald-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        Export Excel
                    </a>
                    <Link href="/orders/create" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                        <Plus className="w-4 h-4" /> Buat Pesanan Baru
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nomor pesanan atau customer..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value);
                                router.get('/orders', { search, status: e.target.value, status_pembayaran: paymentFilter }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 min-w-[160px]"
                        >
                            <option value="">Status Pesanan (Semua)</option>
                            <option value="pending">Pending</option>
                            <option value="diproses">Diproses</option>
                            <option value="selesai">Selesai</option>
                            <option value="dibatalkan">Dibatalkan</option>
                        </select>
                        <select
                            value={paymentFilter}
                            onChange={e => {
                                setPaymentFilter(e.target.value);
                                router.get('/orders', { search, status: statusFilter, status_pembayaran: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 min-w-[160px]"
                        >
                            <option value="">Pembayaran (Semua)</option>
                            <option value="belum_dibayar">Belum Dibayar</option>
                            <option value="dibayar_sebagian">Dibayar Sebagian (DP)</option>
                            <option value="lunas">Lunas</option>
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Nomor Pesanan</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status & Pengiriman</th>
                                <th className="px-6 py-4 text-right">Total Bayar</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.data.length > 0 ? orders.data.map((order: any) => {
                                const progress = order.total_qty > 0 ? Math.round((order.total_dikirim / order.total_qty) * 100) : 0;
                                
                                return (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{order.nomor_pesanan}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {format(new Date(order.tanggal_pesanan), 'dd MMM yyyy', { locale: id })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-800">{order.customer?.nama_customer}</p>
                                        <div className={`mt-1 inline-flex px-2 py-0.5 rounded border text-[10px] font-bold ${getPaymentColor(order.status_pembayaran)}`}>
                                            {order.status_pembayaran.replace('_', ' ').toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide mb-2 ${getStatusColor(order.status_pesanan)}`}>
                                            {order.status_pesanan.toUpperCase()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-500">
                                                {order.total_dikirim}/{order.total_qty} Dikirim
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-bold text-slate-900 text-base">{formatRupiah(order.total_harga)}</p>
                                        <p className="text-[10px] text-slate-500">{order.items.length} item(s)</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={`/orders/${order.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                        >
                                            <Eye className="w-4 h-4" /> Kelola
                                        </Link>
                                    </td>
                                </tr>
                            )
}) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p>Tidak ada pesanan ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <span className="text-sm text-slate-500">
                            Menampilkan {orders.data.length} dari {orders.total} pesanan
                        </span>
                        <div className="flex gap-2">
                            {orders.links.map((link: any, idx: number) => (
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
