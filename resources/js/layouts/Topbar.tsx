import { Search, Bell, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
            <div className="flex items-center flex-1 gap-4">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                
                {/* Global Search */}
                <div className="hidden md:flex items-center relative max-w-md w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input 
                        type="text" 
                        placeholder="Cari pesanan, produk, atau customer..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>
        </header>
    );
}
