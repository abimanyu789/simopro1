import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import Modal from '@/components/Modal';
import { ArrowLeft, Edit2, Package, Clock, CheckCircle2, Truck, CreditCard, Banknote, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function OrderShow({ order, summary }: any) {
    // Status Modal
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const { data: statusData, setData: setStatusData, post: postStatus, processing: statusProcessing } = useForm({
        status_pesanan: order.status_pesanan,
        catatan: '',
    });

    // Payment Modal
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const { data: paymentData, setData: setPaymentData, post: postPayment, processing: paymentProcessing } = useForm({
        status_pembayaran: order.status_pembayaran,
        nominal_pembayaran: '',
    });

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        postStatus(route('orders.update-status', order.id), {
            onSuccess: () => {
                setIsStatusOpen(false);
                toast.success('Status pesanan berhasil diperbarui');
            }
        });
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        postPayment(route('orders.update-payment', order.id), {
            onSuccess: () => {
                setIsPaymentOpen(false);
                toast.success('Status pembayaran berhasil diperbarui');
            }
        });
    };

    const handleDelete = () => {
        if (confirm('Yakin ingin menghapus pesanan ini? Aksi ini tidak dapat dibatalkan.')) {
            router.delete(route('orders.destroy', order.id), {
                onSuccess: () => toast.success('Pesanan berhasil dihapus')
            });
        }
    };

    const formatRupiah = (angka: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'pending': 'bg-slate-100 text-slate-700 border-slate-200',
            'diproses': 'bg-blue-100 text-blue-700 border-blue-200',
            'selesai': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'dibatalkan': 'bg-red-100 text-red-700 border-red-200',
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${styles[status]}`}>{status.toUpperCase()}</span>;
    };

    const getPaymentBadge = (status: string) => {
        const styles: Record<string, string> = {
            'belum_dibayar': 'bg-red-100 text-red-700 border-red-200',
            'dibayar_sebagian': 'bg-amber-100 text-amber-700 border-amber-200',
            'lunas': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${styles[status]}`}>{status.replace('_', ' ').toUpperCase()}</span>;
    };

    const progress = summary.total_qty > 0 ? Math.round((summary.total_sent / summary.total_qty) * 100) : 0;

    return (
        <AppLayout>
            <Head title={`Pesanan ${order.nomor_pesanan}`} />

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pesanan
                </Link>
                <div className="flex gap-2">
                    {order.status_pesanan === 'pending' && (
                        <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                            Hapus Pesanan
                        </button>
                    )}
                    <a href={`/orders/${order.id}/export-invoice`} target="_blank" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors inline-flex items-center gap-2">
                        <Printer className="w-4 h-4" /> Cetak Invoice
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bagian Kiri: Detail Pesanan */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <ShoppingCart className="w-32 h-32" />
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6 relative z-10">
                            <div>
                                <p className="text-sm font-bold text-blue-600 tracking-wider mb-1">INVOICE</p>
                                <h1 className="text-3xl font-black text-slate-900">{order.nomor_pesanan}</h1>
                                <p className="text-slate-500 mt-2 text-sm flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> 
                                    Tanggal Pesanan: {format(new Date(order.tanggal_pesanan), 'dd MMMM yyyy', { locale: id })}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 items-start md:items-end">
                                {getStatusBadge(order.status_pesanan)}
                                {getPaymentBadge(order.status_pembayaran)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100 relative z-10">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Customer</h3>
                                <p className="font-bold text-slate-900">{order.customer?.nama_customer}</p>
                                <p className="text-sm text-slate-600">{order.customer?.nomor_hp}</p>
                                <p className="text-sm text-slate-600 mt-1">{order.customer?.alamat}, {order.customer?.kota}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tenggat Waktu</h3>
                                <p className="font-bold text-slate-900">
                                    {format(new Date(order.tenggat_waktu), 'dd MMMM yyyy', { locale: id })}
                                </p>
                                {order.catatan && (
                                    <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-100">
                                        <strong>Catatan:</strong> {order.catatan}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Item Pesanan */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Package className="w-5 h-5 text-slate-400" /> Item Pesanan
                            </h3>
                            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded">
                                {order.items.length} ITEM
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 font-semibold text-xs border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3">Produk</th>
                                        <th className="px-6 py-3 text-center">Varian</th>
                                        <th className="px-6 py-3 text-center">Harga Satuan</th>
                                        <th className="px-6 py-3 text-center">Kuantitas</th>
                                        <th className="px-6 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {order.items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">{item.product?.nama_produk || 'Produk Dihapus'}</p>
                                                <p className="text-xs text-slate-500">{item.product?.kode_produk}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                                                    {item.ukuran} | {item.warna}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">{formatRupiah(item.harga_satuan)}</td>
                                            <td className="px-6 py-4 text-center font-bold text-lg text-slate-800">{item.kuantitas}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">{formatRupiah(item.harga_satuan * item.kuantitas)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                                        <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-700">TOTAL TAGIHAN</td>
                                        <td className="px-6 py-4 text-right font-black text-xl text-emerald-600">{formatRupiah(order.total_harga)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Bagian Kanan: Kontrol Status & Pengiriman */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Pembayaran Control */}
                    <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Banknote className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold">Status Pembayaran</h2>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-slate-400 text-sm mb-1">Status Saat Ini:</p>
                            <div className="font-bold text-lg">{order.status_pembayaran.replace('_', ' ').toUpperCase()}</div>
                        </div>

                        <button onClick={() => setIsPaymentOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-colors">
                            <CreditCard className="w-4 h-4" /> Update Pembayaran
                        </button>
                    </div>

                    {/* Progress Pengiriman */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Truck className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Pengiriman</h2>
                        </div>
                        
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Progress Pengiriman</span>
                            <span className="font-bold text-slate-900">{progress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center mb-6">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 font-medium mb-1">Total Unit</p>
                                <p className="text-xl font-bold text-slate-900">{summary.total_qty}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-xs text-emerald-700 font-medium mb-1">Telah Dikirim</p>
                                <p className="text-xl font-bold text-emerald-700">{summary.total_sent}</p>
                            </div>
                        </div>

                        <Link 
                            href={`/orders/${order.id}/shipments`} // This route will be created in Phase 5 if needed, or we can use modal
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 text-white hover:bg-slate-900 font-bold rounded-xl transition-colors"
                        >
                            Kelola Pengiriman Parsial
                        </Link>
                    </div>

                    {/* Status Pesanan Umum */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Status Pesanan</h2>
                        <button onClick={() => setIsStatusOpen(true)} className="w-full flex items-center justify-between py-3 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 font-medium rounded-xl transition-colors text-slate-700">
                            Update Status <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal show={isStatusOpen} onClose={() => setIsStatusOpen(false)} title="Update Status Pesanan" maxWidth="sm">
                <form onSubmit={submitStatus} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Status Baru <span className="text-red-500">*</span></label>
                        <select value={statusData.status_pesanan} onChange={e => setStatusData('status_pesanan', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="pending">Pending (Menunggu diproses)</option>
                            <option value="diproses">Diproses (Sedang dikerjakan)</option>
                            <option value="selesai">Selesai (Siap kirim / Lunas)</option>
                            <option value="dibatalkan">Dibatalkan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Log</label>
                        <textarea value={statusData.catatan} onChange={e => setStatusData('catatan', e.target.value)} rows={2} placeholder="Contoh: Barang mulai dijahit" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsStatusOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={statusProcessing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal show={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Update Pembayaran" maxWidth="sm">
                <form onSubmit={submitPayment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status Pembayaran <span className="text-red-500">*</span></label>
                        <select value={paymentData.status_pembayaran} onChange={e => setPaymentData('status_pembayaran', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="belum_dibayar">Belum Dibayar</option>
                            <option value="dibayar_sebagian">Dibayar Sebagian (DP/Termin)</option>
                            <option value="lunas">Lunas</option>
                        </select>
                    </div>
                    {paymentData.status_pembayaran !== 'belum_dibayar' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Catat Nominal (Opsional)</label>
                            <input type="number" min="0" value={paymentData.nominal_pembayaran} onChange={e => setPaymentData('nominal_pembayaran', e.target.value)} placeholder="Contoh: 1500000" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            <p className="text-xs text-slate-500 mt-1">Jika diisi, otomatis tercatat di Arus Kas (Pemasukan).</p>
                        </div>
                    )}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsPaymentOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={paymentProcessing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            Simpan Pembayaran
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
