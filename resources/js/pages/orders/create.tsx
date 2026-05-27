import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Plus, Trash2, Save, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OrderCreate({ customers, products }: any) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        tanggal_pesanan: new Date().toISOString().split('T')[0],
        tenggat_waktu: '',
        catatan: '',
        items: [] as any[],
    });

    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedQty, setSelectedQty] = useState('1');

    // Helper to find selected product object
    const currentProduct = products.find((p: any) => p.id.toString() === selectedProduct);

    const addItem = () => {
        if (!selectedProduct || !selectedSize || !selectedQty || parseInt(selectedQty) < 1) {
            toast.error('Harap lengkapi detail item dengan benar.');
            return;
        }

        const newItem = {
            produk_id: parseInt(selectedProduct),
            nama_produk: currentProduct?.nama_produk,
            harga_satuan: currentProduct?.harga_jual,
            ukuran: selectedSize,
            warna: selectedColor || currentProduct?.warna,
            kuantitas: parseInt(selectedQty),
        };

        setData('items', [...data.items, newItem]);
        
        // Reset sub-form
        setSelectedProduct('');
        setSelectedSize('');
        setSelectedColor('');
        setSelectedQty('1');
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (data.items.length === 0) {
            toast.error('Pesanan harus memiliki minimal 1 item.');
            return;
        }

        post(route('orders.store'), {
            onError: (err) => {
                toast.error('Gagal membuat pesanan. Periksa input Anda.');
                console.error(err);
            }
        });
    };

    const formatRupiah = (angka: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    const calculateTotal = () => {
        return data.items.reduce((total, item) => total + (item.harga_satuan * item.kuantitas), 0);
    };

    return (
        <AppLayout>
            <Head title="Buat Pesanan Baru" />

            <div className="mb-6">
                <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pesanan
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Buat Pesanan Baru</h1>
                    <p className="text-slate-500 mt-1">Isi formulir pesanan dan tambahkan item keranjang.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bagian Kiri: Informasi Pesanan (2 kolom di layar besar) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Informasi Utama</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Customer <span className="text-red-500">*</span></label>
                                <select 
                                    value={data.customer_id} 
                                    onChange={e => setData('customer_id', e.target.value)} 
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="" disabled>Pilih Customer...</option>
                                    {customers.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.kode_customer} - {c.nama_customer}</option>
                                    ))}
                                </select>
                                {errors.customer_id && <span className="text-red-500 text-xs mt-1">{errors.customer_id}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Pesanan <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    value={data.tanggal_pesanan} 
                                    onChange={e => setData('tanggal_pesanan', e.target.value)} 
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.tanggal_pesanan && <span className="text-red-500 text-xs mt-1">{errors.tanggal_pesanan}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tenggat Waktu / Deadline <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    value={data.tenggat_waktu} 
                                    onChange={e => setData('tenggat_waktu', e.target.value)} 
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.tenggat_waktu && <span className="text-red-500 text-xs mt-1">{errors.tenggat_waktu}</span>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Pesanan</label>
                                <textarea 
                                    value={data.catatan} 
                                    onChange={e => setData('catatan', e.target.value)} 
                                    rows={2}
                                    placeholder="Contoh: Pengiriman dibagi 2 termin..."
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Keranjang Belanja */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                Item Pesanan <span className="text-red-500">*</span>
                            </h2>
                            <span className="text-sm font-medium text-slate-500">{data.items.length} item</span>
                        </div>
                        
                        {/* Tambah Item Form (Inline) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Produk</label>
                                <select 
                                    value={selectedProduct} 
                                    onChange={e => setSelectedProduct(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="" disabled>Pilih Produk...</option>
                                    {products.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.nama_produk} ({formatRupiah(p.harga_jual)})</option>
                                    ))}
                                </select>
                            </div>
                            {currentProduct && (
                                <>
                                    <div className="w-24">
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Ukuran</label>
                                        <select 
                                            value={selectedSize} 
                                            onChange={e => setSelectedSize(e.target.value)} 
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="" disabled>Pilih</option>
                                            {currentProduct.ukuran_tersedia.map((s: string) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Warna</label>
                                        <input 
                                            type="text" 
                                            value={selectedColor || currentProduct.warna} 
                                            onChange={e => setSelectedColor(e.target.value)} 
                                            placeholder={currentProduct.warna}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="w-24">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Qty</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={selectedQty} 
                                    onChange={e => setSelectedQty(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={addItem}
                                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors"
                            >
                                Tambah
                            </button>
                        </div>

                        {/* Item List Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 font-semibold text-xs border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3 text-center">Varian</th>
                                        <th className="px-4 py-3 text-center">Harga Satuan</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.items.length > 0 ? data.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{item.nama_produk}</td>
                                            <td className="px-4 py-3 text-center text-xs">
                                                {item.ukuran} | {item.warna}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {formatRupiah(item.harga_satuan)}
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold">
                                                {item.kuantitas}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-800">
                                                {formatRupiah(item.harga_satuan * item.kuantitas)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                                Keranjang masih kosong. Tambahkan produk di atas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {errors.items && <p className="text-red-500 text-sm mt-3 font-medium">{errors.items}</p>}
                    </div>
                </div>

                {/* Bagian Kanan: Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6 sticky top-6 text-white">
                        <h2 className="text-lg font-bold mb-4 border-b border-slate-700 pb-3">Ringkasan Pesanan</h2>
                        
                        <div className="space-y-3 mb-6 text-sm">
                            <div className="flex justify-between items-center text-slate-300">
                                <span>Total Item</span>
                                <span className="font-bold text-white">{data.items.reduce((acc, item) => acc + item.kuantitas, 0)} Unit</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                                <span>PPN / Pajak</span>
                                <span className="font-bold text-white">Rp 0</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700 mb-8">
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Tagihan</p>
                            <p className="text-3xl font-black text-emerald-400">{formatRupiah(calculateTotal())}</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing || data.items.length === 0}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/50"
                        >
                            <Save className="w-5 h-5" />
                            {processing ? 'Menyimpan...' : 'Simpan & Buat Pesanan'}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4">
                            Pastikan data pesanan sudah sesuai sebelum disimpan.
                        </p>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
