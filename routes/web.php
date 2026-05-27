<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1'); // Rate limit: max 5 login attempts per minute
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->name('password.change');

    // Dashboard
    Route::get('/', function () {
        return redirect()->route('dashboard');
    });

    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Data Master
    Route::resource('categories', \App\Http\Controllers\CategoryController::class)->except(['create', 'edit', 'show']);
    Route::resource('products', \App\Http\Controllers\ProductController::class)->except(['create', 'edit', 'show']);
    Route::resource('raw-materials', \App\Http\Controllers\RawMaterialController::class)->except(['create', 'edit', 'show'])->parameters([
        'raw-materials' => 'rawMaterial' // Fix parameter binding name due to dash
    ]);
    Route::resource('employees', \App\Http\Controllers\EmployeeController::class)->except(['create', 'edit', 'show']);
    Route::resource('customers', \App\Http\Controllers\CustomerController::class)->except(['create', 'edit', 'show']);

    // Manajemen Stok
    Route::resource('product-stocks', \App\Http\Controllers\ProductStockController::class)->except(['create', 'edit', 'show', 'destroy']);
    Route::post('product-stocks/{productStock}/adjust', [\App\Http\Controllers\ProductStockController::class, 'adjust'])->name('product-stocks.adjust');

    Route::resource('raw-material-stocks', \App\Http\Controllers\RawMaterialStockController::class)->except(['create', 'edit', 'show', 'store', 'destroy'])->parameters([
        'raw-material-stocks' => 'rawMaterialStock'
    ]);
    Route::post('raw-material-stocks/{rawMaterialStock}/adjust', [\App\Http\Controllers\RawMaterialStockController::class, 'adjust'])->name('raw-material-stocks.adjust');

    Route::get('stock-logs', [\App\Http\Controllers\StockLogController::class, 'index'])->name('stock-logs.index');

    // Bill of Materials (BOM)
    Route::get('product-boms', [\App\Http\Controllers\ProductBomController::class, 'index'])->name('product-boms.index');
    Route::get('product-boms/{product}', [\App\Http\Controllers\ProductBomController::class, 'show'])->name('product-boms.show');
    Route::post('product-boms/{product}', [\App\Http\Controllers\ProductBomController::class, 'store'])->name('product-boms.store');
    Route::put('product-boms/{product}/{bom}', [\App\Http\Controllers\ProductBomController::class, 'update'])->name('product-boms.update');
    Route::delete('product-boms/{product}/{bom}', [\App\Http\Controllers\ProductBomController::class, 'destroy'])->name('product-boms.destroy');

    // Operasional & Transaksi
    Route::resource('orders', \App\Http\Controllers\OrderController::class)->except(['edit', 'update']);
    Route::post('orders/{order}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::post('orders/{order}/payment', [\App\Http\Controllers\OrderController::class, 'updatePaymentStatus'])->name('orders.update-payment');

    Route::get('production-logs', [\App\Http\Controllers\ProductionLogController::class, 'index'])->name('production-logs.index');
    Route::post('production-logs', [\App\Http\Controllers\ProductionLogController::class, 'store'])->name('production-logs.store');
    Route::post('production-logs/{productionLog}/complete', [\App\Http\Controllers\ProductionLogController::class, 'complete'])->name('production-logs.complete');

    // Keuangan & Cash Flow
    Route::resource('cash-flows', \App\Http\Controllers\CashFlowController::class)->except(['create', 'edit', 'show', 'update']);

    // Laporan (Reports)
    Route::get('reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/sales-pdf', [\App\Http\Controllers\ReportController::class, 'exportSalesPdf'])->name('reports.sales-pdf');

    // Pengaturan
    Route::get('settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::put('settings', [\App\Http\Controllers\SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/logo', [\App\Http\Controllers\SettingsController::class, 'updateLogo'])->name('settings.logo');
    Route::put('settings/password', [\App\Http\Controllers\SettingsController::class, 'updatePassword'])->name('settings.password');
    
    // Other routes will be added here
});
