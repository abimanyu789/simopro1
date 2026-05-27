import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    Box, 
    Users, 
    UserSquare2, 
    ShoppingCart, 
    Wallet, 
    Settings,
    FileText,
    LogOut,
    ChevronDown,
    Archive,
    Database,
    ClipboardList,
    Layers
} from 'lucide-react';
import { useState } from 'react';

// Tipe untuk flash messages & shared props
interface SharedProps {
    auth: {
        user: {
            name: string;
            username: string;
            role: string;
            foto?: string;
        };
    };
    stock_alerts?: {
        product: number;
        rawMaterial: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: any;
}

export default function Sidebar() {
    const { auth, stock_alerts } = usePage<SharedProps>().props;
    const currentUrl = usePage().url;

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: route('dashboard'), active: currentUrl.startsWith('/dashboard') || currentUrl === '/' },
        { 
            title: 'Master Data', 
            icon: Box, 
            isGroup: true,
            items: [
                { title: 'Kategori', icon: Box, href: '/categories', active: currentUrl.startsWith('/categories') },
                { title: 'Data Produk', icon: Package, href: '/products', active: currentUrl.startsWith('/products') },
                { title: 'Data Bahan Baku', icon: Box, href: '/raw-materials', active: currentUrl.startsWith('/raw-materials') },
                { title: 'Data Karyawan', icon: Users, href: '/employees', active: currentUrl.startsWith('/employees') },
                { title: 'Data Customer', icon: UserSquare2, href: '/customers', active: currentUrl.startsWith('/customers') },
            ]
        },
        {
            title: 'Manajemen Stok',
            icon: Archive,
            isGroup: true,
            items: [
                { 
                    title: 'Stok Produk', 
                    icon: Archive, 
                    href: '/product-stocks', 
                    active: currentUrl.startsWith('/product-stocks'),
                    badge: stock_alerts?.product && stock_alerts.product > 0 ? stock_alerts.product : null 
                },
                { 
                    title: 'Stok Bahan Baku', 
                    icon: Database, 
                    href: '/raw-material-stocks', 
                    active: currentUrl.startsWith('/raw-material-stocks'),
                    badge: stock_alerts?.rawMaterial && stock_alerts.rawMaterial > 0 ? stock_alerts.rawMaterial : null 
                },
                { title: 'Riwayat Stok', icon: ClipboardList, href: '/stock-logs', active: currentUrl.startsWith('/stock-logs') },
                { title: 'Bill of Materials', icon: Layers, href: '/product-boms', active: currentUrl.startsWith('/product-boms') },
            ]
        },
        { 
            title: 'Operasional', 
            icon: ShoppingCart, 
            isGroup: true,
            items: [
                { title: 'Pesanan', icon: ShoppingCart, href: '/orders', active: currentUrl.startsWith('/orders') },
                { title: 'Log Produksi', icon: Users, href: '/production-logs', active: currentUrl.startsWith('/production-logs') },
                { title: 'Arus Kas', icon: Wallet, href: '/cash-flows', active: currentUrl.startsWith('/cash-flows') },
            ]
        },
        { 
            title: 'Laporan & Pengaturan', 
            icon: FileText, 
            isGroup: true,
            items: [
                { title: 'Laporan', icon: FileText, href: '/reports', active: currentUrl.startsWith('/reports') },
                { title: 'Pengaturan', icon: Settings, href: '/settings', active: currentUrl.startsWith('/settings'), hidden: auth.user.role !== 'admin' },
            ]
        },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                        P
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">Provillo</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-6">
                {menuItems.map((group, idx) => (
                    <div key={idx}>
                        {group.isGroup ? (
                            <div className="mb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {group.title}
                            </div>
                        ) : (
                            <Link
                                href={group.href || '#'}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                    group.active 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                        : 'hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <group.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{group.title}</span>
                            </Link>
                        )}

                        {group.items && (
                            <div className="space-y-1">
                                {group.items.filter(i => !(i as any).hidden).map((item, itemIdx) => (
                                    <Link
                                        key={itemIdx}
                                        href={item.href}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                            item.active 
                                                ? 'bg-blue-600/10 text-blue-400 font-medium' 
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4" />
                                            <span className="text-sm">{item.title}</span>
                                        </div>
                                        {(item as any).badge && (item as any).badge > 0 ? (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-500/30">
                                                {(item as any).badge}
                                            </span>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* User Profile Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0">
                <Link 
                    href={route('logout')} 
                    method="post" 
                    as="button"
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <UserSquare2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{auth.user.name}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{auth.user.role}</p>
                    </div>
                    <LogOut className="w-4 h-4 shrink-0 text-slate-500" />
                </Link>
            </div>
        </aside>
    );
}
