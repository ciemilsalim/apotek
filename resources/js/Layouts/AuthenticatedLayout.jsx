import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    FileBarChart2,
    FileText,
    History,
    Home,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    Pill,
    Settings,
    ShoppingCart,
    Store,
    TrendingUp,
    User,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash, pharmacy } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dismissFlash, setDismissFlash] = useState(false);

    // Human-friendly role naming for non-technical users
    const roleLabels = {
        admin: {
            name: 'Admin Apotek',
            badge: 'bg-purple-100 text-purple-800 border-purple-200',
        },
        operator: {
            name: 'Petugas Stok',
            badge: 'bg-blue-100 text-blue-800 border-blue-200',
        },
        kasir: {
            name: 'Kasir Penjualan',
            badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
    };

    const currentRole = roleLabels[user.role] || {
        name: user.role,
        badge: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    // Primary mobile navigation items
    const mobileNavItems = [
        {
            title: 'Beranda',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: Home,
            roles: ['admin', 'operator', 'kasir'],
        },
        {
            title: 'Kasir',
            href: route('pos.index'),
            active: route().current('pos.*'),
            icon: ShoppingCart,
            roles: ['admin', 'kasir'],
        },
        {
            title: 'Data Obat',
            href: route('medicines.index'),
            active: route().current('medicines.*') || route().current('categories.*'),
            icon: Pill,
            roles: ['admin', 'operator'],
        },
        {
            title: 'Laporan',
            href: route('reports.index'),
            active: route().current('reports.*'),
            icon: FileBarChart2,
            roles: ['admin', 'operator'],
        },
        {
            title: 'Pengguna',
            href: route('users.index'),
            active: route().current('users.*'),
            icon: Users,
            roles: ['admin'],
        },
    ].filter((item) => item.roles.includes(user.role));

    // Full sidebar navigation items for Tablet & Desktop
    const sidebarNavItems = [
        {
            section: 'UTAMA',
            items: [
                {
                    title: 'Beranda',
                    subtitle: 'Ringkasan & status apotek',
                    href: route('dashboard'),
                    active: route().current('dashboard'),
                    icon: LayoutDashboard,
                    roles: ['admin', 'operator', 'kasir'],
                },
            ],
        },
        {
            section: 'PENJUALAN',
            items: [
                {
                    title: 'Kasir / Transaksi',
                    subtitle: 'Layanan penjualan obat',
                    href: route('pos.index'),
                    active: route().current('pos.index'),
                    icon: ShoppingCart,
                    roles: ['admin', 'kasir'],
                },
                {
                    title: 'Riwayat Struk Penjualan',
                    subtitle: 'Daftar transaksi selesai',
                    href: route('pos.history'),
                    active: route().current('pos.history') || route().current('pos.receipt'),
                    icon: History,
                    roles: ['admin', 'kasir'],
                },
            ],
        },
        {
            section: 'STOK & OBAT',
            items: [
                {
                    title: 'Katalog Obat & Stok',
                    subtitle: 'Daftar obat & tambah stok',
                    href: route('medicines.index'),
                    active: route().current('medicines.index'),
                    icon: Pill,
                    roles: ['admin', 'operator'],
                },
                {
                    title: 'Kategori Obat',
                    subtitle: 'Kelompok jenis obat',
                    href: route('categories.index'),
                    active: route().current('categories.index'),
                    icon: Layers,
                    roles: ['admin', 'operator'],
                },
                {
                    title: 'Monitoring Kadaluarsa',
                    subtitle: 'Peringatan & karantina batch',
                    href: route('expiries.index'),
                    active: route().current('expiries.*'),
                    icon: AlertTriangle,
                    roles: ['admin', 'operator'],
                },
                {
                    title: 'Resep & Racikan Dokter',
                    subtitle: 'Kelola formula & etiket',
                    href: route('prescriptions.index'),
                    active: route().current('prescriptions.*'),
                    icon: FileText,
                    roles: ['admin', 'operator'],
                },
                {
                    title: 'Catatan Keluar-Masuk Stok',
                    subtitle: 'Audit mutasi & restock',
                    href: route('medicines.adjustments'),
                    active: route().current('medicines.adjustments'),
                    icon: ClipboardList,
                    roles: ['admin', 'operator'],
                },
            ],
        },
        {
            section: 'LAPORAN & KONTROL',
            items: [
                {
                    title: 'Laporan Penjualan',
                    subtitle: 'Cetak PDF & Excel',
                    href: route('reports.index'),
                    active: route().current('reports.index'),
                    icon: FileBarChart2,
                    roles: ['admin', 'operator'],
                },
                {
                    title: 'Laporan Laba Rugi',
                    subtitle: 'HPP & Laba Bersih',
                    href: route('reports.profit-loss'),
                    active: route().current('reports.profit-loss*'),
                    icon: TrendingUp,
                    roles: ['admin', 'operator'],
                },
                {
                    title: 'Keuangan & Arus Kas',
                    subtitle: 'Buku kas & pengeluaran',
                    href: route('finance.index'),
                    active: route().current('finance.*'),
                    icon: Wallet,
                    roles: ['admin', 'operator'],
                },
                {
                    title: 'Kelola Akun Staf',
                    subtitle: 'Admin, Operator, Kasir',
                    href: route('users.index'),
                    active: route().current('users.*'),
                    icon: Users,
                    roles: ['admin'],
                },
                {
                    title: 'Profil & Identitas Apotek',
                    subtitle: 'Nama, logo, legalitas & struk',
                    href: route('settings.pharmacy.edit'),
                    active: route().current('settings.pharmacy.*'),
                    icon: Store,
                    roles: ['admin'],
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col pb-20 lg:pb-0">
            {/* Mobile Drawer Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Tablet Slide-over) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 lg:w-64 xl:w-72 flex-col border-r border-slate-200/90 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="flex h-16 sm:h-20 items-center justify-between px-5 sm:px-6 border-b border-slate-100">
                    <Link href={route('dashboard')} className="flex items-center gap-3 min-w-0">
                        {pharmacy?.logo_url ? (
                            <img
                                src={pharmacy.logo_url}
                                alt={pharmacy.name || 'Logo Apotek'}
                                className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-xl border border-slate-200/80 bg-white p-1 shadow-xs shrink-0"
                            />
                        ) : (
                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-sm shrink-0">
                                <Pill className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight truncate">
                                {pharmacy?.name || 'Apotek Sehat'}
                            </div>
                            <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                                {pharmacy?.tagline || 'Sistem Manajemen Mudah'}
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
                        aria-label="Tutup Menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User Info Card (Clean Flat Design) */}
                <div className="p-3.5 mx-3 sm:mx-4 my-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-base">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                {user.name}
                            </p>
                            <span
                                className={`inline-block mt-0.5 rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-bold border ${currentRole.badge}`}
                            >
                                {currentRole.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                    {sidebarNavItems.map((group, gIdx) => {
                        const filtered = group.items.filter((item) =>
                            item.roles.includes(user.role),
                        );
                        if (filtered.length === 0) return null;

                        return (
                            <div key={gIdx} className="space-y-1">
                                <div className="px-3 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                                    {group.section}
                                </div>
                                {filtered.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all ${
                                                item.active
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 shrink-0 ${
                                                    item.active ? 'text-white' : 'text-slate-400'
                                                }`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate">{item.title}</div>
                                                <div
                                                    className={`text-[11px] font-normal truncate ${
                                                        item.active
                                                            ? 'text-emerald-100'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {item.subtitle}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar Footer Logout */}
                <div className="border-t border-slate-100 p-4">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 transition"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar Akun</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area (Mobile First: Full Width on mobile, offset on desktop) */}
            <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
                {/* Top Clean App Bar */}
                <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-2xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"
                            aria-label="Buka Menu Samping"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2 lg:hidden">
                            {pharmacy?.logo_url ? (
                                <img
                                    src={pharmacy.logo_url}
                                    alt={pharmacy.name || 'Logo Apotek'}
                                    className="h-9 w-9 object-contain rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-xs"
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                                    <Pill className="h-5 w-5" />
                                </div>
                            )}
                            <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-[200px]">
                                {pharmacy?.name || 'Apotek Sehat'}
                            </span>
                        </div>
                        <div className="hidden lg:block">{header}</div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Current Role Pill */}
                        <div
                            className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${currentRole.badge}`}
                        >
                            {currentRole.name}
                        </div>

                        {/* Quick POS Button for Kasir / Admin */}
                        {['admin', 'kasir'].includes(user.role) && !route().current('pos.*') && (
                            <Link
                                href={route('pos.index')}
                                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                <span>Buka Kasir</span>
                            </Link>
                        )}

                        {/* Quick Logout Button */}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Keluar Akun"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </header>

                {/* Subheader Title for Mobile */}
                {header && (
                    <div className="block lg:hidden border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
                        {header}
                    </div>
                )}

                {/* Flash Success & Error Notification Banner (Big & Clear) */}
                {!dismissFlash && (flash?.success || flash?.error) && (
                    <div className="mx-4 mt-4 sm:mx-6">
                        {flash.success && (
                            <div className="flex items-center justify-between rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                                    <span>{flash.success}</span>
                                </div>
                                <button
                                    onClick={() => setDismissFlash(true)}
                                    className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                        {flash.error && (
                            <div className="flex items-center justify-between rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-900 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
                                    <span>{flash.error}</span>
                                </div>
                                <button
                                    onClick={() => setDismissFlash(true)}
                                    className="rounded-lg p-1 text-rose-700 hover:bg-rose-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar (Gold standard for Mobile First UI) */}
            <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200/90 py-1.5 px-2 lg:hidden shadow-lg shadow-slate-900/10">
                <div className="flex items-center justify-around max-w-md mx-auto">
                    {mobileNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                                    item.active
                                        ? 'text-emerald-700 font-extrabold'
                                        : 'text-slate-500 hover:text-slate-800 font-medium'
                                }`}
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                                        item.active ? 'bg-emerald-100 text-emerald-700' : ''
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="text-[11px] mt-0.5 tracking-tight">
                                    {item.title}
                                </span>
                            </Link>
                        );
                    })}
                    {/* More button on mobile to open drawer */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-500 hover:text-slate-800 font-medium"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl">
                            <Menu className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] mt-0.5 tracking-tight">Lainnya</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
