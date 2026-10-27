import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ClipboardList,
    FileBarChart2,
    History,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    Pill,
    PlusCircle,
    ShoppingCart,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dismissFlash, setDismissFlash] = useState(false);

    // Role badge color configuration
    const roleBadges = {
        admin: {
            label: 'ADMINISTRATOR',
            classes: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
        },
        operator: {
            label: 'OPERATOR STOK',
            classes: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        },
        kasir: {
            label: 'KASIR',
            classes: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        },
    };

    const currentBadge = roleBadges[user.role] || {
        label: user.role?.toUpperCase(),
        classes: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    // Navigation items based on role
    const navItems = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: LayoutDashboard,
            roles: ['admin', 'operator', 'kasir'],
        },
        {
            title: 'Kasir / POS',
            href: route('pos.index'),
            active: route().current('pos.index'),
            icon: ShoppingCart,
            roles: ['admin', 'kasir'],
        },
        {
            title: 'Riwayat Penjualan',
            href: route('pos.history'),
            active: route().current('pos.history') || route().current('pos.receipt'),
            icon: History,
            roles: ['admin', 'kasir'],
        },
        {
            title: 'Data Obat & Stok',
            href: route('medicines.index'),
            active: route().current('medicines.index'),
            icon: Pill,
            roles: ['admin', 'operator'],
        },
        {
            title: 'Kategori Obat',
            href: route('categories.index'),
            active: route().current('categories.index'),
            icon: Layers,
            roles: ['admin', 'operator'],
        },
        {
            title: 'Riwayat Stok',
            href: route('medicines.adjustments'),
            active: route().current('medicines.adjustments'),
            icon: ClipboardList,
            roles: ['admin', 'operator'],
        },
        {
            title: 'Laporan Penjualan',
            href: route('reports.index'),
            active: route().current('reports.*'),
            icon: FileBarChart2,
            roles: ['admin', 'operator'],
        },
        {
            title: 'Manajemen Pengguna',
            href: route('users.index'),
            active: route().current('users.*'),
            icon: Users,
            roles: ['admin'],
        },
    ];

    const allowedNavItems = navItems.filter((item) =>
        item.roles.includes(user.role),
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 dark:bg-slate-900 dark:text-slate-100">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                {/* Brand header */}
                <div className="flex h-18 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                    <Link href={route('dashboard')}>
                        <ApplicationLogo />
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User mini profile card in sidebar */}
                <div className="p-4 mx-4 my-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/15">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {user.name}
                            </p>
                            <span
                                className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider border ${currentBadge.classes}`}
                            >
                                {currentBadge.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation links */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                    <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Menu Utama
                    </div>
                    {allowedNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                                    item.active
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:bg-emerald-500'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                                }`}
                            >
                                <Icon
                                    className={`h-4 w-4 shrink-0 ${
                                        item.active ? 'text-white' : 'text-slate-400'
                                    }`}
                                />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Sidebar footer */}
                <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar Sistem</span>
                    </Link>
                </div>
            </aside>

            {/* Main content wrapper */}
            <div className="flex min-h-screen flex-col lg:pl-72">
                {/* Top header bar */}
                <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="hidden sm:block">
                            {header}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Quick POS action button if role is admin or kasir */}
                        {['admin', 'kasir'].includes(user.role) && (
                            <Link
                                href={route('pos.index')}
                                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span>Buka Kasir</span>
                            </Link>
                        )}

                        {/* User dropdown menu */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs dark:bg-emerald-900/60 dark:text-emerald-200">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:inline font-semibold">
                                        {user.name}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right" width="48">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {user.name}
                                    </div>
                                    <div className="text-slate-500 truncate">{user.email}</div>
                                </div>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profil Saya
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Keluar
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Mobile title if header is present */}
                {header && (
                    <div className="block sm:hidden border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                        {header}
                    </div>
                )}

                {/* Flash Messages */}
                {!dismissFlash && (flash?.success || flash?.error) && (
                    <div className="mx-4 mt-4 sm:mx-6 lg:mx-8">
                        {flash.success && (
                            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{flash.success}</span>
                                </div>
                                <button
                                    onClick={() => setDismissFlash(true)}
                                    className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        {flash.error && (
                            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
                                <div className="flex items-center gap-2.5">
                                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                                    <span>{flash.error}</span>
                                </div>
                                <button
                                    onClick={() => setDismissFlash(true)}
                                    className="text-rose-600 hover:text-rose-800 dark:text-rose-400"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
