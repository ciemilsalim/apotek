import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children, maxWidth = 'sm:max-w-xl' }) {
    const { pharmacy } = usePage().props;
    const currentYear = new Date().getFullYear();

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-slate-50/90 p-4 sm:p-6 font-sans text-slate-800 antialiased selection:bg-red-600 selection:text-white">
            <Head>
                {pharmacy?.logo_url && (
                    <>
                        <link rel="icon" type="image/png" href={pharmacy.logo_url} />
                        <link rel="shortcut icon" href={pharmacy.logo_url} />
                        <link rel="apple-touch-icon" href={pharmacy.logo_url} />
                    </>
                )}
            </Head>
            {/* Ambient Background Decorative Gradients */}
            <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
            <div className="pointer-events-none fixed -bottom-40 right-10 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />

            {/* Brand Header with Dynamic Pharmacy Profile */}
            <div className="relative z-10 mb-4 sm:mb-5 flex flex-col items-center text-center">
                <Link href="/" className="inline-flex items-center gap-3 transition hover:opacity-95">
                    {pharmacy?.logo_url ? (
                        <>
                            <img
                                src={pharmacy.logo_url}
                                alt={pharmacy.name || 'Logo Apotek'}
                                className="h-11 w-11 object-contain rounded-2xl shadow-xs border border-slate-200/80 bg-white p-1"
                            />
                            <div className="flex flex-col text-left">
                                <span className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                                    {pharmacy?.name || 'Apotek Hibbatillah'}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500 tracking-wide">
                                    {pharmacy?.tagline || 'Sistem Informasi Farmasi & Kasir'}
                                </span>
                            </div>
                        </>
                    ) : (
                        <ApplicationLogo
                            name={pharmacy?.name}
                            tagline={pharmacy?.tagline || 'Sistem Informasi Farmasi & Kasir'}
                        />
                    )}
                </Link>
            </div>

            {/* Main Glass Card */}
            <div className={`relative z-10 w-full ${maxWidth} overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 sm:p-8 shadow-xl shadow-slate-900/5`}>
                {children}
            </div>

            {/* Dynamic Footer */}
            <div className="relative z-10 mt-5 text-center text-xs text-slate-400 space-y-0.5">
                <p>
                    &copy; {currentYear} <strong>{pharmacy?.name || 'Apotek Sehat'}</strong> • Layanan Farmasi Terpadu
                </p>
                {pharmacy?.address && (
                    <p className="text-[11px] text-slate-400 font-normal">
                        {pharmacy.address}
                    </p>
                )}
                <p className="text-[11px] text-slate-400 font-normal pt-0.5">
                    Created By{' '}
                    <a
                        href="https://zahradev.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-red-600 hover:text-red-700 hover:underline transition"
                    >
                        zahradev
                    </a>
                </p>
            </div>
        </div>
    );
}

