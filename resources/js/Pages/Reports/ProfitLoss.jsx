import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Award,
    Calendar,
    CircleDollarSign,
    DollarSign,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Package,
    Receipt,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

export default function ProfitLoss({ title, filters = {}, statement = {} }) {
    const [period, setPeriod] = useState(filters.period || 'monthly');
    const [date, setDate] = useState(filters.date || new Date().toISOString().slice(0, 10));
    const [month, setMonth] = useState(filters.month || new Date().toISOString().slice(0, 7));
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleApplyFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('reports.profit-loss'),
            {
                period,
                date: period === 'daily' ? date : undefined,
                month: period === 'monthly' ? month : undefined,
                start_date: period === 'custom' ? startDate : undefined,
                end_date: period === 'custom' ? endDate : undefined,
            },
            { preserveState: true }
        );
    };

    const handleResetFilter = () => {
        setPeriod('monthly');
        setDate(new Date().toISOString().slice(0, 10));
        setMonth(new Date().toISOString().slice(0, 7));
        setStartDate('');
        setEndDate('');
        router.get(route('reports.profit-loss'));
    };

    const getExportUrl = (type) => {
        const params = new URLSearchParams();
        params.append('period', period);
        if (period === 'daily') params.append('date', date);
        if (period === 'monthly') params.append('month', month);
        if (period === 'custom') {
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
        }
        return route(`reports.profit-loss.export.${type}`) + '?' + params.toString();
    };

    const {
        totalTransactions = 0,
        totalQtySold = 0,
        grossSales = 0,
        totalDiscount = 0,
        netSales = 0,
        cogs = 0,
        grossProfit = 0,
        grossProfitMargin = 0,
        otherIncome = 0,
        totalOpex = 0,
        opexDetails = [],
        inventoryPurchases = 0,
        totalRevenue = 0,
        netOperatingProfit = 0,
        netProfitMargin = 0,
        topMedicines = [],
        categoryBreakdown = [],
    } = statement;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-slate-800">
                            Laporan Laba Rugi Apotek
                        </h2>
                        <p className="text-xs text-slate-500">
                            Analisis pendapatan bersih, harga pokok penjualan (HPP), beban operasional, dan laba bersih.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={getExportUrl('pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
                        >
                            <FileText className="h-4 w-4" />
                            <span>Ekspor PDF</span>
                        </a>
                        <a
                            href={getExportUrl('excel')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-2 text-xs font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Ekspor Excel (CSV)</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Laba Rugi & HPP" />

            <div className="space-y-6">
                {/* 1. Module Navigation Tabs */}
                <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-xl shadow-sm">
                    <Link
                        href={route('reports.index')}
                        className="border-b-2 border-transparent px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                    >
                        Laporan Transaksi Penjualan
                    </Link>
                    <Link
                        href={route('reports.profit-loss')}
                        className="border-b-2 border-red-600 px-4 py-2.5 text-xs font-bold text-red-700 transition"
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

                {/* 2. Filter Bar */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <form onSubmit={handleApplyFilter} className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                                <Filter className="h-4 w-4 text-red-600" />
                                <span>Periode Perhitungan Laba Rugi</span>
                            </div>
                            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => setPeriod('monthly')}
                                    className={`rounded-md px-3 py-1 transition ${
                                        period === 'monthly'
                                            ? 'bg-white font-bold text-red-700 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Bulanan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPeriod('daily')}
                                    className={`rounded-md px-3 py-1 transition ${
                                        period === 'daily'
                                            ? 'bg-white font-bold text-red-700 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Harian
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPeriod('custom')}
                                    className={`rounded-md px-3 py-1 transition ${
                                        period === 'custom'
                                            ? 'bg-white font-bold text-red-700 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Rentang Tanggal
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {period === 'daily' && (
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Pilih Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-red-500 focus:ring-red-500"
                                    />
                                </div>
                            )}

                            {period === 'monthly' && (
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Pilih Bulan
                                    </label>
                                    <input
                                        type="month"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-red-500 focus:ring-red-500"
                                    />
                                </div>
                            )}

                            {period === 'custom' && (
                                <>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-red-500 focus:ring-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Tanggal Akhir
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-red-500 focus:ring-red-500"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
                                >
                                    Terapkan Filter
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    title="Reset Filter"
                                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* 3. Stat Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Pendapatan Penjualan */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Pendapatan Penjualan Bersih
                            </span>
                            <div className="rounded-lg bg-green-50 p-2 text-green-600">
                                <CircleDollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-xl font-black text-slate-900">
                                {formatCurrency(netSales)}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-500">
                                {totalTransactions} Transaksi • {formatCurrency(grossSales)} kotor
                            </div>
                        </div>
                    </div>

                    {/* Card 2: HPP (Modal Obat Terjual) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                HPP (Modal Obat Terjual)
                            </span>
                            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                                <Package className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-xl font-black text-amber-700">
                                {formatCurrency(cogs)}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-500">
                                Biaya perolehan {totalQtySold} unit obat terjual
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Laba Kotor */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Laba Kotor (Gross Profit)
                            </span>
                            <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-xl font-black text-sky-700">
                                {formatCurrency(grossProfit)}
                            </div>
                            <div className="mt-1 text-[11px] font-bold text-sky-600">
                                Margin Laba Kotor: {grossProfitMargin}%
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Laba Bersih */}
                    <div
                        className={`rounded-xl border p-4 shadow-sm ${
                            netOperatingProfit >= 0
                                ? 'border-green-200 bg-green-50/50'
                                : 'border-rose-200 bg-rose-50/50'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Laba Operasional Bersih
                            </span>
                            <div
                                className={`rounded-lg p-2 ${
                                    netOperatingProfit >= 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-rose-100 text-rose-700'
                                }`}
                            >
                                <Award className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div
                                className={`text-xl font-black ${
                                    netOperatingProfit >= 0 ? 'text-green-800' : 'text-rose-700'
                                }`}
                            >
                                {formatCurrency(netOperatingProfit)}
                            </div>
                            <div className="mt-1 text-[11px] font-bold text-green-700">
                                Margin Laba Bersih: {netProfitMargin}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Comprehensive Income Statement Table */}
                <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs mb-6">
                    <div className="border-b border-slate-200/80 px-5 py-4 bg-slate-50/90">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                            Laporan Laba Rugi Komprehensif (Income Statement)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Format standar pembukuan akuntansi farmasi apotek.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {/* I. PENDAPATAN OPERASIONAL */}
                                <tr className="bg-slate-100/70 font-bold text-slate-800">
                                    <td className="px-4 py-2.5" colSpan={2}>
                                        I. PENDAPATAN OPERASIONAL APOTEK
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 pl-8 text-slate-600">
                                        Penjualan Kotor Obat & Alkes (Gross Sales)
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium text-slate-900">
                                        {formatCurrency(grossSales)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 pl-8 text-slate-600">
                                        Potongan & Diskon Penjualan Obat
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium text-rose-600">
                                        ({formatCurrency(totalDiscount)})
                                    </td>
                                </tr>
                                <tr className="bg-slate-50 font-bold text-slate-800">
                                    <td className="px-4 py-2 pl-6">
                                        TOTAL PENDAPATAN PENJUALAN BERSIH
                                    </td>
                                    <td className="px-4 py-2 text-right text-green-700">
                                        {formatCurrency(netSales)}
                                    </td>
                                </tr>
                                {otherIncome > 0 && (
                                    <>
                                        <tr>
                                            <td className="px-4 py-2 pl-8 text-slate-600">
                                                Pendapatan Operasional Lainnya (Jasa Racik / Layanan Medis)
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium text-slate-900">
                                                {formatCurrency(otherIncome)}
                                            </td>
                                        </tr>
                                        <tr className="bg-slate-50 font-bold text-slate-800">
                                            <td className="px-4 py-2 pl-6">
                                                TOTAL SELURUH PENDAPATAN
                                            </td>
                                            <td className="px-4 py-2 text-right text-green-700">
                                                {formatCurrency(totalRevenue)}
                                            </td>
                                        </tr>
                                    </>
                                )}

                                {/* II. HARGA POKOK PENJUALAN */}
                                <tr className="bg-slate-100/70 font-bold text-slate-800">
                                    <td className="px-4 py-2.5" colSpan={2}>
                                        II. HARGA POKOK PENJUALAN (HPP / COGS)
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 pl-8 text-slate-600">
                                        Beban Pokok Obat Terjual (Modal Pembelian Obat dari Distributor)
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium text-amber-700">
                                        ({formatCurrency(cogs)})
                                    </td>
                                </tr>
                                <tr className="bg-sky-50 font-black text-sky-900">
                                    <td className="px-4 py-2.5 pl-6 flex items-center justify-between">
                                        <span>LABA KOTOR (GROSS PROFIT)</span>
                                        <span className="rounded bg-sky-200 px-2 py-0.5 text-[10px] text-sky-800 font-bold">
                                            Margin: {grossProfitMargin}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right text-sky-800 text-sm">
                                        {formatCurrency(grossProfit)}
                                    </td>
                                </tr>

                                {/* III. BEBAN OPERASIONAL */}
                                <tr className="bg-slate-100/70 font-bold text-slate-800">
                                    <td className="px-4 py-2.5" colSpan={2}>
                                        III. BEBAN OPERASIONAL (OPERATING EXPENSES / OPEX)
                                    </td>
                                </tr>
                                {opexDetails.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-2 pl-8 text-slate-400 italic">
                                            Tidak ada beban operasional tercatat pada periode ini.
                                        </td>
                                        <td className="px-4 py-2 text-right text-slate-400">
                                            Rp 0
                                        </td>
                                    </tr>
                                ) : (
                                    opexDetails.map((item) => (
                                        <tr key={item.category}>
                                            <td className="px-4 py-2 pl-8 text-slate-600">
                                                Beban {item.label}
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium text-rose-600">
                                                ({formatCurrency(item.amount)})
                                            </td>
                                        </tr>
                                    ))
                                )}
                                <tr className="bg-slate-50 font-bold text-slate-800">
                                    <td className="px-4 py-2 pl-6">
                                        TOTAL BEBAN OPERASIONAL
                                    </td>
                                    <td className="px-4 py-2 text-right text-rose-600">
                                        ({formatCurrency(totalOpex)})
                                    </td>
                                </tr>

                                {/* IV. LABA BERSIH */}
                                <tr
                                    className={`font-black text-sm border-t-2 ${
                                        netOperatingProfit >= 0
                                            ? 'bg-green-100/60 border-green-500 text-green-900'
                                            : 'bg-rose-100/60 border-rose-500 text-rose-900'
                                    }`}
                                >
                                    <td className="px-4 py-3 flex items-center justify-between">
                                        <span>LABA OPERASIONAL BERSIH (NET INCOME)</span>
                                        <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-slate-800 border shadow-sm">
                                            Net Margin: {netProfitMargin}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {formatCurrency(netOperatingProfit)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Additional Insights: Top 5 Margin Drivers & Category Profits */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Top 5 Medicines */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-green-600" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Top 5 Obat Penyumbang Laba Terbesar
                                </h4>
                            </div>
                        </div>

                        {topMedicines.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                                Belum ada data penjualan pada periode ini.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topMedicines.map((med, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-[11px] font-black text-green-800">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">
                                                    {med.medicine_name}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    Terjual {med.qty_sold} unit • Omset {formatCurrency(med.revenue)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-green-600">
                                                +{formatCurrency(med.profit)}
                                            </div>
                                            <div className="text-[10px] font-bold text-sky-600">
                                                Margin {med.margin}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Breakdown by Category */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-sky-600" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Laba Kotor Berdasarkan Kategori Obat
                                </h4>
                            </div>
                        </div>

                        {categoryBreakdown.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                                Belum ada data penjualan pada periode ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                                <table className="min-w-full text-left text-xs">
                                    <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                                        <tr>
                                            <th className="px-4 py-3">Kategori</th>
                                            <th className="px-3 py-3 text-center">Unit</th>
                                            <th className="px-3 py-3 text-right">Omset</th>
                                            <th className="px-3 py-3 text-right">Laba Kotor</th>
                                            <th className="px-3 py-3 text-right">Margin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {categoryBreakdown.map((cat, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-4 py-2.5 font-bold text-slate-900">
                                                    {cat.category_name}
                                                </td>
                                                <td className="py-2 text-center text-slate-600">
                                                    {cat.qty_sold}
                                                </td>
                                                <td className="py-2 text-right text-slate-600">
                                                    {formatCurrency(cat.revenue)}
                                                </td>
                                                <td className="py-2 text-right font-bold text-green-600">
                                                    {formatCurrency(cat.profit)}
                                                </td>
                                                <td className="py-2 text-right font-bold text-sky-600">
                                                    {cat.margin}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
