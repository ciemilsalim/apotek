import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileBarChart2,
    FileText,
    History,
    Home,
    Layers,
    LayoutDashboard,
    LayoutGrid,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
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
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash, pharmacy } = usePage().props;
    const user = auth.user;
    const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
    const [dismissFlash, setDismissFlash] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('apotek_sidebar_collapsed');
            if (saved !== null) return saved === 'true';
        }
        return true; // Default collapsed on desktop
    });

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('apotek_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    // Prevent background scrolling and enable Escape to close when bottom sheet is active
    useEffect(() => {
        if (bottomSheetOpen) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') setBottomSheetOpen(false);
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [bottomSheetOpen]);

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
            {/* Desktop Fixed Sidebar (>= 1024px) */}
            <aside
                className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-slate-200/90 bg-white transition-all duration-200 ease-in-out ${
                    sidebarCollapsed ? 'w-20' : 'w-64 xl:w-72'
                }`}
            >
                {/* Brand Header */}
                <div
                    className={`flex h-16 sm:h-20 items-center border-b border-slate-100 ${
                        sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-5 sm:px-6'
                    }`}
                >
                    {sidebarCollapsed ? (
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="group flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition"
                            title="Buka / Perlebar Sidebar"
                        >
                            {pharmacy?.logo_url ? (
                                <img
                                    src={pharmacy.logo_url}
                                    alt={pharmacy.name || 'Logo Apotek'}
                                    className="h-10 w-10 object-contain rounded-xl border border-slate-200/80 bg-white p-1 shadow-xs"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-sm">
                                    <Pill className="h-5 w-5" />
                                </div>
                            )}
                        </button>
                    ) : (
                        <>
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
                                type="button"
                                onClick={toggleSidebar}
                                className="p-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs"
                                title="Ciutkan Sidebar"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* User Info Card (Clean Flat Design) */}
                {sidebarCollapsed ? (
                    <div className="py-3 px-2 flex justify-center border-b border-slate-100">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-sm shadow-xs cursor-default"
                            title={`${user.name} — ${currentRole.name}`}
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                ) : (
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
                )}

                {/* Sidebar Navigation Links */}
                <div
                    className={`flex-1 overflow-y-auto py-2 space-y-3 ${
                        sidebarCollapsed ? 'px-2' : 'px-4'
                    }`}
                >
                    {sidebarNavItems.map((group, gIdx) => {
                        const filtered = group.items.filter((item) =>
                            item.roles.includes(user.role),
                        );
                        if (filtered.length === 0) return null;

                        return (
                            <div key={gIdx} className="space-y-1">
                                {sidebarCollapsed ? (
                                    <div className="w-6 mx-auto border-t border-slate-200 my-2" />
                                ) : (
                                    <div className="px-3 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                                        {group.section}
                                    </div>
                                )}
                                {filtered.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            title={sidebarCollapsed ? `${item.title} (${item.subtitle})` : undefined}
                                            className={`flex items-center transition-all ${
                                                sidebarCollapsed
                                                    ? 'justify-center h-11 w-11 mx-auto rounded-xl'
                                                    : 'gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold'
                                            } ${
                                                item.active
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <Icon
                                                className={`shrink-0 ${
                                                    sidebarCollapsed ? 'h-5 w-5' : 'h-5 w-5'
                                                } ${
                                                    item.active ? 'text-white' : 'text-slate-400'
                                                }`}
                                            />
                                            {!sidebarCollapsed && (
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
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar Footer Logout */}
                <div
                    className={`border-t border-slate-100 ${
                        sidebarCollapsed ? 'p-2 flex justify-center' : 'p-4'
                    }`}
                >
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        title="Keluar Akun"
                        className={`flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition ${
                            sidebarCollapsed
                                ? 'h-11 w-11'
                                : 'w-full gap-2 px-4 py-3 text-sm font-bold'
                        }`}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed && <span>Keluar Akun</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content Area (Mobile First: Full Width on mobile, offset on desktop based on collapse state) */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
                    sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64 xl:pl-72'
                }`}
            >
                {/* Top Clean App Bar */}
                <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        {/* Mobile & Tablet Clean Brand Header (No hamburger icon) */}
                        <div className="flex items-center gap-2.5 lg:hidden">
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
                            <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-[220px]">
                                {pharmacy?.name || 'Apotek Sehat'}
                            </span>
                        </div>

                        {/* Desktop Sidebar Toggle & Page Header */}
                        <div className="hidden lg:flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                className="p-2 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition shadow-xs"
                                title={sidebarCollapsed ? 'Perlebar Sidebar' : 'Ciutkan Sidebar'}
                                aria-label={sidebarCollapsed ? 'Perlebar Sidebar' : 'Ciutkan Sidebar'}
                            >
                                {sidebarCollapsed ? (
                                    <PanelLeftOpen className="h-4 w-4" />
                                ) : (
                                    <PanelLeftClose className="h-4 w-4" />
                                )}
                            </button>
                            {header}
                        </div>
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
                    {/* Bottom Sheet Menu Launcher */}
                    <button
                        type="button"
                        onClick={() => setBottomSheetOpen(true)}
                        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                            bottomSheetOpen
                                ? 'text-emerald-700 font-extrabold'
                                : 'text-slate-500 hover:text-slate-800 font-medium'
                        }`}
                        aria-label="Buka Semua Menu"
                    >
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                                bottomSheetOpen ? 'bg-emerald-100 text-emerald-700' : ''
                            }`}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] mt-0.5 tracking-tight font-semibold">
                            Menu
                        </span>
                    </button>
                </div>
            </nav>

            {/* Mobile & Tablet Bottom Sheet Menu */}
            {bottomSheetOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-backdrop-fade-in"
                        onClick={() => setBottomSheetOpen(false)}
                    />

                    {/* Sheet Container */}
                    <div className="fixed inset-x-0 bottom-0 z-50 w-full max-w-xl mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-slate-200/90 flex flex-col max-h-[85vh] animate-sheet-slide-up">
                        {/* Drag / Pull Handle */}
                        <div
                            className="py-2.5 flex items-center justify-center shrink-0 cursor-pointer"
                            onClick={() => setBottomSheetOpen(false)}
                        >
                            <div className="w-12 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition" />
                        </div>

                        {/* Sheet Header */}
                        <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                {pharmacy?.logo_url ? (
                                    <img
                                        src={pharmacy.logo_url}
                                        alt={pharmacy.name || 'Logo Apotek'}
                                        className="h-10 w-10 object-contain rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-xs shrink-0"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shrink-0">
                                        <Pill className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                                        Semua Menu & Layanan
                                    </h3>
                                    <p className="text-[11px] text-slate-500 font-medium truncate">
                                        {pharmacy?.name || 'Apotek Sehat'} • Akses Lengkap
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setBottomSheetOpen(false)}
                                className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
                                aria-label="Tutup Menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* User Profile Info Strip */}
                        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-slate-900 leading-tight">
                                        {user.name}
                                    </p>
                                    <span className="text-[10px] text-slate-500 truncate block">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border shrink-0 ${currentRole.badge}`}>
                                {currentRole.name}
                            </span>
                        </div>

                        {/* Scrollable Navigation Menu List */}
                        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
                            {sidebarNavItems.map((group, gIdx) => {
                                const filtered = group.items.filter((item) =>
                                    item.roles.includes(user.role),
                                );
                                if (filtered.length === 0) return null;

                                return (
                                    <div key={gIdx} className="space-y-1.5">
                                        <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase px-1">
                                            {group.section}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                            {filtered.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        onClick={() => setBottomSheetOpen(false)}
                                                        className={`flex items-center justify-between p-3 rounded-2xl transition active:scale-[0.98] ${
                                                            item.active
                                                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                                                : 'bg-white border border-slate-200/80 text-slate-800 hover:bg-slate-50 font-semibold'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div
                                                                className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                                                                    item.active
                                                                        ? 'bg-white/20 text-white'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                            >
                                                                <Icon className="h-4.5 w-4.5" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-xs truncate font-bold">
                                                                    {item.title}
                                                                </div>
                                                                <div
                                                                    className={`text-[10px] truncate ${
                                                                        item.active
                                                                            ? 'text-emerald-100'
                                                                            : 'text-slate-400'
                                                                    }`}
                                                                >
                                                                    {item.subtitle}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight
                                                            className={`h-4 w-4 shrink-0 ${
                                                                item.active ? 'text-white' : 'text-slate-300'
                                                            }`}
                                                        />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sheet Footer with Logout */}
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition active:scale-[0.99]"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Keluar Akun ({user.name})</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
