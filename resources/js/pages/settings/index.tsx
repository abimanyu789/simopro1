import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Save, Upload, User, Shield, Building, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsIndex({ setting, user }: any) {
    const [activeTab, setActiveTab] = useState('profil');

    const { data: profileData, setData: setProfileData, put: putProfile, processing: profileProcessing, errors: profileErrors } = useForm({
        nama_usaha: setting?.nama_usaha || 'Provillo',
        deskripsi: setting?.deskripsi || '',
        alamat: setting?.alamat || '',
        telepon: setting?.telepon || '',
        email: setting?.email || '',
        npwp: setting?.npwp || '',
    });

    const { data: logoData, setData: setLogoData, post: postLogo, processing: logoProcessing, errors: logoErrors } = useForm({
        logo: null as File | null,
    });

    const { data: pwdData, setData: setPwdData, put: putPwd, processing: pwdProcessing, errors: pwdErrors, reset: resetPwd } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        putProfile(route('settings.update'), {
            onSuccess: () => toast.success('Informasi usaha berhasil diperbarui')
        });
    };

    const submitLogo = (e: React.FormEvent) => {
        e.preventDefault();
        postLogo(route('settings.logo'), {
            onSuccess: () => {
                toast.success('Logo berhasil diperbarui');
                setLogoData('logo', null);
            }
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        putPwd(route('settings.password'), {
            onSuccess: () => {
                toast.success('Password berhasil diubah');
                resetPwd();
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Sistem" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
                <p className="text-slate-500 mt-1">Kelola profil usaha, logo aplikasi, dan keamanan akun.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar Tab */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4">
                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('profil')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'profil' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                            <Building className="w-5 h-5" /> Informasi Usaha
                        </button>
                        <button onClick={() => setActiveTab('logo')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'logo' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                            <Upload className="w-5 h-5" /> Logo Aplikasi
                        </button>
                        <button onClick={() => setActiveTab('keamanan')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'keamanan' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                            <Shield className="w-5 h-5" /> Keamanan Akun
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8">
                    {/* Tab Informasi Usaha */}
                    {activeTab === 'profil' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Informasi Perusahaan</h2>
                            <form onSubmit={submitProfile} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Usaha / Perusahaan <span className="text-red-500">*</span></label>
                                    <input type="text" value={profileData.nama_usaha} onChange={e => setProfileData('nama_usaha', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                    {profileErrors.nama_usaha && <span className="text-red-500 text-xs mt-1">{profileErrors.nama_usaha}</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
                                        <input type="text" value={profileData.telepon} onChange={e => setProfileData('telepon', e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input type="email" value={profileData.email} onChange={e => setProfileData('email', e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                                    <textarea value={profileData.alamat} onChange={e => setProfileData('alamat', e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">NPWP</label>
                                    <input type="text" value={profileData.npwp} onChange={e => setProfileData('npwp', e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                                    <textarea value={profileData.deskripsi} onChange={e => setProfileData('deskripsi', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button type="submit" disabled={profileProcessing} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm">
                                        <Save className="w-4 h-4" /> {profileProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab Logo */}
                    {activeTab === 'logo' && (
                        <div className="max-w-xl">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Logo Aplikasi</h2>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center mb-6">
                                {setting?.logo_path ? (
                                    <img src={`/storage/${setting.logo_path}`} alt="Logo Usaha" className="mx-auto max-h-32 object-contain" />
                                ) : (
                                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                        <Building className="w-10 h-10" />
                                    </div>
                                )}
                                <p className="text-sm text-slate-500 mt-4">Logo ini akan digunakan pada kop surat invoice dan laporan PDF.</p>
                            </div>
                            <form onSubmit={submitLogo} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Logo Baru</label>
                                    <input type="file" onChange={e => setLogoData('logo', e.target.files ? e.target.files[0] : null)} accept="image/jpeg,image/png,image/webp,image/svg+xml" required className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    <p className="text-xs text-slate-500 mt-2">Maks. ukuran 1 MB. Format: JPG, PNG, SVG, WEBP.</p>
                                    {logoErrors.logo && <span className="text-red-500 text-xs mt-1">{logoErrors.logo}</span>}
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={logoProcessing} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2 rounded-xl hover:bg-slate-900 transition-colors font-medium text-sm">
                                        <Upload className="w-4 h-4" /> {logoProcessing ? 'Mengunggah...' : 'Unggah Logo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab Keamanan */}
                    {activeTab === 'keamanan' && (
                        <div className="max-w-xl">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Keamanan Akun</h2>
                            <form onSubmit={submitPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password Saat Ini <span className="text-red-500">*</span></label>
                                    <input type="password" value={pwdData.current_password} onChange={e => setPwdData('current_password', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                    {pwdErrors.current_password && <span className="text-red-500 text-xs mt-1">{pwdErrors.current_password}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru <span className="text-red-500">*</span></label>
                                    <input type="password" value={pwdData.password} onChange={e => setPwdData('password', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                    {pwdErrors.password && <span className="text-red-500 text-xs mt-1">{pwdErrors.password}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru <span className="text-red-500">*</span></label>
                                    <input type="password" value={pwdData.password_confirmation} onChange={e => setPwdData('password_confirmation', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-start">
                                    <button type="submit" disabled={pwdProcessing} className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors font-medium text-sm shadow-sm">
                                        <Key className="w-4 h-4" /> {pwdProcessing ? 'Memperbarui...' : 'Ubah Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
