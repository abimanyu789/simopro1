import { Head, router, useForm } from '@inertiajs/react';
import { Search, Settings2, ArrowRightLeft, Box } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import AppLayout from '@/layouts/AppLayout';

export default function RawMaterialStockIndex({ stocks, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    
    // Edit Minimum Modal
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing } = useForm({
        stok_minimum: '',
        keterangan: '',
    });

    // Adjust Stock Modal
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const { data: adjustData, setData: setAdjustData, post: postAdjust, processing: adjustProcessing, reset: resetAdjust, errors: adjustErrors } = useForm({
        jenis: 'stok_masuk',
        jumlah: '',
        keterangan: '',
    });
    const [selectedStock, setSelectedStock] = useState<any>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/raw-material-stocks', { search, status: statusFilter }, { preserveState: true });
    };

    const openEditModal = (stock: any) => {
        setSelectedId(stock.id);
        setEditData({
            stok_minimum: stock.stok_minimum.toString(),
            keterangan: stock.keterangan || '',
        });
        setIsEditOpen(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedId) {
            putEdit(route('raw-material-stocks.update', selectedId), {
                onSuccess: () => {
                    setIsEditOpen(false);
                    toast.success('Pengaturan stok diperbarui');
                }
            });
        }
    };

    const openAdjustModal = (stock: any) => {
        setSelectedStock(stock);
        resetAdjust();
        setIsAdjustOpen(true);
    };

    const submitAdjust = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedStock) {
            postAdjust(route('raw-material-stocks.adjust', selectedStock.id), {
                onSuccess: () => {
                    setIsAdjustOpen(false);
                    toast.success('Stok bahan baku berhasil disesuaikan');
                }
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Stok Bahan Baku" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Stok Bahan Baku</h1>
                    <p className="text-slate-500 mt-1">Stok bahan baku otomatis terbuat saat bahan baru ditambahkan di Master Data.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari bahan baku..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value);
                                router.get('/raw-material-stocks', { search, status: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8"
                        >
                            <option value="">Semua Status</option>
                            <option value="tersedia">Tersedia</option>
                            <option value="menipis">Menipis</option>
                            <option value="habis">Habis</option>
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Bahan Baku</th>
                                <th className="px-6 py-4 text-center">Satuan</th>
                                <th className="px-6 py-4 text-right">Stok Saat Ini</th>
                                <th className="px-6 py-4 text-right">Min. Stok</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stocks.data.length > 0 ? stocks.data.map((stock: any) => (
                                <tr key={stock.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{stock.bahan?.nama_bahan}</p>
                                                <p className="text-xs text-slate-500">{stock.bahan?.kode_bahan}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium">{stock.satuan}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg">
                                        {parseFloat(stock.stok_saat_ini)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500">
                                        {parseFloat(stock.stok_minimum)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                                            stock.status_label === 'tersedia' ? 'bg-green-100 text-green-700' : 
                                            stock.status_label === 'menipis' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {stock.status_label.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openAdjustModal(stock)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sesuaikan Stok">
                                                <ArrowRightLeft className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openEditModal(stock)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Pengaturan">
                                                <Settings2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data stok ditemukan. Pastikan Anda telah menambahkan bahan baku di Master Data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Penyesuaian Stok (Adjust) */}
            <Modal show={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title="Penyesuaian Stok Bahan Baku" maxWidth="sm">
                {selectedStock && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                        <p className="font-bold">{selectedStock.bahan?.nama_bahan}</p>
                        <p>Satuan: {selectedStock.satuan}</p>
                        <p className="mt-1">Stok Saat Ini: <strong>{parseFloat(selectedStock.stok_saat_ini)}</strong></p>
                    </div>
                )}
                <form onSubmit={submitAdjust} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Penyesuaian <span className="text-red-500">*</span></label>
                        <select value={adjustData.jenis} onChange={e => setAdjustData('jenis', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="stok_masuk">Stok Masuk (Kulakan/Beli)</option>
                            <option value="stok_keluar">Stok Keluar (Rusak/Hilang)</option>
                            <option value="adjustment">Koreksi Stok (Adjustment)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Unit <span className="text-red-500">*</span></label>
                        <input type="number" step="0.01" min="0.01" value={adjustData.jumlah} onChange={e => setAdjustData('jumlah', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        <p className="text-xs text-slate-500 mt-1">Mendukung bilangan desimal (cth: 1.5)</p>
                        {adjustErrors.jumlah && <span className="text-red-500 text-xs mt-1">{adjustErrors.jumlah}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan / Alasan <span className="text-red-500">*</span></label>
                        <textarea value={adjustData.keterangan} onChange={e => setAdjustData('keterangan', e.target.value)} required placeholder="Contoh: Pembelian baru nota #123" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsAdjustOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={adjustProcessing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            Terapkan Stok
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Settings */}
            <Modal show={isEditOpen} onClose={() => setIsEditOpen(false)} title="Pengaturan Peringatan Stok" maxWidth="sm">
                <form onSubmit={submitEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Stok Minimum (Peringatan) <span className="text-red-500">*</span></label>
                        <input type="number" step="0.01" min="0" value={editData.stok_minimum} onChange={e => setEditData('stok_minimum', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={editProcessing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
