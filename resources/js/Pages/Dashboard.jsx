import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    CircleDollarSign,
    Package,
    Pill,
    PlusCircle,
    Receipt,
    ShieldAlert,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react';

export default function Dashboard({
    stats,
    recentSales,
    topSelling,
    lowStockItems,
    recentAdjustments,
}) {
    const user = usePage().props.auth.user;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Dashboard Farmasi
                    </h1>
                    <p className="text-xs text-slate-500">
                        Selamat datang kembali,{' '}
                        <span className="font-semibold text-emerald-600">
                            {user.name}
                        </span>{' '}
                        ({user.role.toUpperCase()})
                    </p>
                </div>
            }
        >
            <Head title="Dashboard Farmasi" />

            {/* Quick Action Banner for Kasir & Admin */}
            {['admin', 'kasir'].includes(user.role) && (
                <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lg shadow-emerald-500/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                <ShoppingCart className="h-3.5 w-3.5" /> Point of Sale Aktif
                            </span>
                            <h2 className="mt-2 text-xl sm:text-2xl font-bold">
                                Transaksi Kasir Cepat & Struk Otomatis
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-emerald-100 max-w-xl">
                                Layani pembeli dengan pemindaian kode obat, kalkulator kembalian otomatis, dan cetak struk penjualan.
                            </p>
                        </div>
                        <Link
                            href={route('pos.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-md hover:bg-emerald-50 transition"
                        >
                            <span>Buka Terminal Kasir</span>
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                {/* 1. Omset Hari Ini */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {user.role === 'kasir' ? 'Penjualan Saya Hari Ini' : 'Penjualan Hari Ini'}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CircleDollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(
                                user.role === 'kasir'
                                    ? stats.myTodaySalesAmount
                                    : stats.todaySalesAmount,
                            )}
                        </div>
                        <p className="mt-1 flex items-center text-xs text-slate-500">
                            <Receipt className="h-3.5 w-3.5 mr-1 text-slate-400" />
                            <span>
                                {user.role === 'kasir'
                                    ? stats.myTodaySalesCount
                                    : stats.todaySalesCount}{' '}
                                Transaksi Selesai
                            </span>
                        </p>
                    </div>
                </div>

                {/* 2. Total Penjualan Bulan Ini (or Transaction stats for cashier) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Penjualan Bulan Ini
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(stats.monthSalesAmount)}
                        </div>
                        <p className="mt-1 flex items-center text-xs text-slate-500">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                            <span>{stats.monthSalesCount} Transaksi bulan ini</span>
                        </p>
                    </div>
                </div>

                {/* 3. Total Jenis Obat */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Item Obat
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                            <Pill className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {stats.totalMedicines}
                        </div>
                        <p className="mt-1 flex items-center text-xs text-slate-500">
                            <Package className="h-3.5 w-3.5 mr-1 text-slate-400" />
                            <span>Katalog farmasi aktif</span>
                        </p>
                    </div>
                </div>

                {/* 4. Stok Kritis / Menipis Alert */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Stok Menipis (Kritis)
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                            {stats.lowStockCount}
                        </div>
                        <p className="mt-1 flex items-center text-xs text-slate-500">
                            <ShieldAlert className="h-3.5 w-3.5 mr-1 text-rose-500" />
                            <span>
                                {stats.expiringCount} Obat mendekati kadaluarsa
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content 2-Column Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left 2 Cols: Recent Transactions Table */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {user.role === 'kasir'
                                    ? 'Transaksi Kasir Saya Terbaru'
                                    : 'Transaksi Penjualan Terkini'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Daftar struk & penjualan terakhir yang tercatat di sistem
                            </p>
                        </div>
                        {['admin', 'kasir'].includes(user.role) && (
                            <Link
                                href={route('pos.history')}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                            >
                                <span>Lihat Semua</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400 dark:border-slate-800">
                                <tr>
                                    <th className="pb-3">No. Faktur</th>
                                    <th className="pb-3">Waktu</th>
                                    <th className="pb-3">Pelanggan</th>
                                    <th className="pb-3">Metode</th>
                                    <th className="pb-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {recentSales && recentSales.length > 0 ? (
                                    recentSales.map((sale) => (
                                        <tr
                                            key={sale.id}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                                        >
                                            <td className="py-3 font-semibold text-emerald-600">
                                                <Link
                                                    href={route(
                                                        'pos.receipt',
                                                        sale.id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {sale.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="py-3 text-xs text-slate-500">
                                                {new Date(
                                                    sale.created_at,
                                                ).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-3 text-slate-700 dark:text-slate-300">
                                                {sale.customer_name}
                                            </td>
                                            <td className="py-3">
                                                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    {sale.payment_method}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(
                                                    sale.total_amount,
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="py-8 text-center text-xs text-slate-400"
                                        >
                                            Belum ada transaksi hari ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Col: Low Stock Warnings & Top Selling */}
                <div className="space-y-6">
                    {/* Low Stock Alert List */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span>Perlu Restock Segera</span>
                            </h3>
                            {['admin', 'operator'].includes(user.role) && (
                                <Link
                                    href={route('medicines.index', {
                                        status: 'low_stock',
                                    })}
                                    className="text-[11px] font-semibold text-emerald-600 hover:underline"
                                >
                                    Kelola
                                </Link>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            {lowStockItems && lowStockItems.length > 0 ? (
                                lowStockItems.map((med) => (
                                    <div
                                        key={med.id}
                                        className="flex items-center justify-between rounded-xl bg-amber-50/60 p-3 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/40"
                                    >
                                        <div>
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {med.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                Kode: {med.code} • Min:{' '}
                                                {med.min_stock} {med.unit}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block rounded-lg bg-amber-500 text-white px-2 py-0.5 text-xs font-extrabold shadow-sm">
                                                Sisa {med.stock} {med.unit}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-4 text-center text-xs text-slate-400">
                                    Semua stok obat dalam kondisi aman.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <span>Obat Terlaris</span>
                        </h3>

                        <div className="space-y-3">
                            {topSelling && topSelling.length > 0 ? (
                                topSelling.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                                                {item.medicine_name}
                                            </span>
                                        </div>
                                        <span className="font-bold text-emerald-600">
                                            {item.total_qty} Terjual
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-4 text-center text-xs text-slate-400">
                                    Belum ada data obat terjual.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
