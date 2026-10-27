import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    ChevronRight,
    CircleDollarSign,
    Clock,
    FileSpreadsheet,
    FileText,
    Package,
    Pill,
    Plus,
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
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Ringkasan Apotek
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Halo, <span className="font-bold text-slate-800">{user.name}</span>. Semua data penjualan dan stok diperbarui otomatis.
                    </p>
                </div>
            }
        >
            <Head title="Beranda Apotek Sehat" />

            {/* Quick Action Hub (Mobile First: Giant touch targets) */}
            <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* POS Quick Button for Kasir & Admin */}
                    {['admin', 'kasir'].includes(user.role) && (
                        <Link
                            href={route('pos.index')}
                            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                                    <ShoppingCart className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-base font-extrabold">Buka Kasir</div>
                                    <div className="text-xs text-emerald-100 font-medium">
                                        Mulai transaksi penjualan baru
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    )}

                    {/* Stock Management Quick Button for Operator & Admin */}
                    {['admin', 'operator'].includes(user.role) && (
                        <Link
                            href={route('medicines.index')}
                            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-teal-700 text-white shadow-sm hover:bg-teal-800 transition active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                                    <Pill className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-base font-extrabold">Kelola Stok Obat</div>
                                    <div className="text-xs text-teal-100 font-medium">
                                        Tambah & periksa persediaan
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    )}

                    {/* Reports Quick Button for Operator & Admin */}
                    {['admin', 'operator'].includes(user.role) && (
                        <Link
                            href={route('reports.index')}
                            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-800 text-white shadow-sm hover:bg-slate-900 transition active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-base font-extrabold">Laporan Penjualan</div>
                                    <div className="text-xs text-slate-300 font-medium">
                                        Cetak PDF dan unduh Excel
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    )}

                    {/* User Management Quick Button for Admin */}
                    {user.role === 'admin' && (
                        <Link
                            href={route('users.index')}
                            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition active:scale-[0.98] sm:col-span-2 lg:col-span-1"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-base font-extrabold">Kelola Staf</div>
                                    <div className="text-xs text-purple-200 font-medium">
                                        Akun Admin, Operator, Kasir
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    )}
                </div>
            </div>

            {/* KPI Metrics Cards (Large, Clean, Flat) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {/* 1. Uang Masuk Hari Ini */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {user.role === 'kasir' ? 'Penjualan Saya' : 'Penjualan Hari Ini'}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <CircleDollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                        {formatCurrency(
                            user.role === 'kasir'
                                ? stats.myTodaySalesAmount
                                : stats.todaySalesAmount,
                        )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Receipt className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                            {user.role === 'kasir'
                                ? stats.myTodaySalesCount
                                : stats.todaySalesCount}{' '}
                            Transaksi
                        </span>
                    </p>
                </div>

                {/* 2. Penjualan Bulan Ini */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Penjualan Bulan Ini
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                        {formatCurrency(stats.monthSalesAmount)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{stats.monthSalesCount} Transaksi</span>
                    </p>
                </div>

                {/* 3. Total Jenis Obat */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Semua Jenis Obat
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                            <Pill className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                        {stats.totalMedicines} Item
                    </div>
                    <p className="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        <span>Katalog aktif apotek</span>
                    </p>
                </div>

                {/* 4. Stok Kritis / Menipis */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Stok Menipis
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-amber-600 leading-tight">
                        {stats.lowStockCount} Obat
                    </div>
                    <p className="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                        <span>Perlu restock segera</span>
                    </p>
                </div>
            </div>

            {/* Low Stock Warning Box (If any drugs are low in stock) */}
            {stats.lowStockCount > 0 && ['admin', 'operator'].includes(user.role) && (
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-sm sm:text-base font-extrabold text-amber-950">
                                Perhatian: Ada {stats.lowStockCount} obat dengan stok menipis!
                            </div>
                            <div className="text-xs text-amber-800">
                                Segera lakukan penambahan stok agar pelayanan kasir tidak terganggu.
                            </div>
                        </div>
                    </div>
                    <Link
                        href={route('medicines.index', { status: 'low_stock' })}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
                    >
                        <span>Lihat & Tambah Stok</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}

            {/* 2-Column Content Section: Recent Transactions & Quick Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Recent Transactions */}
                <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                                {user.role === 'kasir'
                                    ? 'Transaksi Penjualan Terakhir Saya'
                                    : 'Transaksi Penjualan Terkini'}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Daftar struk pembelian yang baru saja selesai diproses
                            </p>
                        </div>
                        {['admin', 'kasir'].includes(user.role) && (
                            <Link
                                href={route('pos.history')}
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                            >
                                <span>Lihat Semua</span>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile Card List for small screens (< 640px) */}
                    <div className="block sm:hidden space-y-2.5">
                        {recentSales && recentSales.length > 0 ? (
                            recentSales.map((sale) => (
                                <Link
                                    key={sale.id}
                                    href={route('pos.receipt', sale.id)}
                                    className="block p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-mono text-xs font-extrabold text-emerald-700">
                                            {sale.invoice_number}
                                        </span>
                                        <span className="text-xs font-black text-slate-900">
                                            {formatCurrency(sale.total_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{sale.customer_name}</span>
                                        <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase border border-slate-200">
                                            {sale.payment_method}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="py-8 text-center text-xs text-slate-400">
                                Belum ada transaksi penjualan hari ini.
                            </div>
                        )}
                    </div>

                    {/* Desktop & Tablet Table (>= 640px) */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">No. Faktur</th>
                                    <th className="px-4 py-3">Waktu</th>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3">Metode</th>
                                    <th className="px-4 py-3 text-right">Total Belanja</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentSales && recentSales.length > 0 ? (
                                    recentSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                                                <Link
                                                    href={route('pos.receipt', sale.id)}
                                                    className="hover:underline"
                                                >
                                                    {sale.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {new Date(sale.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {sale.customer_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-600">
                                                    {sale.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-slate-900">
                                                {formatCurrency(sale.total_amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-xs text-slate-400">
                                            Belum ada transaksi hari ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right 1 Col: Low Stock List & Top Selling */}
                <div className="space-y-6">
                    {/* Low Stock List */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span>Obat Stok Menipis</span>
                            </h3>
                            {['admin', 'operator'].includes(user.role) && (
                                <Link
                                    href={route('medicines.index', { status: 'low_stock' })}
                                    className="text-xs font-bold text-emerald-700 hover:underline"
                                >
                                    Semua
                                </Link>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            {lowStockItems && lowStockItems.length > 0 ? (
                                lowStockItems.map((med) => (
                                    <div
                                        key={med.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                                    >
                                        <div className="min-w-0 flex-1 mr-2">
                                            <div className="text-xs font-bold text-slate-900 truncate">
                                                {med.name}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                Minimal: {med.min_stock} {med.unit}
                                            </div>
                                        </div>
                                        <span className="inline-flex rounded-lg bg-amber-500 px-2 py-1 text-xs font-extrabold text-white">
                                            Sisa {med.stock} {med.unit}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-4 text-center text-xs text-slate-400">
                                    Semua stok obat aman.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Selling Medicines */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                        <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            <span>Obat Paling Laris</span>
                        </h3>

                        <div className="space-y-2.5 text-xs">
                            {topSelling && topSelling.length > 0 ? (
                                topSelling.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-200 text-[10px] font-bold text-slate-700">
                                                {idx + 1}
                                            </span>
                                            <span className="font-bold text-slate-800 truncate">
                                                {item.medicine_name}
                                            </span>
                                        </div>
                                        <span className="font-black text-emerald-700 ml-2">
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
