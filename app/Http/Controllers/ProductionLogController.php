<?php

namespace App\Http\Controllers;

use App\Models\ProductionLog;
use App\Models\Order;
use App\Models\Employee;
use App\Services\ProductionLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Controller: ProductionLogController
 *
 * Mengelola antarmuka (HTTP interface) untuk proses pencatatan produksi harian sepatu.
 * Menerima request dari form, memvalidasi parameter dasar, dan meneruskan eksekusi 
 * bisnis kompleks (kalkulasi BOM, upah, stok) ke ProductionLogService.
 */
class ProductionLogController extends Controller
{
    /**
     * Menampilkan halaman indeks Log Produksi.
     * 
     * Tujuan: Memuat tabel riwayat pengerjaan produksi.
     * State Management: Mendukung filter berdasarkan 'search' (nama karyawan/nomor PO) 
     * dan 'status' (dalam_proses / selesai).
     * 
     * @param Request $request
     */
    public function index(Request $request)
    {
        $query = ProductionLog::with(['karyawan', 'order', 'orderItem.product']);

        if ($request->has('search') && $request->search != '') {
            $query->whereHas('order', function($q) use ($request) {
                $q->where('nomor_pesanan', 'like', '%' . $request->search . '%');
            })->orWhereHas('karyawan', function($q) use ($request) {
                $q->where('nama_karyawan', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        $logs = $query->latest()->paginate(15)->withQueryString();

        $employees = Employee::aktif()->get();
        // Memuat daftar pesanan aktif beserta detail item dan produknya untuk di-render di dropdown form 4-langkah
        $orders = Order::whereIn('status', ['diproses', 'produksi'])->with('items.product')->get();

        return Inertia::render('production-logs/index', [
            'logs' => $logs,
            'employees' => $employees,
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Menyimpan log pengerjaan produksi baru.
     * 
     * Validasi: Memastikan target produksi tidak melebihi sisa yang harus dikerjakan pada order_item.
     * Setelah validasi, tugas pembuatan diserahkan ke ProductionLogService::create()
     * yang akan langsung memotong stok BOM.
     * 
     * @param Request $request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'order_item_id' => 'required|exists:order_items,id',
            'karyawan_id' => 'required|exists:employees,id',
            'tanggal_produksi' => 'required|date',
            'tanggal_selesai_produksi' => 'nullable|date|after_or_equal:tanggal_produksi',
            'jumlah_produksi' => 'required|integer|min:1',
            'status' => ['required', Rule::in(['dalam_proses', 'selesai'])],
            'catatan' => 'nullable|string',
        ]);

        try {
            ProductionLogService::create($validated);
            return redirect()->back()->with('success', 'Tugas produksi berhasil ditambahkan.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Memperbarui log produksi yang sudah ada.
     * 
     * Tujuan: Digunakan saat karyawan menyelesaikan tugasnya (update status menjadi selesai).
     * Rule: Hanya log yang masih dalam_proses yang bisa diubah oleh endpoint ini. 
     * Saat di-set selesai, ProductionLogService akan memicu penambahan upah borongan dan stok produk.
     * 
     * @param Request $request
     * @param ProductionLog $productionLog
     */
    public function update(Request $request, ProductionLog $productionLog)
    {
        $validated = $request->validate([
            'karyawan_id' => 'required|exists:employees,id',
            'tanggal_produksi' => 'required|date',
            'tanggal_selesai_produksi' => 'nullable|date|after_or_equal:tanggal_produksi',
            'jumlah_produksi' => 'required|integer|min:1',
            'status' => ['required', Rule::in(['dalam_proses', 'selesai'])],
            'catatan' => 'nullable|string',
        ]);

        try {
            ProductionLogService::update($productionLog, $validated);
            return redirect()->back()->with('success', 'Tugas produksi berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Menghapus log produksi (Pembatalan pengerjaan).
     * 
     * Tujuan: Rollback data sepenuhnya dari database menggunakan ProductionLogService::delete().
     * Ini mengamankan pengembalian stok bahan yang telah dipotong dan pembatalan upah 
     * yang mungkin sudah diberikan jika log sebelumnya telah selesai.
     * 
     * @param ProductionLog $productionLog
     */
    public function destroy(ProductionLog $productionLog)
    {
        try {
            ProductionLogService::delete($productionLog);
            return redirect()->back()->with('success', 'Log produksi berhasil dihapus dan stok/upah telah di-rollback.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
