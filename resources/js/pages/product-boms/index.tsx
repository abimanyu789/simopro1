import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Search, Layers, ChevronRight } from 'lucide-react';

export default function ProductBomIndex({ products, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/product-boms', { search }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Bill of Materials" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bill of Materials (BOM)</h1>
                    <p className="text-slate-500 mt-1">Pilih produk untuk mengatur komposisi bahan baku (resep).</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <form onSubmit={handleSearch} className="max-w-md relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau kode produk..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x lg:divide-x-0">
                    {products.data.length > 0 ? products.data.map((product: any) => (
                        <div key={product.id} className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-100 lg:border-b-0">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">{product.nama_produk}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{product.kode_produk}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                    product.bom_count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {product.bom_count} BAHAN
                                </span>
                            </div>
                            
                            <div className="mt-6 flex justify-between items-center">
                                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                                    <Layers className="w-4 h-4" />
                                    Komposisi BOM
                                </span>
                                <Link 
                                    href={`/product-boms/${product.id}`}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    Kelola <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center text-slate-500">
                            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p>Tidak ada produk ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
