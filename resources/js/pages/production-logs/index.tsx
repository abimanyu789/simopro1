import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Search, CheckCircle2, Factory, Trash2, Edit } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import AppLayout from '@/layouts/AppLayout';

export default function ProductionLogIndex({ logs, employees, orders, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Form setup
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        order_id: '',
        order_item_id: '',
        karyawan_id: '',
        tanggal_produksi: new Date().toISOString().split('T')[0],
        tanggal_selesai_produksi: '',
        jumlah_produksi: '',
        status: 'dalam_proses',
        catatan: '',
    });

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    // Derived states
    const selectedOrder = useMemo(() => {
        if (!data.order_id) {
return null;
}

        return orders.find((o: any) => o.id.toString() === data.order_id);
    }, [data.order_id, orders]);

    const orderItems = useMemo(() => {
        if (!selectedOrder) {
return [];
}

        return selectedOrder.items;
    }, [selectedOrder]);

    const selectedItem = useMemo(() => {
        if (!data.order_item_id) {
return null;
}

        return orderItems.find((i: any) => i.id.toString() === data.order_item_id);
    }, [data.order_item_id, orderItems]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/production-logs', { search, status: statusFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('production-logs.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                toast.success('Log produksi berhasil dicatat');
            }
        });
    };

    const openDeleteModal = (log: any) => {
        setSelectedLog(log);
        setIsDeleteOpen(true);
    };

    const submitDelete = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedLog) {
            router.delete(route('production-logs.destroy', selectedLog.id), {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    toast.success('Log produksi berhasil dihapus');
                }
            });
        }
    };

    const handleComplete = (log: any) => {
        if (confirm('Selesaikan produksi ini? Sistem akan memotong stok bahan baku dan menambah stok produk secara otomatis.')) {
            router.put(route('production-logs.update', log.id), {
                ...log,
                status: 'selesai',
                tanggal_selesai_produksi: new Date().toISOString().split('T')[0]
            }, {
                onSuccess: () => toast.success('Produksi diselesaikan & upah dihitung')
            });
        }
    };

    const formatRupiah = (angka: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    return (
        <AppLayout>
            <Head title="Log Produksi" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Log Produksi Harian</h1>
                    <p className="text-slate-500 mt-1">Catat produksi harian dan kelola upah borongan secara otomatis.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                    <Plus className="w-4 h-4" /> Catat Produksi
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari pesanan / karyawan..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value);
                                router.get('/production-logs', { search, status: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 min-w-[150px]"
                        >
                            <option value="">Semua Status</option>
                            <option value="dalam_proses">Dalam Proses</option>
                            <option value="selesai">Selesai</option>
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Pesanan & Item</th>
                                <th className="px-6 py-4">Pekerja</th>
                                <th className="px-6 py-4 text-center">Jumlah</th>
                                <th className="px-6 py-4">Status & Upah</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.data.length > 0 ? logs.data.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{log.order?.nomor_pesanan}</p>
                                        <p className="text-xs text-slate-600">
                                            {log.order_item?.product?.nama_produk} ({log.order_item?.ukuran} / {log.order_item?.warna})
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            {format(new Date(log.tanggal_produksi), 'dd MMM yyyy', { locale: id })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{log.karyawan?.nama_karyawan}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-lg text-slate-800">{log.jumlah_produksi}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide mb-1 ${
                                            log.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {log.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        {log.status === 'selesai' && (
                                            <p className="text-xs font-bold text-slate-700 mt-1">Upah: {formatRupiah(log.upah_borongan)}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {log.status === 'dalam_proses' && (
                                                <button 
                                                    onClick={() => handleComplete(log)} 
                                                    title="Selesaikan Produksi"
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => openDeleteModal(log)} 
                                                title="Hapus / Rollback"
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Factory className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p>Tidak ada log produksi ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Catat Produksi" maxWidth="2xl">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pesanan <span className="text-red-500">*</span></label>
                            <select value={data.order_id} onChange={e => {
 setData('order_id', e.target.value); setData('order_item_id', ''); 
}} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="" disabled>Pilih Pesanan (Diproses/Produksi)...</option>
                                {orders.map((o: any) => (
                                    <option key={o.id} value={o.id}>PO: {o.nomor_pesanan} ({o.customer?.nama_customer})</option>
                                ))}
                            </select>
                            {errors.order_id && <span className="text-red-500 text-xs mt-1">{errors.order_id}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Item Pesanan <span className="text-red-500">*</span></label>
                            <select value={data.order_item_id} onChange={e => setData('order_item_id', e.target.value)} required disabled={!data.order_id} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500">
                                <option value="" disabled>Pilih Item...</option>
                                {orderItems.map((item: any) => {
                                    const sisa = item.kuantitas - item.jumlah_diproduksi;

                                    return (
                                        <option key={item.id} value={item.id} disabled={sisa <= 0}>
                                            {item.product?.nama_produk} ({item.ukuran} / {item.warna}) - Sisa: {sisa}
                                        </option>
                                    );
                                })}
                            </select>
                            {errors.order_item_id && <span className="text-red-500 text-xs mt-1">{errors.order_item_id}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pekerja / Karyawan <span className="text-red-500">*</span></label>
                            <select value={data.karyawan_id} onChange={e => setData('karyawan_id', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="" disabled>Pilih Pekerja...</option>
                                {employees.map((emp: any) => (
                                    <option key={emp.id} value={emp.id}>{emp.nama_karyawan} ({formatRupiah(emp.upah_borongan)}/unit)</option>
                                ))}
                            </select>
                            {errors.karyawan_id && <span className="text-red-500 text-xs mt-1">{errors.karyawan_id}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Produksi <span className="text-red-500">*</span></label>
                            <input type="number" min="1" max={selectedItem ? (selectedItem.kuantitas - selectedItem.jumlah_diproduksi) : undefined} value={data.jumlah_produksi} onChange={e => setData('jumlah_produksi', e.target.value)} required disabled={!data.order_item_id} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100" />
                            {errors.jumlah_produksi && <span className="text-red-500 text-xs mt-1">{errors.jumlah_produksi}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai Produksi <span className="text-red-500">*</span></label>
                            <input type="date" value={data.tanggal_produksi} onChange={e => setData('tanggal_produksi', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status <span className="text-red-500">*</span></label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="dalam_proses">Dalam Proses</option>
                                <option value="selesai">Langsung Selesai</option>
                            </select>
                        </div>
                        {data.status === 'selesai' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai <span className="text-red-500">*</span></label>
                                <input type="date" value={data.tanggal_selesai_produksi} onChange={e => setData('tanggal_selesai_produksi', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
                            <textarea value={data.catatan} onChange={e => setData('catatan', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            {processing ? 'Menyimpan...' : 'Simpan Produksi'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Hapus */}
            <Modal show={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus / Rollback Log" maxWidth="sm">
                <div className="mb-6">
                    <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                        <p className="font-bold">Konfirmasi Penghapusan</p>
                        <p className="mt-1">
                            {selectedLog?.status === 'selesai' ? 
                                'Menghapus log ini akan me-rollback pengurangan stok bahan, penambahan stok produk, dan membatalkan upah yang sudah dihitung.' :
                                'Menghapus log yang sedang dalam proses.'}
                        </p>
                    </div>
                </div>
                <form onSubmit={submitDelete} className="flex justify-end gap-3">
                    <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                        Ya, Hapus
                    </button>
                </form>
            </Modal>
        </AppLayout>
    );
}
