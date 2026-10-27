import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, maxWidth = 'sm:max-w-lg' }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50/80 via-slate-50 to-teal-50/50 p-4 sm:p-6 font-sans text-slate-800 antialiased">
            <div className="mb-4 flex flex-col items-center text-center">
                <Link href="/" className="transition hover:opacity-90">
                    <ApplicationLogo className="h-12 w-12" />
                </Link>
            </div>

            <div className={`w-full ${maxWidth} overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-emerald-950/5`}>
                {children}
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
                &copy; 2026 <strong>Apotek Sehat</strong> • Sistem Informasi Farmasi Terpadu
            </div>
        </div>
    );
}
