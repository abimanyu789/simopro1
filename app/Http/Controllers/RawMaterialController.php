<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\RawMaterial;
use App\Models\RawMaterialStock;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RawMaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = RawMaterial::with('kategori');

        if ($request->has('search') && $request->search != '') {
            $query->where(function ($q) use ($request) {
                $q->where('nama_bahan', 'like', '%' . $request->search . '%')
                  ->orWhere('kode_bahan', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('kategori_id') && $request->kategori_id != '') {
            $query->where('kategori_id', $request->kategori_id);
        }

        $rawMaterials = $query->latest()->paginate(10)->withQueryString();
        
        // Data untuk dropdown form
        $categories = Category::whereIn('tipe', ['raw_material', 'both'])->get();

        return Inertia::render('raw-materials/index', [
            'rawMaterials' => $rawMaterials,
            'categories' => $categories,
            'filters' => $request->only(['search', 'kategori_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_bahan' => 'required|string|max:50|unique:raw_materials,kode_bahan',
            'nama_bahan' => 'required|string|max:255',
            'kategori_id' => 'required|exists:categories,id',
            'satuan' => 'required|string|max:20',
            'harga_beli' => 'required|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        DB::transaction(function () use ($validated) {
            $rawMaterial = RawMaterial::create($validated);
            
            // Otomatis buat entri di tabel stok
            RawMaterialStock::create([
                'bahan_id' => $rawMaterial->id,
                'stok_saat_ini' => 0,
                'stok_minimum' => 5,
                'satuan' => $validated['satuan'],
            ]);
        });

        return redirect()->back()->with('success', 'Bahan baku berhasil ditambahkan.');
    }

    public function update(Request $request, RawMaterial $rawMaterial)
    {
        $validated = $request->validate([
            'kode_bahan' => ['required', 'string', 'max:50', Rule::unique('raw_materials')->ignore($rawMaterial->id)],
            'nama_bahan' => 'required|string|max:255',
            'kategori_id' => 'required|exists:categories,id',
            'satuan' => 'required|string|max:20',
            'harga_beli' => 'required|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        DB::transaction(function () use ($validated, $rawMaterial) {
            $rawMaterial->update($validated);
            
            // Sync satuan di stok jika berubah
            $rawMaterial->stock()->update(['satuan' => $validated['satuan']]);
        });

        return redirect()->back()->with('success', 'Bahan baku berhasil diperbarui.');
    }

    public function destroy(RawMaterial $rawMaterial)
    {
        if ($rawMaterial->productBoms()->exists()) {
            return redirect()->back()->with('error', 'Bahan baku tidak dapat dihapus karena digunakan dalam Bill of Materials produk.');
        }

        $rawMaterial->delete();

        return redirect()->back()->with('success', 'Bahan baku berhasil dihapus.');
    }
}
