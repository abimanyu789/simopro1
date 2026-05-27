<?php

namespace App\Http\Controllers;

use App\Models\StockLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockLogController extends Controller
{
    public function index(Request $request)
    {
        $query = StockLog::with(['stockable', 'createdBy']);

        // Search by keterangan
        if ($request->has('search') && $request->search != '') {
            $query->where('keterangan', 'like', '%' . $request->search . '%');
        }

        // Filter by tipe stok (produk vs bahan baku)
        if ($request->has('tipe') && $request->tipe != '') {
            if ($request->tipe === 'product') {
                $query->where('stockable_type', \App\Models\ProductStock::class);
            } elseif ($request->tipe === 'raw_material') {
                $query->where('stockable_type', \App\Models\RawMaterialStock::class);
            }
        }

        // Filter by jenis pergerakan
        if ($request->has('jenis') && $request->jenis != '') {
            $query->where('jenis', $request->jenis);
        }

        // Latest always
        $logs = $query->latest('id')->paginate(20)->withQueryString();

        // Map relation specific data for easier frontend rendering
        $logs->getCollection()->transform(function ($log) {
            $log->item_name = 'N/A';
            $log->item_detail = '';
            
            if ($log->stockable_type === \App\Models\ProductStock::class && $log->stockable) {
                // To avoid N+1, ideally eager load stockable.produk but polymorphic eager loading can be tricky.
                // We'll rely on basic load if necessary, or just lazy load here since it's paginated (20 max).
                $log->stockable->loadMissing('produk');
                $log->item_name = $log->stockable->produk ? $log->stockable->produk->nama_produk : 'Produk Dihapus';
                $log->item_detail = "Ukuran: {$log->stockable->ukuran} | Warna: {$log->stockable->warna}";
            } elseif ($log->stockable_type === \App\Models\RawMaterialStock::class && $log->stockable) {
                $log->stockable->loadMissing('bahan');
                $log->item_name = $log->stockable->bahan ? $log->stockable->bahan->nama_bahan : 'Bahan Dihapus';
                $log->item_detail = "Satuan: {$log->stockable->satuan}";
            }
            return $log;
        });

        return Inertia::render('stock-logs/index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'tipe', 'jenis']),
        ]);
    }
}
