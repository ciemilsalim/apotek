import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InteractiveSpotlightTour from '@/Components/InteractiveSpotlightTour';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    Building2,
    Calendar,
    ClipboardList,
    Compass,
    FileBarChart2,
    FileText,
    History,
    Layers,
    Pill,
    Receipt,
    ShieldAlert,
    ShoppingCart,
    Store,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';

export default function Dashboard({
    stats,
    expiringBatches = [],
    lowStockItems = [],
}) {
    const { auth, pharmacy } = usePage().props;
    const user = auth.user;

    // Define all mobile-style menu items with role access and visual styling
    const allMenuItems = [
        {
            id: 'pos',
            title: 'Kasir / Transaksi',
            subtitle: 'Layanan penjualan obat',
            href: route('pos.index'),
            icon: ShoppingCart,
            gradient: 'from-green-600 to-green-500 shadow-green-500/20',
            roles: ['admin', 'kasir'],
            badge: null,
        },
        {
            id: 'pos_history',
            title: 'Riwayat Struk',
            subtitle: 'Cetak ulang nota kasir',
            href: route('pos.history'),
            icon: History,
            gradient: 'from-slate-800 to-slate-700 shadow-slate-700/20',
            roles: ['admin', 'kasir'],
            badge: null,
        },
        {
            id: 'medicines',
            title: 'Katalog Obat & Stok',
            subtitle: 'Daftar obat, harga & stok',
            href: route('medicines.index'),
            icon: Pill,
            gradient: 'from-teal-600 to-cyan-500 shadow-teal-500/20',
            roles: ['admin', 'operator'],
            badge: stats?.lowStockCount > 0 ? `${stats.lowStockCount} Menipis` : null,
            badgeColor: 'bg-amber-500 text-white',
        },
        {
            id: 'categories',
            title: 'Kategori Obat',
            subtitle: 'Kelompok golongan obat',
            href: route('categories.index'),
            icon: Layers,
            gradient: 'from-cyan-600 to-blue-500 shadow-cyan-500/20',
            roles: ['admin', 'operator'],
            badge: null,
        },
        {
            id: 'expiries',
            title: 'Pantau Kadaluarsa',
            subtitle: 'Monitoring batch FEFO',
            href: route('expiries.index'),
            icon: AlertTriangle,
            gradient: 'from-amber-500 to-orange-500 shadow-amber-500/20',
            roles: ['admin', 'operator'],
            badge: expiringBatches && expiringBatches.length > 0 ? `${expiringBatches.length} Kritis` : null,
            badgeColor: 'bg-rose-600 text-white',
        },
        {
            id: 'prescriptions',
            title: 'Resep & Racikan',
            subtitle: 'Resep dokter & etiket',
            href: route('prescriptions.index'),
            icon: FileText,
            gradient: 'from-indigo-600 to-purple-500 shadow-indigo-500/20',
            roles: ['admin', 'operator'],
            badge: null,
        },
        {
            id: 'adjustments',
            title: 'Catatan Mutasi Stok',
            subtitle: 'Audit keluar-masuk stok',
            href: route('medicines.adjustments'),
            icon: ClipboardList,
            gradient: 'from-blue-600 to-sky-500 shadow-blue-500/20',
            roles: ['admin', 'operator'],
            badge: null,
        },
        {
            id: 'reports',
            title: 'Laporan Penjualan',
            subtitle: 'Rekap transaksi & PDF',
            href: route('reports.index'),
            icon: FileBarChart2,
            gradient: 'from-rose-600 to-pink-500 shadow-rose-500/20',
            roles: ['admin', 'operator'],
            badge: null,
        },
        {
            id: 'profit_loss',
            title: 'Laporan Laba Rugi',
            subtitle: 'HPP, omset & profit bersih',
            href: route('reports.profit-loss'),
            icon: TrendingUp,
            gradient: 'from-violet-600 to-purple-600 shadow-violet-500/20',
            roles: ['admin', 'operator'],
            badge: null,
        },
        {
            id: 'finance',
            title: 'Keuangan & Buku Kas',
            subtitle: 'Pemasukan & pengeluaran',
            href: route('finance.index'),
            icon: Wallet,
            gradient: 'from-green-700 to-green-600 shadow-green-600/20',
            roles: ['admin', 'operator'],
            badge: null,
        },
        {
            id: 'users',
            title: 'Kelola Akun Staf',
            subtitle: 'Admin, operator & kasir',
            href: route('users.index'),
            icon: Users,
            gradient: 'from-purple-700 to-indigo-600 shadow-purple-600/20',
            roles: ['admin'],
            badge: null,
        },
        {
            id: 'pharmacy_settings',
            title: 'Profil & Identitas Apotek',
            subtitle: 'Nama, logo, legalitas & struk',
            href: route('settings.pharmacy.edit'),
            icon: Store,
            gradient: 'from-blue-700 to-teal-600 shadow-blue-600/20',
            roles: ['admin'],
            badge: null,
        },
    ];

    // Filter items based on active user's role
    const menuItems = allMenuItems.filter((item) => item.roles.includes(user.role));

    // Current formatted date in Indonesian
    const todayFormatted = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const roleName = {
        admin: 'Admin Apotek',
        operator: 'Petugas Stok',
        kasir: 'Kasir Penjualan',
    }[user.role] || user.role;

    // Tour steps for interactive animated spotlight on Dashboard
    const dashboardTourSteps = [
        {
            target: '[data-tour="dashboard-welcome"]',
            title: 'Selamat Datang di Apotek Sehat!',
            content: 'Ini adalah pusat kendali apotek Anda. Di sini Anda dapat melihat status apotek, profil pengguna yang aktif, serta akses cepat ke seluruh sistem.',
        },
        {
            target: '[data-tour="dashboard-pos"]',
            title: 'Menu Kasir & Penjualan (POS)',
            content: 'Fitur utama untuk melayani transaksi kasir, scan barcode obat fisik atau via kamera hp, cetak struk termal otomatis, dan tebus resep dokter.',
        },
        {
            target: '[data-tour="dashboard-medicines"]',
            title: 'Katalog Obat & Stok',
            content: 'Kelola data obat, pantau stok menipis, import data dari Excel, dan cetak stiker barcode untuk produk apotek.',
        },
        {
            target: '[data-tour="dashboard-expiries"]',
            title: 'Pantau Kadaluarsa & FEFO',
            content: 'Monitoring otomatis batch obat yang mendekati masa expired agar dapat diprioritaskan penjualannya sesuai prinsip FEFO.',
        },
        {
            target: '[data-tour="dashboard-tour-btn"]',
            title: 'Panduan & Bantuan Kapan Saja',
            content: 'Anda dapat mengulang animasi panduan fitur ini kapan saja dengan menekan tombol Tour Fitur ini. Selamat beraktivitas!',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3 w-full">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Menu Utama
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Pilih menu untuk memulai aktivitas operasional apotek
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Beranda - ${pharmacy?.name || 'Apotek Sehat'}`} />

            <div className="py-2 sm:py-4 max-w-6xl mx-auto">
                {/* Welcome Card Banner (Soft Clean Healthcare Theme, Anti-Eye Fatigue) */}
                <div
                    data-tour="dashboard-welcome"
                    className="mb-5 sm:mb-6 rounded-2xl lg:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-red-50/50 via-slate-50/30 to-transparent pointer-events-none" />
                    <div className="absolute right-12 -top-12 w-48 h-48 rounded-full bg-red-100/30 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                            {pharmacy?.logo_url ? (
                                <img
                                    src={pharmacy.logo_url}
                                    alt="Logo"
                                    className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-2xl bg-white p-1.5 shadow-2xs shrink-0 border border-slate-200"
                                />
                            ) : (
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                                    <Store className="h-6 w-6" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/80">
                                        {roleName}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-green-50 text-green-700 border border-green-200/80">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Sistem Online
                                    </span>
                                </div>
                                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight mt-1 truncate">
                                    Selamat Datang, {user.name}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium truncate">
                                    {pharmacy?.name || 'Apotek Hibbatillah'} • {todayFormatted}
                                </p>
                            </div>
                        </div>

                        {/* Quick Tour Button */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                                type="button"
                                data-tour="dashboard-tour-btn"
                                onClick={() => window.dispatchEvent(new CustomEvent('start-spotlight-tour', { detail: { key: 'dashboard' } }))}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-red-600 text-xs font-bold transition shadow-2xs active:scale-95"
                                title="Mulai Tour & Panduan Fitur Apotek"
                            >
                                <Compass className="h-4 w-4 text-red-600" />
                                <span>Panduan Fitur</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile-Style Menu Icons Launcher Grid (Responsive: 2-3 col mobile, 4 col tablet, 6 col desktop) */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                        <span className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                            Daftar Menu Layanan
                        </span>
                        <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">
                            {menuItems.length} Layanan Aktif
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5 lg:gap-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const tourAttr =
                                item.id === 'pos'
                                    ? 'dashboard-pos'
                                    : item.id === 'medicines'
                                    ? 'dashboard-medicines'
                                    : item.id === 'expiries'
                                    ? 'dashboard-expiries'
                                    : undefined;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    data-tour={tourAttr}
                                    className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 lg:p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-300 hover:-translate-y-0.5 transition-all duration-150 active:scale-95 text-center"
                                >
                                    {/* Icon Container with Gradient Squircle Shape */}
                                    <div
                                        className={`relative flex h-12 w-12 sm:h-13 sm:w-13 lg:h-14 lg:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.gradient} text-white shadow-sm transition-transform duration-150 group-hover:scale-105 group-active:scale-95`}
                                    >
                                        <Icon className="h-6 w-6 sm:h-6.5 sm:w-6.5 lg:h-7 lg:w-7 stroke-[1.8]" />

                                        {/* Notification / Alert Pill */}
                                        {item.badge && (
                                            <span
                                                className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black shadow-xs ring-2 ring-white z-10 ${
                                                    item.badgeColor || 'bg-rose-600 text-white'
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Menu Title */}
                                    <span className="mt-2.5 text-xs sm:text-xs lg:text-[13px] font-extrabold text-slate-800 group-hover:text-red-700 transition-colors leading-snug line-clamp-1">
                                        {item.title}
                                    </span>

                                    {/* Menu Subtitle */}
                                    <span className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 font-medium line-clamp-1">
                                        {item.subtitle}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Simple System Info Footer */}
                <div className="text-center py-4 border-t border-slate-200/70 text-xs text-slate-400">
                    <p className="font-semibold text-slate-500">
                        {pharmacy?.name || 'Apotek Sehat'} — Sistem Manajemen Farmasi & Kasir
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Akses Cepat Layar Sentuh • Aman, Cepat & Terintegrasi
                    </p>
                </div>
            </div>

            {/* Interactive Spotlight Animated Tour */}
            <InteractiveSpotlightTour tourKey="dashboard" steps={dashboardTourSteps} />
        </AuthenticatedLayout>

    );
}
