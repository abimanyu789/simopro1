import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Login - SIMOPRO Provillo" />

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div className="text-center flex flex-col items-center">
                    {/* Placeholder untuk Logo - Bisa diganti dengan gambar asli nanti */}
                    <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 text-white text-2xl font-bold">
                        P
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
                        SIMOPRO
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Sistem Informasi Manajemen Operasional Provillo
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={submit}>
                    {/* Error Banner jika username/password salah */}
                    {errors.username && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 text-center animate-in fade-in slide-in-from-top-1">
                            {errors.username}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Field Username */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="username">
                                Username
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors text-slate-900 placeholder:text-slate-400"
                                    placeholder="Masukkan username Anda"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Field Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors text-slate-900 placeholder:text-slate-400"
                                    placeholder="Masukkan password Anda"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-5 w-5" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md shadow-blue-500/20 ${processing ? 'opacity-75 cursor-not-allowed' : 'active:scale-[0.98]'
                                }`}
                        >
                            {processing ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {processing ? 'Memproses...' : 'Masuk ke Sistem'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Background decorative elements */}
            <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
