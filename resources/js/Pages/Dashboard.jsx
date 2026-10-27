import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    Building2,
    Calendar,
    ClipboardList,
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
            gradient: 'from-emerald-600 to-teal-500 shadow-emerald-500/20',
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
            gradient: 'from-emerald-700 to-emerald-500 shadow-emerald-600/20',
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

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Menu Utama
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Pilih menu untuk memulai aktivitas operasional apotek
                    </p>
                </div>
            }
        >
            <Head title={`Beranda - ${pharmacy?.name || 'Apotek Sehat'}`} />

            <div className="py-2 sm:py-4 max-w-6xl mx-auto">
                {/* Welcome Card Banner (Mobile First, Sleek & Precise) */}
                <div className="mb-5 sm:mb-6 rounded-2xl lg:rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-4 sm:p-5 lg:p-6 shadow-xs relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            {pharmacy?.logo_url ? (
                                <img
                                    src={pharmacy.logo_url}
                                    alt="Logo"
                                    className="h-11 w-11 sm:h-13 sm:w-13 object-contain rounded-xl sm:rounded-2xl bg-white p-1 shadow-xs shrink-0 border border-white/20"
                                />
                            ) : (
                                <div className="h-11 w-11 sm:h-13 sm:w-13 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
                                    <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
                                        {roleName}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-100 font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                        Online
                                    </span>
                                </div>
                                <h2 className="text-sm sm:text-lg lg:text-xl font-black text-white tracking-tight mt-0.5 truncate">
                                    Selamat Datang, {user.name}
                                </h2>
                                <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium truncate">
                                    {pharmacy?.name || 'Apotek Sehat'} • {todayFormatted}
                                </p>
                            </div>
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

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 lg:p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-150 active:scale-95 text-center"
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
                                    <span className="mt-2.5 text-xs sm:text-xs lg:text-[13px] font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-1">
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
        </AuthenticatedLayout>
    );
}
