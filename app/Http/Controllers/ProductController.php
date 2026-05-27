<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('kategori');

        if ($request->has('search') && $request->search != '') {
            $query->where(function ($q) use ($request) {
                $q->where('nama_produk', 'like', '%' . $request->search . '%')
                  ->orWhere('kode_produk', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('kategori_id') && $request->kategori_id != '') {
            $query->where('kategori_id', $request->kategori_id);
        }

        $products = $query->latest()->paginate(10)->withQueryString();
        
        // Data untuk dropdown
        $categories = Category::whereIn('tipe', ['product', 'both'])->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'kategori_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_produk' => 'required|string|max:50|unique:products,kode_produk',
            'nama_produk' => 'required|string|max:255',
            'kategori_id' => 'required|exists:categories,id',
            'warna' => 'required|string|max:100',
            'harga_jual' => 'required|numeric|min:0',
            // ukuran_tersedia dikirim sebagai string comma-separated dari frontend
            'ukuran_tersedia' => 'required|string', 
            'deskripsi' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048', // 1 foto utama untuk simpel CRUD pertama
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Parse comma-separated string to array
            $ukuranArray = array_map('trim', explode(',', $validated['ukuran_tersedia']));
            $validated['ukuran_tersedia'] = $ukuranArray;
            
            $fotoPaths = [];
            if ($request->hasFile('foto')) {
                $path = $request->file('foto')->store('products', 'public');
                $fotoPaths[] = $path; // Sesuai dengan format array di model
            }
            $validated['foto_produk'] = $fotoPaths;
            
            Product::create($validated);
        });

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'kode_produk' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($product->id)],
            'nama_produk' => 'required|string|max:255',
            'kategori_id' => 'required|exists:categories,id',
            'warna' => 'required|string|max:100',
            'harga_jual' => 'required|numeric|min:0',
            'ukuran_tersedia' => 'required|string',
            'deskripsi' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        DB::transaction(function () use ($validated, $request, $product) {
            // Parse comma-separated string to array
            $ukuranArray = array_map('trim', explode(',', $validated['ukuran_tersedia']));
            $validated['ukuran_tersedia'] = $ukuranArray;
            
            if ($request->hasFile('foto')) {
                // Delete old photos
                if (is_array($product->foto_produk)) {
                    foreach ($product->foto_produk as $oldFoto) {
                        Storage::disk('public')->delete($oldFoto);
                    }
                }
                
                $path = $request->file('foto')->store('products', 'public');
                $validated['foto_produk'] = [$path];
            }
            
            $product->update($validated);
        });

        return redirect()->back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        if ($product->orderItems()->exists()) {
            return redirect()->back()->with('error', 'Produk tidak dapat dihapus karena sudah ada di dalam riwayat pesanan.');
        }

        $product->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }
}
