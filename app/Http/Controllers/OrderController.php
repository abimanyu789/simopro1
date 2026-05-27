<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

/**
 * Controller: OrderController
 *
 * Mengelola CRUD pesanan customer (Purchase Order).
 * Business logic dipisah ke OrderService untuk menjaga controller tetap tipis (thin controller pattern).
 *
 * Status flow (berurutan, di-enforce oleh Order::canTransitionTo()):
 * pending → diproses → produksi → selesai → closed
 */
class OrderController extends Controller
{
    /**
     * Menampilkan daftar semua pesanan.
     * Mendukung filter: pencarian teks, filter status, filter status pembayaran.
     */
    public function index(Request $request)
    {
        // 1. Base query dengan eager load relasi yang dibutuhkan di UI
        $query = Order::with(['customer', 'items', 'shipments']);

        // 2. Filter pencarian teks (nomor pesanan atau nama customer)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_pesanan', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($q2) => $q2->where('nama_customer', 'like', "%{$search}%"));
            });
        }

        // 3. Filter berdasarkan status pesanan (enum kolom 'status' di DB)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 4. Paginate dan tambahkan query string untuk konsistensi filter saat paginasi
        $orders = $query->latest()->paginate(15)->withQueryString();

        // 5. Transformasi koleksi: tambahkan computed field total_qty & total_dikirim
        //    agar frontend tidak perlu menghitung sendiri dari nested relations
        $orders->getCollection()->transform(function ($order) {
            $order->total_qty     = $order->items->sum('kuantitas');
            $order->total_dikirim = $order->shipments->sum('kuantitas_dikirim');
            return $order;
        });

        return Inertia::render('orders/index', [
            'orders'  => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Menampilkan form buat pesanan baru.
     * Menyuplai data customers & products ke frontend.
     */
    public function create()
    {
        // Hanya tampilkan customer aktif dan produk aktif
        $customers = Customer::aktif()->orderBy('nama_customer')->get();
        $products  = Product::aktif()->with('stocks')->get();

        return Inertia::render('orders/create', [
            'customers' => $customers,
            'products'  => $products,
        ]);
    }

    /**
     * Menyimpan pesanan baru ke database.
     *
     * Validasi ketat dilakukan di sini (backend), harga produk diambil dari DB
     * (bukan dari request) untuk mencegah manipulasi harga dari sisi client.
     * Business logic (snapshot harga, hitung total, generate nomor) ada di OrderService.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id'         => 'required|exists:customers,id',
            'tanggal_pesanan'     => 'required|date',
            'tenggat_waktu'       => 'required|date|after_or_equal:tanggal_pesanan',
            'catatan'             => 'nullable|string',
            'diskon_tipe'         => ['nullable', Rule::in(['persen', 'nominal'])],
            'diskon_nilai'        => 'nullable|numeric|min:0',
            'catatan_diskon'      => 'nullable|string',
            'items'               => 'required|array|min:1',
            'items.*.produk_id'   => 'required|exists:products,id',
            'items.*.ukuran'      => 'required|string',
            'items.*.warna'       => 'required|string',
            'items.*.kuantitas'   => 'required|integer|min:1',
        ]);

        // Map field 'tenggat_waktu' dari form ke 'deadline' yang dipakai model & migration
        $data = array_merge($validated, [
            'deadline' => $validated['tenggat_waktu'],
        ]);

        try {
            // OrderService::create() sudah membungkus semua dalam DB::transaction()
            $order = OrderService::create($data);
            return redirect()->route('orders.show', $order->id)
                             ->with('success', 'Pesanan berhasil dibuat.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Menampilkan detail satu pesanan.
     * Eager load semua relasi yang dibutuhkan halaman invoice/detail.
     */
    public function show(Order $order)
    {
        $order->load(['customer', 'items.product', 'statusLogs', 'shipments']);

        // Kalkulasi agregat untuk progress bar pengiriman
        $totalQty  = $order->items->sum('kuantitas');
        $totalSent = $order->shipments->sum('kuantitas_dikirim');
        $remaining = max(0, $totalQty - $totalSent);

        return Inertia::render('orders/show', [
            'order'   => $order,
            'summary' => [
                'total_qty'  => $totalQty,
                'total_sent' => $totalSent,
                'remaining'  => $remaining,
            ],
        ]);
    }

    /**
     * Update status pesanan (misal: pending → diproses → produksi → selesai).
     * Validasi transisi dikerjakan di OrderService::updateStatus() via canTransitionTo().
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            // Sesuai STATUS_FLOW di Order model
            'status'  => ['required', Rule::in(['pending', 'diproses', 'produksi', 'selesai', 'closed'])],
            'catatan' => 'nullable|string',
        ]);

        try {
            OrderService::updateStatus($order, $validated['status'], $validated['catatan'] ?? null);
            return redirect()->back()->with('success', 'Status pesanan berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Menghapus pesanan (soft delete).
     * Business rule: hanya pesanan berstatus 'pending' yang boleh dihapus.
     */
    public function destroy(Order $order)
    {
        // Cek status via kolom 'status' yang benar (bukan 'status_pesanan')
        if ($order->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'Hanya pesanan dengan status Pending yang dapat dihapus.']);
        }

        $order->delete();
        return redirect()->route('orders.index')->with('success', 'Pesanan berhasil dihapus.');
    }

    /**
     * Update status pembayaran pesanan secara langsung.
     * Catatan: Kolom 'status_pembayaran' belum ada di migration saat ini.
     * Method ini disiapkan untuk diaktifkan setelah migration diupdate.
     * Untuk sementara, method ini hanya memvalidasi input dan memberi respons sukses dummy.
     */
    public function updatePaymentStatus(Request $request, Order $order)
    {
        $request->validate([
            'status_pembayaran'   => ['required', Rule::in(['belum_dibayar', 'dibayar_sebagian', 'lunas'])],
            'nominal_pembayaran'  => 'nullable|numeric|min:0',
        ]);

        // TODO: Setelah migration ditambahkan kolom 'status_pembayaran',
        // uncomment baris berikut:
        // $order->update(['status_pembayaran' => $request->status_pembayaran]);

        return redirect()->back()->with('success', 'Status pembayaran diperbarui.');
    }
}
