import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, Filter, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import AppLayout from '@/layouts/AppLayout';

interface Employee {
    id: number;
    nama_karyawan: string;
    divisi: string;
    posisi: string;
    jenis_kelamin: string;
    nomor_hp: string;
    upah_borongan: string;
    status: string;
    foto_karyawan?: string;
    [key: string]: any;
}

interface Props {
    employees: {
        data: Employee[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function EmployeeIndex({ employees, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_karyawan: '',
        divisi: '',
        posisi: '',
        jenis_kelamin: 'laki-laki',
        tanggal_lahir: '',
        nomor_hp: '',
        tanggal_bergabung: new Date().toISOString().split('T')[0],
        upah_borongan: '0',
        nomor_rekening: '',
        email: '',
        alamat: '',
        deskripsi: '',
        status: 'aktif',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/employees', { search, status: statusFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (employee: Employee) => {
        setIsEditMode(true);
        setSelectedId(employee.id);
        setData({
            nama_karyawan: employee.nama_karyawan,
            divisi: employee.divisi,
            posisi: employee.posisi,
            jenis_kelamin: employee.jenis_kelamin,
            tanggal_lahir: employee.tanggal_lahir,
            nomor_hp: employee.nomor_hp,
            tanggal_bergabung: employee.tanggal_bergabung,
            upah_borongan: employee.upah_borongan,
            nomor_rekening: employee.nomor_rekening || '',
            email: employee.email || '',
            alamat: employee.alamat || '',
            deskripsi: employee.deskripsi || '',
            status: employee.status,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data karyawan ini?')) {
            destroy(route('employees.destroy', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Karyawan berhasil dihapus'),
                onError: () => toast.error('Gagal menghapus karyawan. Mungkin masih ada relasi data.'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditMode && selectedId) {
            put(route('employees.update', selectedId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Karyawan berhasil diperbarui');
                },
            });
        } else {
            post(route('employees.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Karyawan berhasil ditambahkan');
                },
            });
        }
    };

    const formatRupiah = (angka: string | number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    return (
        <AppLayout>
            <Head title="Data Karyawan" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Karyawan</h1>
                    <p className="text-slate-500 mt-1">Kelola data karyawan produksi dan upah borongan.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Karyawan
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, divisi..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value);
                                router.get('/employees', { search, status: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8"
                        >
                            <option value="">Semua Status</option>
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                            <option value="cuti">Cuti</option>
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Karyawan</th>
                                <th className="px-6 py-4">Posisi / Divisi</th>
                                <th className="px-6 py-4">Upah Borongan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.data.length > 0 ? employees.data.map((employee) => (
                                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                                                {employee.nama_karyawan.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{employee.nama_karyawan}</p>
                                                <p className="text-xs text-slate-500">{employee.nomor_hp}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-700">{employee.posisi}</p>
                                        <p className="text-xs text-slate-500">{employee.divisi}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {formatRupiah(employee.upah_borongan)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                                            employee.status === 'aktif' ? 'bg-green-100 text-green-700' : 
                                            employee.status === 'cuti' ? 'bg-amber-100 text-amber-700' : 
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {employee.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(employee)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(employee.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data karyawan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Sederhana) */}
                {employees.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <span className="text-sm text-slate-500">
                            Menampilkan {employees.data.length} dari {employees.total} data
                        </span>
                        <div className="flex gap-2">
                            {employees.links.map((link, idx) => (
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

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan'} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={data.nama_karyawan} 
                                onChange={e => setData('nama_karyawan', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.nama_karyawan && <span className="text-red-500 text-xs mt-1">{errors.nama_karyawan}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={data.nomor_hp} 
                                onChange={e => setData('nomor_hp', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.nomor_hp && <span className="text-red-500 text-xs mt-1">{errors.nomor_hp}</span>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Divisi <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={data.divisi} 
                                onChange={e => setData('divisi', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.divisi && <span className="text-red-500 text-xs mt-1">{errors.divisi}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Posisi <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={data.posisi} 
                                onChange={e => setData('posisi', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.posisi && <span className="text-red-500 text-xs mt-1">{errors.posisi}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
                            <select 
                                value={data.jenis_kelamin} 
                                onChange={e => setData('jenis_kelamin', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="laki-laki">Laki-laki</option>
                                <option value="perempuan">Perempuan</option>
                            </select>
                            {errors.jenis_kelamin && <span className="text-red-500 text-xs mt-1">{errors.jenis_kelamin}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                            <input 
                                type="date" 
                                value={data.tanggal_lahir} 
                                onChange={e => setData('tanggal_lahir', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.tanggal_lahir && <span className="text-red-500 text-xs mt-1">{errors.tanggal_lahir}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upah Borongan (Rp) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                min="0"
                                value={data.upah_borongan} 
                                onChange={e => setData('upah_borongan', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">Gunakan 0 jika karyawan tetap/gaji bulanan.</p>
                            {errors.upah_borongan && <span className="text-red-500 text-xs mt-1">{errors.upah_borongan}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Bergabung <span className="text-red-500">*</span></label>
                            <input 
                                type="date" 
                                value={data.tanggal_bergabung} 
                                onChange={e => setData('tanggal_bergabung', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.tanggal_bergabung && <span className="text-red-500 text-xs mt-1">{errors.tanggal_bergabung}</span>}
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status Karyawan <span className="text-red-500">*</span></label>
                            <select 
                                value={data.status} 
                                onChange={e => setData('status', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                                <option value="cuti">Cuti</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Karyawan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
