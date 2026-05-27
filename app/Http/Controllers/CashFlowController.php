<?php

namespace App\Http\Controllers;

use App\Models\CashFlow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Controller untuk Manajemen Arus Kas (Cash Flow).
 * Bertujuan mencatat semua transaksi uang masuk dan keluar secara terpusat.
 */
class CashFlowController extends Controller
{
    /**
     * Menampilkan daftar arus kas dengan fitur filter dan agregasi total.
     * Mengembalikan render halaman React (Inertia) dengan data yang terstruktur.
     */
    public function index(Request $request)
    {
        // 1. Inisialisasi query builder
        $query = CashFlow::query();

        // 2. Filter berdasarkan pencarian deskripsi
        if ($request->has('search') && $request->search != '') {
            $query->where('deskripsi', 'like', '%' . $request->search . '%')
                  ->orWhere('catatan', 'like', '%' . $request->search . '%');
        }

        // 3. Filter berdasarkan jenis transaksi (pemasukan/pengeluaran)
        if ($request->has('jenis') && $request->jenis != '') {
            $query->where('jenis', $request->jenis);
        }

        // 4. Ambil data dengan paginasi
        $cashFlows = $query->latest('tanggal_transaksi')->paginate(15)->withQueryString();

        // 5. Kalkulasi agregat untuk dashboard mini di atas tabel
        $totalPemasukan = CashFlow::where('jenis', 'pemasukan')->sum('nominal');
        $totalPengeluaran = CashFlow::where('jenis', 'pengeluaran')->sum('nominal');
        $saldoSaatIni = $totalPemasukan - $totalPengeluaran;

        return Inertia::render('cash-flows/index', [
            'cashFlows' => $cashFlows,
            'summary' => [
                'totalPemasukan' => $totalPemasukan,
                'totalPengeluaran' => $totalPengeluaran,
                'saldoSaatIni' => $saldoSaatIni
            ],
            'filters' => $request->only(['search', 'jenis']),
        ]);
    }

    /**
     * Menyimpan data arus kas baru ke database.
     * Tervalidasi secara ketat untuk mencegah kebocoran/manipulasi nominal kas.
     */
    public function store(Request $request)
    {
        // Validasi input data dari frontend
        $validated = $request->validate([
            'tanggal_transaksi' => 'required|date',
            'jenis'             => ['required', Rule::in(['pemasukan', 'pengeluaran'])],
            'kategori'          => 'required|string',
            'deskripsi'         => 'required|string|max:500',
            'nominal'           => 'required|integer|min:1',
            'referensi_order'   => 'nullable|exists:orders,id',
            'bukti_transaksi'   => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'catatan'           => 'nullable|string',
        ]);

        $kategoriPemasukan = CashFlow::KATEGORI_PEMASUKAN;
        $kategoriPengeluaran = CashFlow::KATEGORI_PENGELUARAN;
        
        $validKategori = $request->jenis === 'pemasukan' ? $kategoriPemasukan : $kategoriPengeluaran;
        
        if (!in_array($request->kategori, $validKategori)) {
            throw ValidationException::withMessages([
                'kategori' => 'Kategori tidak valid untuk jenis transaksi ini.'
            ]);
        }

        $validated['created_by'] = auth()->id();

        if ($request->hasFile('bukti_transaksi')) {
            $validated['bukti_transaksi'] = $request->file('bukti_transaksi')->store('cash_flows', 'public');
        }

        DB::transaction(function () use ($validated) {
            CashFlow::create($validated);
        });

        return redirect()->back()->with('success', 'Transaksi arus kas berhasil dicatat.');
    }

    /**
     * Menghapus transaksi kas jika terjadi kesalahan input.
     */
    public function destroy(CashFlow $cashFlow)
    {
        $cashFlow->delete();
        return redirect()->back()->with('success', 'Transaksi berhasil dihapus.');
    }
}
