import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Search, Settings2, ArrowRightLeft, Package } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import AppLayout from '@/layouts/AppLayout';

export default function ProductStockIndex({ stocks, products, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    
    // Setup Modal
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const { data: setupData, setData: setSetupData, post: postSetup, processing: setupProcessing, reset: resetSetup, errors: setupErrors } = useForm({
        produk_id: '',
        ukuran: '',
        warna: '',
        stok_minimum: '5',
        stok_awal: '0',
        keterangan: '',
    });

    // Edit Minimum Modal
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors } = useForm({
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
        router.get('/product-stocks', { search, status: statusFilter }, { preserveState: true });
    };

    const openSetupModal = () => {
        resetSetup();
        setIsSetupOpen(true);
    };

    const submitSetup = (e: React.FormEvent) => {
        e.preventDefault();
        postSetup(route('product-stocks.store'), {
            onSuccess: () => {
                setIsSetupOpen(false);
                toast.success('Varian stok berhasil ditambahkan');
            }
        });
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
            putEdit(route('product-stocks.update', selectedId), {
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
            postAdjust(route('product-stocks.adjust', selectedStock.id), {
                onSuccess: () => {
                    setIsAdjustOpen(false);
                    toast.success('Stok berhasil disesuaikan');
                }
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Stok Produk Jadi" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Stok Produk Jadi</h1>
                    <p className="text-slate-500 mt-1">Pantau ketersediaan dan penyesuaian stok produk.</p>
                </div>
                <button onClick={openSetupModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                    <Plus className="w-4 h-4" /> Setup Varian Stok
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value);
                                router.get('/product-stocks', { search, status: e.target.value }, { preserveState: true });
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
                                <th className="px-6 py-4">Produk</th>
                                <th className="px-6 py-4 text-center">Ukuran</th>
                                <th className="px-6 py-4 text-center">Warna</th>
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
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{stock.produk?.nama_produk}</p>
                                                <p className="text-xs text-slate-500">{stock.produk?.kode_produk}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium">{stock.ukuran}</td>
                                    <td className="px-6 py-4 text-center">{stock.warna}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg">
                                        {stock.stok_saat_ini}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500">
                                        {stock.stok_minimum}
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
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data stok ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Setup Stok Baru */}
            <Modal show={isSetupOpen} onClose={() => setIsSetupOpen(false)} title="Setup Varian Stok Baru" maxWidth="md">
                <form onSubmit={submitSetup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Produk Induk <span className="text-red-500">*</span></label>
                        <select value={setupData.produk_id} onChange={e => setSetupData('produk_id', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="" disabled>Pilih Produk...</option>
                            {products.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.kode_produk} - {p.nama_produk}</option>
                            ))}
                        </select>
                        {setupErrors.produk_id && <span className="text-red-500 text-xs mt-1">{setupErrors.produk_id}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ukuran <span className="text-red-500">*</span></label>
                            <input type="text" value={setupData.ukuran} onChange={e => setSetupData('ukuran', e.target.value)} required placeholder="Contoh: 39" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            {setupErrors.ukuran && <span className="text-red-500 text-xs mt-1">{setupErrors.ukuran}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Warna <span className="text-red-500">*</span></label>
                            <input type="text" value={setupData.warna} onChange={e => setSetupData('warna', e.target.value)} required placeholder="Contoh: Hitam" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal</label>
                            <input type="number" min="0" value={setupData.stok_awal} onChange={e => setSetupData('stok_awal', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Peringatan Min. Stok</label>
                            <input type="number" min="0" value={setupData.stok_minimum} onChange={e => setSetupData('stok_minimum', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Tambahan</label>
                        <input type="text" value={setupData.keterangan} onChange={e => setSetupData('keterangan', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsSetupOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={setupProcessing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            {setupProcessing ? 'Menyimpan...' : 'Simpan Setup'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Penyesuaian Stok (Adjust) */}
            <Modal show={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title="Penyesuaian Stok (Manual)" maxWidth="sm">
                {selectedStock && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                        <p className="font-bold">{selectedStock.produk?.nama_produk}</p>
                        <p>Ukuran: {selectedStock.ukuran} | Warna: {selectedStock.warna}</p>
                        <p className="mt-1">Stok Saat Ini: <strong>{selectedStock.stok_saat_ini}</strong></p>
                    </div>
                )}
                <form onSubmit={submitAdjust} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Penyesuaian <span className="text-red-500">*</span></label>
                        <select value={adjustData.jenis} onChange={e => setAdjustData('jenis', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="stok_masuk">Stok Masuk (Bertambah)</option>
                            <option value="stok_keluar">Stok Keluar (Berkurang)</option>
                            <option value="adjustment">Koreksi Stok (Adjustment)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Unit <span className="text-red-500">*</span></label>
                        <input type="number" min="1" value={adjustData.jumlah} onChange={e => setAdjustData('jumlah', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        {adjustErrors.jumlah && <span className="text-red-500 text-xs mt-1">{adjustErrors.jumlah}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan / Alasan <span className="text-red-500">*</span></label>
                        <textarea value={adjustData.keterangan} onChange={e => setAdjustData('keterangan', e.target.value)} required placeholder="Contoh: Barang retur, stok opname, dll" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsAdjustOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={adjustProcessing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            {adjustProcessing ? 'Menyimpan...' : 'Terapkan Stok'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Settings */}
            <Modal show={isEditOpen} onClose={() => setIsEditOpen(false)} title="Pengaturan Peringatan Stok" maxWidth="sm">
                <form onSubmit={submitEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Stok Minimum (Peringatan) <span className="text-red-500">*</span></label>
                        <input type="number" min="0" value={editData.stok_minimum} onChange={e => setEditData('stok_minimum', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Tambahan</label>
                        <textarea value={editData.keterangan} onChange={e => setEditData('keterangan', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
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
