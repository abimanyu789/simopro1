import { PropsWithChildren } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Toaster } from 'react-hot-toast';

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            {/* Sidebar (Desktop) */}
            <div className="hidden lg:block w-64 shrink-0">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Toast Notifications */}
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'text-sm font-medium rounded-xl border border-slate-100 shadow-lg',
                    duration: 4000,
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    );
}
