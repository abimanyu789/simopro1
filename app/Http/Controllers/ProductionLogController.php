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

class ProductionLogController extends Controller
{
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
        // Load active orders (diproses/produksi) for selection, along with their items and products
        $orders = Order::whereIn('status', ['diproses', 'produksi'])->with('items.product')->get();

        return Inertia::render('production-logs/index', [
            'logs' => $logs,
            'employees' => $employees,
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

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

    public function update(Request $request, ProductionLog $productionLog)
    {
        // Hanya log yang masih dalam_proses yang bisa diubah, kecuali hapus (soft delete / hard delete).
        // Rollback and such is handled by service.
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
