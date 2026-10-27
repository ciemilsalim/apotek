import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CircleDollarSign,
    FileSpreadsheet,
    FileText,
    Package,
    Receipt,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

export default function ReportsIndex({ title, sales, filters, summary }) {
    const [period, setPeriod] = useState(filters.period || 'daily');
    const [date, setDate] = useState(filters.date || '');
    const [month, setMonth] = useState(filters.month || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(
            route('reports.index'),
            {
                period,
                date: period === 'daily' ? date : undefined,
                month: period === 'monthly' ? month : undefined,
                start_date: period === 'custom' ? startDate : undefined,
                end_date: period === 'custom' ? endDate : undefined,
            },
            { preserveState: true },
        );
    };

    const handleQuickPeriod = (newPeriod) => {
        setPeriod(newPeriod);
        router.get(
            route('reports.index'),
            {
                period: newPeriod,
                date: newPeriod === 'daily' ? date : undefined,
                month: newPeriod === 'monthly' ? month : undefined,
            },
            { preserveState: true },
        );
    };

    const getExportUrl = (type) => {
        const params = new URLSearchParams();
        params.append('period', period);
        if (period === 'daily' && date) params.append('date', date);
        if (period === 'monthly' && month) params.append('month', month);
        if (period === 'custom') {
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
        }
        return route(`reports.export.${type}`) + '?' + params.toString();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Laporan Penjualan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Rekap hasil penjualan harian dan bulanan apotek
                        </p>
                    </div>

                    {/* Big 1-Tap Export Buttons */}
                    <div className="flex items-center gap-2">
                        <a
                            href={getExportUrl('pdf')}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-xs hover:bg-rose-700 transition"
                        >
                            <FileText className="h-4 w-4" />
                            <span>Cetak PDF</span>
                        </a>
                        <a
                            href={getExportUrl('excel')}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-xs hover:bg-emerald-700 transition"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Unduh Excel</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Penjualan - Apotek Sehat" />

            {/* Top Module Navigation Bar */}
            <div className="mb-4 flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-xl shadow-xs">
                <Link
                    href={route('reports.index')}
                    className="border-b-2 border-emerald-600 px-4 py-2.5 text-xs font-bold text-emerald-700 transition"
                >
                    Laporan Transaksi Penjualan
                </Link>
                <Link
                    href={route('reports.profit-loss')}
                    className="border-b-2 border-transparent px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                    Laporan Laba Rugi & HPP
                </Link>
                <Link
                    href={route('finance.index')}
                    className="border-b-2 border-transparent px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                    Buku Kas & Arus Kas
                </Link>
            </div>

            {/* Quick Period Selector Tabs */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                    { id: 'daily', label: 'Laporan Hari Ini' },
                    { id: 'monthly', label: 'Laporan Bulan Ini' },
                    { id: 'custom', label: 'Rentang Tanggal Khusus' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleQuickPeriod(tab.id)}
                        className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-extrabold border-2 transition ${
                            period === tab.id
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Date Picker Form Bar */}
            <div className="mb-6 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
                <form
                    onSubmit={handleFilterSubmit}
                    className="flex flex-col sm:flex-row items-center gap-3"
                >
                    {period === 'daily' && (
                        <div className="w-full sm:w-64">
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Pilih Tanggal Penjualan
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                            />
                        </div>
                    )}

                    {period === 'monthly' && (
                        <div className="w-full sm:w-64">
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Pilih Bulan & Tahun
                            </label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                            />
                        </div>
                    )}

                    {period === 'custom' && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Dari Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Sampai Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full sm:w-auto mt-2 sm:mt-5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                    >
                        Terapkan
                    </button>
                </form>
            </div>

            {/* Title Notice */}
            <div className="mb-3 text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span>{title}</span>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        Total Penjualan (Omset)
                    </span>
                    <div className="mt-1 text-lg sm:text-2xl font-black text-emerald-700">
                        {formatCurrency(summary.totalRevenue)}
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        Estimasi Untung Bersih
                    </span>
                    <div className="mt-1 text-lg sm:text-2xl font-black text-teal-700">
                        {formatCurrency(summary.grossProfit)}
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        Jumlah Transaksi
                    </span>
                    <div className="mt-1 text-lg sm:text-2xl font-black text-slate-900">
                        {summary.totalTransactions} Faktur
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        Obat Terjual
                    </span>
                    <div className="mt-1 text-lg sm:text-2xl font-black text-slate-900">
                        {summary.totalItemsSold} Unit
                    </div>
                </div>
            </div>

            {/* Mobile View: Cards (< 768px) */}
            <div className="block md:hidden space-y-3 mb-6">
                {sales.data && sales.data.length > 0 ? (
                    sales.data.map((sale) => (
                        <div
                            key={sale.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-mono text-xs font-black text-emerald-700">
                                        {sale.invoice_number}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Kasir: {sale.user?.name || '-'} • Pembeli: {sale.customer_name}
                                    </div>
                                </div>
                                <span className="font-black text-sm text-slate-900">
                                    {formatCurrency(sale.total_amount)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
                                <span>{new Date(sale.created_at).toLocaleString('id-ID')}</span>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase">
                                    {sale.payment_method}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        Tidak ada transaksi penjualan pada periode ini.
                    </div>
                )}
            </div>

            {/* Standardized Unified Table (>= 768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-5 py-3.5">No. Faktur</th>
                                <th className="px-5 py-3.5">Waktu</th>
                                <th className="px-5 py-3.5">Kasir</th>
                                <th className="px-5 py-3.5">Pelanggan</th>
                                <th className="px-5 py-3.5 text-center">Metode</th>
                                <th className="px-5 py-3.5 text-center">Item</th>
                                <th className="px-5 py-3.5 text-right">Total Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {sales.data && sales.data.length > 0 ? (
                                sales.data.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 transition">
                                        <td className="px-5 py-4 font-mono font-bold text-emerald-700">
                                            {sale.invoice_number}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">
                                            {new Date(sale.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {sale.user?.name || '-'}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {sale.customer_name}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center font-bold">
                                            {sale.items?.reduce((s, i) => s + i.quantity, 0) || 0}
                                        </td>
                                        <td className="px-5 py-4 text-right font-black text-sm text-slate-900">
                                            {formatCurrency(sale.total_amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-xs text-slate-400">
                                        Tidak ada transaksi penjualan pada periode ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {sales.links && sales.links.length > 3 && (
                <div className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4 text-xs">
                    <div className="text-slate-500 font-medium">
                        Total {sales.total} faktur transaksi
                    </div>
                    <div className="flex gap-1">
                        {sales.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-xl px-3 py-1.5 font-bold ${
                                    link.active
                                        ? 'bg-emerald-600 text-white'
                                        : link.url
                                        ? 'text-slate-700 hover:bg-slate-100'
                                        : 'text-slate-300 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
