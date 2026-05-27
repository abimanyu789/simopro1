import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import AppLayout from '@/layouts/AppLayout';

interface Product {
    id: number;
    kode_produk: string;
    nama_produk: string;
    kategori_id: number;
    kategori: { nama_kategori: string };
    warna: string;
    ukuran_tersedia: string[];
    harga_jual: number;
    status: string;
    foto_utama?: string;
    [key: string]: any;
}

export default function ProductIndex({ products, categories, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori_id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        kode_produk: '',
        nama_produk: '',
        kategori_id: '',
        warna: '',
        ukuran_tersedia: '',
        harga_jual: '',
        deskripsi: '',
        status: 'aktif',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/products', { search, kategori_id: kategoriFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setIsEditMode(true);
        setSelectedId(product.id);
        setData({
            kode_produk: product.kode_produk,
            nama_produk: product.nama_produk,
            kategori_id: product.kategori_id.toString(),
            warna: product.warna,
            ukuran_tersedia: product.ukuran_tersedia.join(', '),
            harga_jual: product.harga_jual.toString(),
            deskripsi: product.deskripsi || '',
            status: product.status,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus produk ini? (Data riwayat pesanan akan tetap aman)')) {
            destroy(route('products.destroy', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Produk berhasil dihapus (Soft Delete)'),
                onError: () => toast.error('Gagal menghapus produk.'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditMode && selectedId) {
            put(route('products.update', selectedId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Produk berhasil diperbarui');
                },
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Produk berhasil ditambahkan');
                },
            });
        }
    };

    const formatRupiah = (angka: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    return (
        <AppLayout>
            <Head title="Data Produk" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Produk Sepatu</h1>
                    <p className="text-slate-500 mt-1">Kelola master data produk sepatu yang dijual Provillo.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                    <Plus className="w-4 h-4" /> Tambah Produk
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau kode produk..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={kategoriFilter}
                            onChange={e => {
                                setKategoriFilter(e.target.value);
                                router.get('/products', { search, kategori_id: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                            ))}
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Kode & Produk</th>
                                <th className="px-6 py-4">Warna & Ukuran</th>
                                <th className="px-6 py-4">Harga Jual</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.data.length > 0 ? products.data.map((item: Product) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.foto_utama ? (
                                                <img src={item.foto_utama} alt={item.nama_produk} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900">{item.nama_produk}</p>
                                                <div className="flex gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-500">{item.kode_produk}</span>
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{item.kategori?.nama_kategori}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-700 mb-1">{item.warna}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {item.ukuran_tersedia.map(ukuran => (
                                                <span key={ukuran} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded shadow-sm">
                                                    {ukuran}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                        {formatRupiah(item.harga_jual)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                                            item.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data produk ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kode Produk <span className="text-red-500">*</span></label>
                            <input type="text" value={data.kode_produk} onChange={e => setData('kode_produk', e.target.value)} required placeholder="Contoh: PRV-SNEAKER-01" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 uppercase" />
                            {errors.kode_produk && <span className="text-red-500 text-xs mt-1">{errors.kode_produk}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nama_produk} onChange={e => setData('nama_produk', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            {errors.nama_produk && <span className="text-red-500 text-xs mt-1">{errors.nama_produk}</span>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                            <select value={data.kategori_id} onChange={e => setData('kategori_id', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Warna <span className="text-red-500">*</span></label>
                            <input type="text" value={data.warna} onChange={e => setData('warna', e.target.value)} required placeholder="Hitam, Putih, dll" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ukuran Tersedia <span className="text-red-500">*</span></label>
                            <input type="text" value={data.ukuran_tersedia} onChange={e => setData('ukuran_tersedia', e.target.value)} required placeholder="38, 39, 40, 41, 42" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            <p className="text-xs text-slate-500 mt-1">Pisahkan dengan koma (,). Contoh: 38, 39, 40</p>
                            {errors.ukuran_tersedia && <span className="text-red-500 text-xs mt-1">{errors.ukuran_tersedia}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual (Rp) <span className="text-red-500">*</span></label>
                            <input type="number" min="0" value={data.harga_jual} onChange={e => setData('harga_jual', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status <span className="text-red-500">*</span></label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Produk</label>
                            <textarea value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
                            {processing ? 'Menyimpan...' : 'Simpan Produk'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
