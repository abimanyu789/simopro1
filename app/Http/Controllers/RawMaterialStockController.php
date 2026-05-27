<?php

namespace App\Http\Controllers;

use App\Models\RawMaterialStock;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class RawMaterialStockController extends Controller
{
    public function index(Request $request)
    {
        $query = RawMaterialStock::with(['bahan.kategori']);

        if ($request->has('search') && $request->search != '') {
            $query->whereHas('bahan', function ($q) use ($request) {
                $q->where('nama_bahan', 'like', '%' . $request->search . '%')
                  ->orWhere('kode_bahan', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status != '') {
            $status = $request->status;
            if ($status === 'habis') {
                $query->where('stok_saat_ini', '<=', 0);
            } elseif ($status === 'menipis') {
                $query->whereColumn('stok_saat_ini', '<', 'stok_minimum')
                      ->where('stok_saat_ini', '>', 0);
            } elseif ($status === 'tersedia') {
                $query->whereColumn('stok_saat_ini', '>=', 'stok_minimum');
            }
        }

        $stocks = $query->latest()->paginate(15)->withQueryString();
        
        $stocks->getCollection()->transform(function ($stock) {
            $stock->status_label = $stock->status_stok;
            return $stock;
        });

        return Inertia::render('raw-material-stocks/index', [
            'stocks' => $stocks,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function update(Request $request, RawMaterialStock $rawMaterialStock)
    {
        $validated = $request->validate([
            'stok_minimum' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $rawMaterialStock->update($validated);

        return redirect()->back()->with('success', 'Pengaturan stok bahan baku berhasil diperbarui.');
    }

    public function adjust(Request $request, RawMaterialStock $rawMaterialStock)
    {
        $validated = $request->validate([
            'jenis' => ['required', Rule::in(['stok_masuk', 'stok_keluar', 'adjustment'])],
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'required|string|max:255',
        ]);

        $jumlah = (float) $validated['jumlah'];
        if ($validated['jenis'] === 'stok_keluar') {
            $jumlah = -$jumlah;
        }

        try {
            StockService::adjust(
                $rawMaterialStock, 
                $jumlah, 
                $validated['jenis'], 
                $validated['keterangan']
            );
            return redirect()->back()->with('success', 'Stok bahan baku berhasil disesuaikan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
