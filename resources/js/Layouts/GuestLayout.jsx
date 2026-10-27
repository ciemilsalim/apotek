import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans">
            <div className="mb-6 flex flex-col items-center">
                <Link href="/" className="transition hover:scale-105">
                    <ApplicationLogo />
                </Link>
            </div>

            <div className="w-full sm:max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-emerald-950/5 dark:border-slate-800 dark:bg-slate-950">
                {children}
            </div>

            <div className="mt-8 text-center text-xs text-slate-400">
                &copy; 2026 Apotek Sehat • Sistem Manajemen Farmasi Terpadu
            </div>
        </div>
    );
}
