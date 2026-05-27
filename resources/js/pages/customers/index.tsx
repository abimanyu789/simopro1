import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import AppLayout from '@/layouts/AppLayout';

interface Customer {
    id: number;
    kode_customer: string;
    nama_customer: string;
    nama_penanggungjawab?: string;
    kategori: string;
    nomor_hp: string;
    status: string;
    [key: string]: any;
}

export default function CustomerIndex({ customers, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_customer: '',
        nama_penanggungjawab: '',
        kategori: 'retail',
        nomor_hp: '',
        email: '',
        alamat: '',
        kota: '',
        catatan: '',
        status: 'aktif',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customers', { search, kategori: kategoriFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setIsEditMode(true);
        setSelectedId(customer.id);
        setData({
            nama_customer: customer.nama_customer,
            nama_penanggungjawab: customer.nama_penanggungjawab || '',
            kategori: customer.kategori,
            nomor_hp: customer.nomor_hp,
            email: customer.email || '',
            alamat: customer.alamat || '',
            kota: customer.kota || '',
            catatan: customer.catatan || '',
            status: customer.status,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus customer ini?')) {
            destroy(route('customers.destroy', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Customer berhasil dihapus'),
                onError: () => toast.error('Customer tidak dapat dihapus karena memiliki riwayat pesanan.'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditMode && selectedId) {
            put(route('customers.update', selectedId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Customer berhasil diperbarui');
                },
            });
        } else {
            post(route('customers.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Customer berhasil ditambahkan');
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Data Customer" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Customer</h1>
                    <p className="text-slate-500 mt-1">Kelola data klien dan toko pelanggan.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                    <Plus className="w-4 h-4" /> Tambah Customer
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau kode..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={kategoriFilter}
                            onChange={e => {
                                setKategoriFilter(e.target.value);
                                router.get('/customers', { search, kategori: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8"
                        >
                            <option value="">Semua Kategori</option>
                            <option value="retail">Retail</option>
                            <option value="grosir">Grosir</option>
                            <option value="distributor">Distributor</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Kode & Nama</th>
                                <th className="px-6 py-4">Kontak</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.data.length > 0 ? customers.data.map((c: Customer) => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{c.nama_customer}</p>
                                        <p className="text-xs text-slate-500">{c.kode_customer}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-slate-900">{c.nomor_hp}</p>
                                        <p className="text-xs text-slate-500">{c.nama_penanggungjawab || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4 capitalize">{c.kategori}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                                            c.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {c.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditModal(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data customer ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Customer' : 'Tambah Customer'} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Customer/Toko <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nama_customer} onChange={e => setData('nama_customer', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            {errors.nama_customer && <span className="text-red-500 text-xs mt-1">{errors.nama_customer}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Penanggung Jawab</label>
                            <input type="text" value={data.nama_penanggungjawab} onChange={e => setData('nama_penanggungjawab', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nomor_hp} onChange={e => setData('nomor_hp', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                            <select value={data.kategori} onChange={e => setData('kategori', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="retail">Retail</option>
                                <option value="grosir">Grosir</option>
                                <option value="distributor">Distributor</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap <span className="text-red-500">*</span></label>
                            <textarea value={data.alamat} onChange={e => setData('alamat', e.target.value)} required rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kota</label>
                            <input type="text" value={data.kota} onChange={e => setData('kota', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status Kemitraan <span className="text-red-500">*</span></label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            {processing ? 'Menyimpan...' : 'Simpan Customer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
