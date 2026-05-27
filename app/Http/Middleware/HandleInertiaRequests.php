<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $stockAlerts = [
            'product' => 0,
            'rawMaterial' => 0
        ];

        if ($request->user()) {
            $stockAlerts['product'] = \App\Models\ProductStock::whereColumn('stok_saat_ini', '<=', 'stok_minimum')->count();
            $stockAlerts['rawMaterial'] = \App\Models\RawMaterialStock::whereColumn('stok_saat_ini', '<=', 'stok_minimum')->count();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'stock_alerts' => $stockAlerts,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ]
        ];
    }
}
