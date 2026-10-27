import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    ChevronRight,
    CircleDollarSign,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Package,
    PieChart,
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
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Laporan Penjualan Farmasi
                        </h1>
                        <p className="text-xs text-slate-500">
                            Analisis pendapatan harian & bulanan serta ekspor PDF dan Excel
                        </p>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex items-center gap-2">
                        <a
                            href={getExportUrl('pdf')}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                        >
                            <FileText className="h-4 w-4" />
                            <span>Ekspor PDF</span>
                        </a>
                        <a
                            href={getExportUrl('excel')}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Ekspor Excel (CSV)</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Penjualan - Apotek Sehat" />

            {/* Filter Card */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <form
                    onSubmit={handleFilterSubmit}
                    className="flex flex-col lg:flex-row items-end gap-3"
                >
                    {/* Period Tabs */}
                    <div className="w-full lg:w-auto">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase">
                            Rentang Laporan
                        </label>
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            {[
                                { id: 'daily', label: 'Harian' },
                                { id: 'monthly', label: 'Bulanan' },
                                { id: 'custom', label: 'Kustom' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setPeriod(tab.id)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                        period === tab.id
                                            ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inputs depending on period */}
                    {period === 'daily' && (
                        <div className="w-full sm:w-56">
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase">
                                Pilih Tanggal
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            />
                        </div>
                    )}

                    {period === 'monthly' && (
                        <div className="w-full sm:w-56">
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase">
                                Pilih Bulan & Tahun
                            </label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            />
                        </div>
                    )}

                    {period === 'custom' && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase">
                                    Dari Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase">
                                    Sampai Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        Tampilkan Laporan
                    </button>
                </form>
            </div>

            {/* Active Report Header Notice */}
            <div className="mb-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>{title}</span>
                </div>
            </div>

            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                {/* Total Revenue */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Pendapatan
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CircleDollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(summary.totalRevenue)}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Omset kotor setelah potongan diskon
                        </p>
                    </div>
                </div>

                {/* Gross Profit */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Estimasi Laba Kotor
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(summary.grossProfit)}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Selisih harga jual dan harga pokok obat
                        </p>
                    </div>
                </div>

                {/* Total Transactions */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Jumlah Transaksi
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                            <Receipt className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {summary.totalTransactions} Faktur
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Pelanggan selesai dilayani
                        </p>
                    </div>
                </div>

                {/* Total Units Sold */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Obat Terjual (Unit)
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {summary.totalItemsSold} Unit
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Kuantitas total obat keluar
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Daftar Rincian Transaksi Penjualan
                    </h3>
                    <div className="text-xs text-slate-500">
                        Total {summary.totalTransactions} transaksi ditemukan
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/75 font-semibold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-5 py-3.5">No. Faktur</th>
                                <th className="px-5 py-3.5">Waktu</th>
                                <th className="px-5 py-3.5">Kasir</th>
                                <th className="px-5 py-3.5">Pelanggan</th>
                                <th className="px-5 py-3.5 text-center">Metode</th>
                                <th className="px-5 py-3.5 text-center">Kuantitas</th>
                                <th className="px-5 py-3.5 text-right">Subtotal</th>
                                <th className="px-5 py-3.5 text-right">Diskon</th>
                                <th className="px-5 py-3.5 text-right">Total Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {sales.data && sales.data.length > 0 ? (
                                sales.data.map((sale) => (
                                    <tr
                                        key={sale.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                                    >
                                        <td className="px-5 py-3.5 font-mono font-bold text-emerald-600">
                                            {sale.invoice_number}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                                            {new Date(sale.created_at).toLocaleString('id-ID', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                                            {sale.user?.name || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                                            {sale.customer_name}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-bold">
                                            {sale.items?.reduce((s, i) => s + i.quantity, 0) || 0}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-slate-500">
                                            {formatCurrency(sale.subtotal)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-rose-500">
                                            {sale.discount > 0 ? `-${formatCurrency(sale.discount)}` : '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">
                                            {formatCurrency(sale.total_amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="py-12 text-center text-xs text-slate-400"
                                    >
                                        Tidak ada catatan transaksi penjualan pada periode laporan ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {sales.links && sales.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs dark:border-slate-800">
                        <div className="text-slate-500">
                            Menampilkan {sales.from || 0} - {sales.to || 0} dari{' '}
                            {sales.total} transaksi
                        </div>
                        <div className="flex gap-1">
                            {sales.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-lg px-2.5 py-1 ${
                                        link.active
                                            ? 'bg-emerald-600 text-white font-bold'
                                            : link.url
                                            ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                            : 'text-slate-300 cursor-not-allowed dark:text-slate-700'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
