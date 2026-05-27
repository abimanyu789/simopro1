<?php

namespace App\Http\Controllers;

use App\Models\ProductStock;
use App\Models\Product;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ProductStockController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductStock::with(['produk.kategori']);

        if ($request->has('search') && $request->search != '') {
            $query->whereHas('produk', function ($q) use ($request) {
                $q->where('nama_produk', 'like', '%' . $request->search . '%')
                  ->orWhere('kode_produk', 'like', '%' . $request->search . '%');
            });
        }

        // Custom status filtering
        if ($request->has('status') && $request->status != '') {
            $status = $request->status;
            if ($status === 'habis') {
                $query->where('stok_saat_ini', 0);
            } elseif ($status === 'menipis') {
                $query->whereColumn('stok_saat_ini', '<', 'stok_minimum')
                      ->where('stok_saat_ini', '>', 0);
            } elseif ($status === 'tersedia') {
                $query->whereColumn('stok_saat_ini', '>=', 'stok_minimum');
            }
        }

        $stocks = $query->latest()->paginate(15)->withQueryString();
        
        // Append dynamic attribute status_stok to each item
        $stocks->getCollection()->transform(function ($stock) {
            $stock->status_label = $stock->status_stok;
            return $stock;
        });

        // Get active products for "Add New Stock Variant" modal
        $products = Product::aktif()->with('kategori')->get();

        return Inertia::render('product-stocks/index', [
            'stocks' => $stocks,
            'products' => $products,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'produk_id' => 'required|exists:products,id',
            'ukuran' => 'required|string|max:10',
            'warna' => 'required|string|max:100',
            'stok_minimum' => 'required|integer|min:0',
            'keterangan' => 'nullable|string',
            'stok_awal' => 'required|integer|min:0',
        ]);

        // Cek unik manual karena ada 3 kolom
        $exists = ProductStock::where('produk_id', $validated['produk_id'])
            ->where('ukuran', $validated['ukuran'])
            ->where('warna', $validated['warna'])
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors(['ukuran' => 'Kombinasi Produk, Ukuran, dan Warna ini sudah ada dalam stok.']);
        }

        $stock = ProductStock::create([
            'produk_id' => $validated['produk_id'],
            'ukuran' => $validated['ukuran'],
            'warna' => $validated['warna'],
            'stok_minimum' => $validated['stok_minimum'],
            'keterangan' => $validated['keterangan'],
            'stok_saat_ini' => 0, // Akan diisi via service
        ]);

        if ($validated['stok_awal'] > 0) {
            StockService::adjust($stock, $validated['stok_awal'], 'stok_masuk', 'Saldo Awal Stok');
        }

        return redirect()->back()->with('success', 'Varian stok produk berhasil ditambahkan.');
    }

    public function update(Request $request, ProductStock $productStock)
    {
        $validated = $request->validate([
            'stok_minimum' => 'required|integer|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $productStock->update($validated);

        return redirect()->back()->with('success', 'Pengaturan stok berhasil diperbarui.');
    }

    public function adjust(Request $request, ProductStock $productStock)
    {
        $validated = $request->validate([
            'jenis' => ['required', Rule::in(['stok_masuk', 'stok_keluar', 'adjustment'])],
            'jumlah' => 'required|numeric|min:1',
            'keterangan' => 'required|string|max:255',
        ]);

        $jumlah = (float) $validated['jumlah'];
        if ($validated['jenis'] === 'stok_keluar') {
            $jumlah = -$jumlah;
        }

        try {
            StockService::adjust(
                $productStock, 
                $jumlah, 
                $validated['jenis'], 
                $validated['keterangan']
            );
            return redirect()->back()->with('success', 'Stok berhasil disesuaikan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
