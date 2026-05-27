import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import AppLayout from '@/layouts/AppLayout';

interface Category {
    id: number;
    nama_kategori: string;
    tipe: string;
    deskripsi?: string;
    [key: string]: any;
}

export default function CategoryIndex({ categories, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.tipe || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_kategori: '',
        tipe: 'both',
        deskripsi: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/categories', { search, tipe: typeFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setIsEditMode(true);
        setSelectedId(category.id);
        setData({
            nama_kategori: category.nama_kategori,
            tipe: category.tipe,
            deskripsi: category.deskripsi || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus kategori ini?')) {
            destroy(route('categories.destroy', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Kategori berhasil dihapus'),
                onError: () => toast.error('Kategori tidak dapat dihapus karena masih digunakan.'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditMode && selectedId) {
            put(route('categories.update', selectedId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Kategori berhasil diperbarui');
                },
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Kategori berhasil ditambahkan');
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Kategori" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kategori</h1>
                    <p className="text-slate-500 mt-1">Kelola kategori untuk produk dan bahan baku.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                    <Plus className="w-4 h-4" /> Tambah Kategori
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama kategori..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={e => {
                                setTypeFilter(e.target.value);
                                router.get('/categories', { search, tipe: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8"
                        >
                            <option value="">Semua Tipe</option>
                            <option value="product">Produk Saja</option>
                            <option value="raw_material">Bahan Baku Saja</option>
                            <option value="both">Keduanya</option>
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Nama Kategori</th>
                                <th className="px-6 py-4">Tipe</th>
                                <th className="px-6 py-4">Deskripsi</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.data.length > 0 ? categories.data.map((cat: Category) => (
                                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{cat.nama_kategori}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                                            cat.tipe === 'product' ? 'bg-blue-100 text-blue-700' : 
                                            cat.tipe === 'raw_material' ? 'bg-amber-100 text-amber-700' : 
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {cat.tipe === 'both' ? 'KEDUANYA' : cat.tipe.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{cat.deskripsi || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditModal(cat)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada kategori ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Kategori' : 'Tambah Kategori'} maxWidth="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori <span className="text-red-500">*</span></label>
                        <input type="text" value={data.nama_kategori} onChange={e => setData('nama_kategori', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        {errors.nama_kategori && <span className="text-red-500 text-xs mt-1">{errors.nama_kategori}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Penggunaan <span className="text-red-500">*</span></label>
                        <select value={data.tipe} onChange={e => setData('tipe', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="both">Keduanya (Bisa dipakai di Produk & Bahan)</option>
                            <option value="product">Hanya Produk Jadi</option>
                            <option value="raw_material">Hanya Bahan Baku</option>
                        </select>
                        {errors.tipe && <span className="text-red-500 text-xs mt-1">{errors.tipe}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                        <textarea value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
