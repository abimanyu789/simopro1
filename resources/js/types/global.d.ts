import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}

/**
 * Deklarasi tipe global untuk fungsi `route()` dari library Ziggy.
 * Ziggy diinjeksikan oleh directive @routes di resources/views/app.blade.php,
 * sehingga tersedia di runtime sebagai fungsi global JavaScript.
 *
 * Tanpa deklarasi ini, TypeScript akan error "Cannot find name 'route'"
 * meski aplikasi tetap berjalan dengan benar di browser.
 *
 * Signature sesuai dengan Ziggy v2.x:
 * - route(name)              → generate URL tanpa parameter
 * - route(name, params)      → generate URL dengan params (number | string | object)
 * - route(name, params, abs) → absolute URL jika abs = true
 */
declare global {
    function route(
        name: string,
        params?: number | string | Record<string, unknown> | (number | string)[],
        absolute?: boolean,
    ): string;
}
