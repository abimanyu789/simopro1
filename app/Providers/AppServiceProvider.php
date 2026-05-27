<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->defineGates();
    }

    /**
     * Define the application's RBAC gates.
     */
    protected function defineGates(): void
    {
        \Illuminate\Support\Facades\Gate::define('admin', function (\App\Models\User $user) {
            return $user->role === 'admin';
        });

        \Illuminate\Support\Facades\Gate::define('owner', function (\App\Models\User $user) {
            return $user->role === 'owner';
        });

        // Contoh gate spesifik
        \Illuminate\Support\Facades\Gate::define('manage-users', function (\App\Models\User $user) {
            return $user->role === 'admin';
        });
        
        \Illuminate\Support\Facades\Gate::define('edit-data', function (\App\Models\User $user) {
            return $user->role === 'admin'; // owner only view + approve
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
