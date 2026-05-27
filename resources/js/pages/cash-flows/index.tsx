import { useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import Modal from '@/components/Modal';
import { Plus, Search, Trash2, Wallet, ArrowDownToLine, ArrowUpToLine, History } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Chart from 'react-apexcharts';

export default function CashFlowIndex({ cashFlows, summary, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [jenisFilter, setJenisFilter] = useState(filters.jenis || '');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        jenis: 'pemasukan',
        kategori: 'penjualan',
        nominal: '',
        tanggal_transaksi: new Date().toISOString().split('T')[0],
        deskripsi: '',
        catatan: '',
        referensi_order: '',
    });

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/cash-flows', { search, jenis: jenisFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cash-flows.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                toast.success('Transaksi kas berhasil dicatat');
            }
        });
    };

    const openDeleteModal = (cf: any) => {
        setSelectedLog(cf);
        setIsDeleteOpen(true);
    };

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLog) {
            router.delete(route('cash-flows.destroy', selectedLog.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    toast.success('Transaksi dihapus secara sistem');
                }
            });
        }
    };

    const formatRupiah = (angka: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka));
    };

    // Calculate Chart Data based on current paginated data for demo purposes, 
    // ideally should be passed from backend
    const chartData = useMemo(() => {
        const categories: string[] = [];
        const pemasukan: number[] = [];
        const pengeluaran: number[] = [];

        // Simple aggregation by date from visible data
        const dateMap = new Map<string, { in: number, out: number }>();
        
        [...cashFlows.data].reverse().forEach((cf: any) => {
            const date = cf.tanggal_transaksi;
            if (!dateMap.has(date)) {
                dateMap.set(date, { in: 0, out: 0 });
            }
            if (cf.jenis === 'pemasukan') {
                dateMap.get(date)!.in += cf.nominal;
            } else {
                dateMap.get(date)!.out += cf.nominal;
            }
        });

        dateMap.forEach((val, key) => {
            categories.push(format(new Date(key), 'dd MMM', { locale: id }));
            pemasukan.push(val.in);
            pengeluaran.push(val.out);
        });

        return { categories, pemasukan, pengeluaran };
    }, [cashFlows]);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
        colors: ['#059669', '#dc2626'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories: chartData.categories },
        yaxis: { labels: { formatter: (val) => 'Rp ' + (val / 1000000).toFixed(1) + 'M' } },
        legend: { position: 'top', horizontalAlign: 'right' },
    };

    const series = [
        { name: 'Pemasukan', data: chartData.pemasukan },
        { name: 'Pengeluaran', data: chartData.pengeluaran }
    ];

    return (
        <AppLayout>
            <Head title="Arus Kas & Keuangan" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Arus Kas (Cash Flow)</h1>
                    <p className="text-slate-500 mt-1">Pantau pergerakan finansial, pemasukan pesanan, dan pengeluaran bahan/upah.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 font-medium text-sm">
                    <Plus className="w-4 h-4" /> Catat Transaksi Manual
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <Wallet className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium mb-1">Saldo Kas Saat Ini</p>
                        <h2 className="text-2xl font-black text-white">{formatRupiah(summary.saldoSaatIni)}</h2>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                        <ArrowDownToLine className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Total Pemasukan</p>
                        <h2 className="text-2xl font-bold text-emerald-600">{formatRupiah(summary.totalPemasukan)}</h2>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                        <ArrowUpToLine className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Total Pengeluaran</p>
                        <h2 className="text-2xl font-bold text-red-600">{formatRupiah(summary.totalPengeluaran)}</h2>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Tren Arus Kas Bulanan</h3>
                <div className="h-72">
                    {chartData.categories.length > 0 ? (
                        <Chart options={chartOptions} series={series} type="line" height="100%" />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada data yang cukup untuk chart ini.</div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between bg-slate-50/50">
                    <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Cari deskripsi..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <select value={jenisFilter} onChange={e => { setJenisFilter(e.target.value); router.get('/cash-flows', { search, jenis: e.target.value }, { preserveState: true }); }} className="rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 min-w-[160px]">
                            <option value="">Semua Transaksi</option>
                            <option value="pemasukan">Hanya Pemasukan</option>
                            <option value="pengeluaran">Hanya Pengeluaran</option>
                        </select>
                        <button type="submit" className="hidden">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Waktu Transaksi</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Deskripsi</th>
                                <th className="px-6 py-4 text-right">Nominal</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cashFlows.data.length > 0 ? cashFlows.data.map((cf: any) => (
                                <tr key={cf.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{format(new Date(cf.tanggal_transaksi), 'dd MMM yyyy', { locale: id })}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide border border-slate-200">
                                            {cf.kategori.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 max-w-[250px] truncate" title={cf.deskripsi}>{cf.deskripsi || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-black text-lg flex justify-end items-center gap-1 ${cf.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {cf.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(cf.nominal)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openDeleteModal(cf)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus / Batalkan Transaksi">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p>Tidak ada riwayat transaksi kas yang ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Transaksi Kas" maxWidth="2xl">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Transaksi <span className="text-red-500">*</span></label>
                            <select value={data.jenis} onChange={e => {
                                setData('jenis', e.target.value);
                                setData('kategori', e.target.value === 'pemasukan' ? 'penjualan' : 'operasional');
                            }} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-bold">
                                <option value="pemasukan">PEMASUKAN</option>
                                <option value="pengeluaran">PENGELUARAN</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                            <select value={data.kategori} onChange={e => setData('kategori', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                {data.jenis === 'pemasukan' ? (
                                    <>
                                        <option value="penjualan">Penjualan Pesanan</option>
                                        <option value="pemasukan_lainnya">Pemasukan Lainnya</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="operasional">Biaya Operasional</option>
                                        <option value="belanja_bahan">Belanja Bahan Baku</option>
                                        <option value="upah_karyawan">Upah Karyawan</option>
                                        <option value="pengambilan_pribadi">Pengambilan Pribadi (Prive)</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat <span className="text-red-500">*</span></label>
                            <input type="text" value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} required maxLength={500} placeholder="Contoh: Pembayaran DP PO-001 / Beli lem kuning 2 kaleng" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nominal (Rp) <span className="text-red-500">*</span></label>
                            <input type="number" min="1" value={data.nominal} onChange={e => setData('nominal', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-bold text-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Transaksi <span className="text-red-500">*</span></label>
                            <input type="date" value={data.tanggal_transaksi} onChange={e => setData('tanggal_transaksi', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${data.jenis === 'pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {processing ? 'Menyimpan...' : `Simpan ${data.jenis}`}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal show={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Konfirmasi Hapus Transaksi" maxWidth="sm">
                <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                    <p className="font-bold mb-1">Dampak Penghapusan</p>
                    <p>Penghapusan ini akan memulihkan saldo dan <strong>mengubah saldo sebesar {selectedLog?.jenis === 'pemasukan' ? '-' : '+'}{selectedLog ? formatRupiah(selectedLog.nominal) : ''}</strong>.</p>
                </div>
                <form onSubmit={handleDelete} className="flex justify-end gap-3">
                    <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">Ya, Hapus</button>
                </form>
            </Modal>
        </AppLayout>
    );
}
