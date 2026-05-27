import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Edit2, Package, Box, Layers } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import AppLayout from '@/layouts/AppLayout';

export default function ProductBomShow({ product, boms, rawMaterials }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        bahan_id: '',
        jumlah_per_unit: '',
    });

    const openCreateModal = () => {
        setIsEditMode(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (bom: any) => {
        setIsEditMode(true);
        setSelectedId(bom.id);
        setData({
            bahan_id: bom.bahan_id.toString(),
            jumlah_per_unit: parseFloat(bom.jumlah_per_unit).toString(),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin menghapus komponen ini dari BOM?')) {
            destroy(route('product-boms.destroy', { product: product.id, bom: id }), {
                preserveScroll: true,
                onSuccess: () => toast.success('Komponen dihapus dari BOM'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditMode && selectedId) {
            put(route('product-boms.update', { product: product.id, bom: selectedId }), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Komponen BOM diperbarui');
                },
            });
        } else {
            post(route('product-boms.store', product.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Komponen BOM ditambahkan');
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`BOM: ${product.nama_produk}`} />

            <div className="mb-6">
                <Link href="/product-boms" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Produk
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <Package className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{product.nama_produk}</h1>
                        <p className="text-slate-500 mt-0.5 text-sm">
                            Kode: {product.kode_produk} &bull; Kategori: {product.kategori?.nama_kategori}
                        </p>
                    </div>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                    <Plus className="w-4 h-4" /> Tambah Komponen
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-slate-400" />
                        Komposisi Bahan Baku (Resep)
                    </h3>
                    <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded">
                        TOTAL: {boms.length} BAHAN
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Bahan Baku</th>
                                <th className="px-6 py-4 text-center">Kebutuhan Per 1 Unit Produk</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {boms.length > 0 ? boms.map((bom: any) => (
                                <tr key={bom.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                                <Box className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{bom.bahan?.nama_bahan}</p>
                                                <p className="text-xs text-slate-500">{bom.bahan?.kode_bahan}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-lg font-bold text-slate-900 mr-2">{parseFloat(bom.jumlah_per_unit)}</span>
                                        <span className="text-slate-500 font-medium">{bom.satuan}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(bom)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(bom.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center text-slate-500">
                                        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p>Belum ada bahan baku yang didaftarkan untuk produk ini.</p>
                                        <button onClick={openCreateModal} className="mt-4 text-blue-600 font-medium hover:underline">
                                            + Tambah Bahan Pertama
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Komponen BOM' : 'Tambah Komponen BOM'} maxWidth="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Bahan Baku <span className="text-red-500">*</span></label>
                            <select 
                                value={data.bahan_id} 
                                onChange={e => setData('bahan_id', e.target.value)} 
                                required 
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled>Pilih bahan baku...</option>
                                {rawMaterials.map((rm: any) => (
                                    <option key={rm.id} value={rm.id}>{rm.kode_bahan} - {rm.nama_bahan} ({rm.satuan})</option>
                                ))}
                            </select>
                            {errors.bahan_id && <span className="text-red-500 text-xs mt-1">{errors.bahan_id}</span>}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Jumlah Kebutuhan (Per 1 Unit Produk) <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="number" 
                            step="0.001" 
                            min="0.001"
                            value={data.jumlah_per_unit} 
                            onChange={e => setData('jumlah_per_unit', e.target.value)} 
                            required 
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <p className="text-xs text-slate-500 mt-1">Gunakan desimal jika perlu (contoh: 0.5)</p>
                        {errors.jumlah_per_unit && <span className="text-red-500 text-xs mt-1">{errors.jumlah_per_unit}</span>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                            {processing ? 'Menyimpan...' : 'Simpan BOM'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
