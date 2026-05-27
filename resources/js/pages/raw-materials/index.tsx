import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import Modal from '@/components/Modal';
import { Plus, Search, Edit2, Trash2, Box } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RawMaterial {
    id: number;
    kode_bahan: string;
    nama_bahan: string;
    kategori_id: number;
    kategori: { nama_kategori: string };
    satuan: string;
    harga_beli: number;
    status: string;
    deskripsi?: string;
    [key: string]: any;
}

export default function RawMaterialIndex({ rawMaterials, categories, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori_id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        kode_bahan: '',
        nama_bahan: '',
        kategori_id: '',
        satuan: '',
        harga_beli: '',
        deskripsi: '',
        status: 'aktif',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/raw-materials', { search, kategori_id: kategoriFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (material: RawMaterial) => {
        setIsEditMode(true);
        setSelectedId(material.id);
        setData({
            kode_bahan: material.kode_bahan,
            nama_bahan: material.nama_bahan,
            kategori_id: material.kategori_id.toString(),
            satuan: material.satuan,
            harga_beli: material.harga_beli.toString(),
            deskripsi: material.deskripsi || '',
            status: material.status,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus bahan baku ini?')) {
            destroy(route('raw-materials.destroy', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Bahan baku berhasil dihapus'),
                onError: () => toast.error('Gagal menghapus. Bahan baku ini mungkin masih digunakan dalam BOM.'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditMode && selectedId) {
            put(route('raw-materials.update', selectedId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Bahan baku berhasil diperbarui');
                },
            });
        } else {
            post(route('raw-materials.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Bahan baku berhasil ditambahkan');
                },
            });
        }
    };

    const formatRupiah = (angka: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    return (
        <AppLayout>
            <Head title="Data Bahan Baku" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bahan Baku</h1>
                    <p className="text-slate-500 mt-1">Kelola master data bahan baku untuk produksi.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                    <Plus className="w-4 h-4" /> Tambah Bahan Baku
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau kode bahan..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={kategoriFilter}
                            onChange={e => {
                                setKategoriFilter(e.target.value);
                                router.get('/raw-materials', { search, kategori_id: e.target.value }, { preserveState: true });
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
                                <th className="px-6 py-4">Kode & Nama</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Harga Beli / Satuan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rawMaterials.data.length > 0 ? rawMaterials.data.map((item: RawMaterial) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{item.nama_bahan}</p>
                                                <p className="text-xs text-slate-500">{item.kode_bahan}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">
                                            {item.kategori?.nama_kategori}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-700">{formatRupiah(item.harga_beli)}</p>
                                        <p className="text-xs text-slate-500">per {item.satuan}</p>
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
                                        Tidak ada bahan baku ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kode Bahan <span className="text-red-500">*</span></label>
                            <input type="text" value={data.kode_bahan} onChange={e => setData('kode_bahan', e.target.value)} required placeholder="Contoh: RM-KULIT-01" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 uppercase" />
                            {errors.kode_bahan && <span className="text-red-500 text-xs mt-1">{errors.kode_bahan}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bahan Baku <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nama_bahan} onChange={e => setData('nama_bahan', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            {errors.nama_bahan && <span className="text-red-500 text-xs mt-1">{errors.nama_bahan}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                            <select value={data.kategori_id} onChange={e => setData('kategori_id', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                                ))}
                            </select>
                            {errors.kategori_id && <span className="text-red-500 text-xs mt-1">{errors.kategori_id}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Satuan Ukur <span className="text-red-500">*</span></label>
                            <input type="text" value={data.satuan} onChange={e => setData('satuan', e.target.value)} required placeholder="Contoh: meter, kg, pcs, roll" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli Default (Rp) <span className="text-red-500">*</span></label>
                            <input type="number" min="0" value={data.harga_beli} onChange={e => setData('harga_beli', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status <span className="text-red-500">*</span></label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Tambahan</label>
                            <textarea value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            {processing ? 'Menyimpan...' : 'Simpan Bahan Baku'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
