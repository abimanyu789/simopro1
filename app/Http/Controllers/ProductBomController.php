<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductBom;
use App\Models\RawMaterial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductBomController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('kategori')->withCount('bom');

        if ($request->has('search') && $request->search != '') {
            $query->where('nama_produk', 'like', '%' . $request->search . '%')
                  ->orWhere('kode_produk', 'like', '%' . $request->search . '%');
        }

        $products = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('product-boms/index', [
            'products' => $products,
            'filters' => $request->only('search'),
        ]);
    }

    public function show(Product $product)
    {
        // View BOM details for a specific product
        $product->load('kategori');
        $boms = $product->bom()->with('bahan')->get();
        $rawMaterials = RawMaterial::aktif()->get();

        return Inertia::render('product-boms/show', [
            'product' => $product,
            'boms' => $boms,
            'rawMaterials' => $rawMaterials,
        ]);
    }

    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'bahan_id' => 'required|exists:raw_materials,id',
            'jumlah_per_unit' => 'required|numeric|min:0.01',
        ]);

        // Cek jika bahan sudah ada di BOM
        if ($product->bom()->where('bahan_id', $validated['bahan_id'])->exists()) {
            return redirect()->back()->with('error', 'Bahan baku tersebut sudah ada di BOM produk ini.');
        }

        $bahan = RawMaterial::find($validated['bahan_id']);
        
        $product->bom()->create([
            'bahan_id' => $bahan->id,
            'jumlah_per_unit' => $validated['jumlah_per_unit'],
            'satuan' => $bahan->satuan, // Snapshot satuan
        ]);

        return redirect()->back()->with('success', 'Komponen BOM berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product, ProductBom $bom)
    {
        $validated = $request->validate([
            'jumlah_per_unit' => 'required|numeric|min:0.01',
        ]);

        if ($bom->produk_id !== $product->id) {
            abort(403);
        }

        $bom->update($validated);

        return redirect()->back()->with('success', 'Komponen BOM berhasil diperbarui.');
    }

    public function destroy(Product $product, ProductBom $bom)
    {
        if ($bom->produk_id !== $product->id) {
            abort(403);
        }

        $bom->delete();

        return redirect()->back()->with('success', 'Komponen BOM berhasil dihapus.');
    }
}
