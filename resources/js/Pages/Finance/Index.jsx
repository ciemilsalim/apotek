import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    DollarSign,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Plus,
    Receipt,
    RefreshCw,
    Search,
    ShoppingCart,
    Trash2,
    TrendingDown,
    TrendingUp,
    Wallet,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function FinanceIndex({
    title,
    transactions,
    filters = {},
    summary = {},
    categories = {},
}) {
    const { auth } = usePage().props;
    const isAdmin = auth.user.role === 'admin';

    // Filter states
    const [period, setPeriod] = useState(filters.period || 'monthly');
    const [date, setDate] = useState(filters.date || new Date().toISOString().slice(0, 10));
    const [month, setMonth] = useState(filters.month || new Date().toISOString().slice(0, 7));
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteTransaction, setDeleteTransaction] = useState(null);

    // Create Transaction Form
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'expense',
        category: 'pembelian_obat',
        amount: '',
        payment_method: 'cash',
        transaction_date: new Date().toISOString().slice(0, 10),
        reference_number: '',
        description: '',
    });

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
            route('finance.index'),
            {
                period,
                date: period === 'daily' ? date : undefined,
                month: period === 'monthly' ? month : undefined,
                start_date: period === 'custom' ? startDate : undefined,
                end_date: period === 'custom' ? endDate : undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
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
        setTypeFilter('all');
        setCategoryFilter('all');
        router.get(route('finance.index'));
    };

    const handleTypeChange = (newType) => {
        const availableCategories = Object.keys(categories[newType] || {});
        setData((prev) => ({
            ...prev,
            type: newType,
            category: availableCategories[0] || '',
        }));
    };

    const handleSubmitTransaction = (e) => {
        e.preventDefault();
        post(route('finance.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTransaction) return;
        router.delete(route('finance.destroy', deleteTransaction.id), {
            onSuccess: () => setDeleteTransaction(null),
        });
    };

    // Calculate export URLs with current active filters
    const getExportUrl = (exportType) => {
        const params = new URLSearchParams();
        params.append('period', period);
        if (period === 'daily') params.append('date', date);
        if (period === 'monthly') params.append('month', month);
        if (period === 'custom') {
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
        }
        return route(`finance.export.${exportType}`) + '?' + params.toString();
    };

    const expenseCategoryMap = categories.expense || {};
    const totalExpenses = summary.totalExpense || 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-slate-800">
                            Buku Kas & Manajemen Keuangan
                        </h2>
                        <p className="text-xs text-slate-500">
                            Pantau arus kas masuk, pengeluaran operasional apotek, dan rekapitulasi keuangan.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Catat Kas Baru</span>
                        </button>
                        <a
                            href={getExportUrl('pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
                        >
                            <FileText className="h-4 w-4" />
                            <span>PDF</span>
                        </a>
                        <a
                            href={getExportUrl('excel')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Excel (CSV)</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Keuangan & Arus Kas" />

            <div className="space-y-6">
                {/* Module Navigation Tabs */}
                <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-xl shadow-sm">
                    <Link
                        href={route('reports.index')}
                        className="border-b-2 border-transparent px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
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
                        className="border-b-2 border-emerald-600 px-4 py-2.5 text-xs font-bold text-emerald-700 transition"
                    >
                        Buku Kas & Arus Kas
                    </Link>
                </div>

                {/* 1. Filter Bar */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <form onSubmit={handleApplyFilter} className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                                <Filter className="h-4 w-4 text-emerald-600" />
                                <span>Filter Periode Buku Kas</span>
                            </div>
                            {/* Period Switcher */}
                            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => setPeriod('monthly')}
                                    className={`rounded-md px-3 py-1 transition ${
                                        period === 'monthly'
                                            ? 'bg-white font-bold text-emerald-700 shadow-sm'
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
                                            ? 'bg-white font-bold text-emerald-700 shadow-sm'
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
                                            ? 'bg-white font-bold text-emerald-700 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Rentang Tanggal
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                            {period === 'daily' && (
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Pilih Hari
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                                        className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                                            className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                                            className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Jenis Transaksi
                                </label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                >
                                    <option value="all">Semua Jenis (Masuk & Keluar)</option>
                                    <option value="income">Hanya Pemasukan</option>
                                    <option value="expense">Hanya Pengeluaran</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700"
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

                {/* 2. Key Metrics Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Penjualan POS */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Penjualan Apotek (POS)
                            </span>
                            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-xl font-black text-slate-900">
                                {formatCurrency(summary.totalSales)}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                                <span>Tunai: <strong className="text-slate-700">{formatCurrency(summary.salesCash)}</strong></span>
                                <span>•</span>
                                <span>Non-Tunai: <strong className="text-slate-700">{formatCurrency(summary.salesNonCash)}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Pemasukan Kas Lain */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Pemasukan Kas Lain
                            </span>
                            <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
                                <ArrowDownLeft className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-xl font-black text-teal-700">
                                {formatCurrency(summary.totalOtherIncome)}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-500">
                                Modal Awal, Layanan & Refund PBF
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Total Pengeluaran */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Pengeluaran
                            </span>
                            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-xl font-black text-rose-600">
                                {formatCurrency(summary.totalExpense)}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-500">
                                Kulakan Obat PBF & Biaya Operasional
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Saldo Arus Kas Bersih */}
                    <div
                        className={`rounded-xl border p-4 shadow-sm ${
                            summary.netCashFlow >= 0
                                ? 'border-sky-200 bg-sky-50/50'
                                : 'border-rose-200 bg-rose-50/50'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Arus Kas Bersih (Surplus)
                            </span>
                            <div
                                className={`rounded-lg p-2 ${
                                    summary.netCashFlow >= 0
                                        ? 'bg-sky-100 text-sky-700'
                                        : 'bg-rose-100 text-rose-700'
                                }`}
                            >
                                <Wallet className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div
                                className={`text-xl font-black ${
                                    summary.netCashFlow >= 0 ? 'text-sky-800' : 'text-rose-700'
                                }`}
                            >
                                {formatCurrency(summary.netCashFlow)}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-600 font-medium">
                                Total Pemasukan ({formatCurrency(summary.totalIncome)}) - Pengeluaran
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Expense Category Breakdown (If any expense exists) */}
                {totalExpenses > 0 && summary.expensesByCategory && Object.keys(summary.expensesByCategory).length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Distribusi Pengeluaran Berdasarkan Kategori
                            </h3>
                            <span className="text-xs text-slate-500">
                                Total: <strong>{formatCurrency(totalExpenses)}</strong>
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {Object.entries(summary.expensesByCategory).map(([catKey, catTotal]) => {
                                const catLabel = expenseCategoryMap[catKey] || catKey;
                                const percentage = totalExpenses > 0 ? Math.round((catTotal / totalExpenses) * 100) : 0;
                                return (
                                    <div
                                        key={catKey}
                                        className="rounded-lg border border-slate-100 bg-slate-50/70 p-3"
                                    >
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-700 truncate" title={catLabel}>
                                                {catLabel}
                                            </span>
                                            <span className="font-bold text-slate-900 ml-2">{percentage}%</span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-rose-500 transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="mt-1 text-right text-[11px] font-bold text-rose-600">
                                            {formatCurrency(catTotal)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 4. Transactions List (Mobile Card + Desktop Table) */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-emerald-600" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Catatan Transaksi Arus Kas Operasional
                            </h3>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                {transactions.total} Catatan
                            </span>
                        </div>
                    </div>

                    {/* Mobile Card List */}
                    <div className="divide-y divide-slate-100 md:hidden">
                        {transactions.data.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Receipt className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                                <p className="text-sm font-semibold">Belum ada catatan kas untuk periode ini</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Klik tombol "+ Catat Kas Baru" untuk memasukkan transaksi pengeluaran atau pemasukan.
                                </p>
                            </div>
                        ) : (
                            transactions.data.map((trx) => (
                                <div
                                    key={trx.id}
                                    className={`p-4 border-l-4 ${
                                        trx.type === 'income' ? 'border-l-emerald-500' : 'border-l-rose-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-slate-700">
                                            {trx.transaction_number}
                                        </span>
                                        <span
                                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                                trx.type === 'income'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                            }`}
                                        >
                                            {trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-baseline justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-slate-900">
                                                {trx.category_label}
                                            </div>
                                            {trx.description && (
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {trx.description}
                                                </div>
                                            )}
                                            {trx.reference_number && (
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                    Ref/Nota: {trx.reference_number}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className={`text-sm font-black ${
                                                trx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}
                                        >
                                            {trx.type === 'income' ? '+' : '-'} {formatCurrency(trx.amount)}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <span>{trx.transaction_date}</span>
                                            <span>•</span>
                                            <span className="uppercase font-semibold text-slate-600">
                                                {trx.payment_method}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>Oleh: {trx.user?.name || '-'}</span>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setDeleteTransaction(trx)}
                                                    className="rounded p-1 text-rose-600 hover:bg-rose-50"
                                                    title="Hapus Transaksi"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Standardized Unified Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                            <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                                <tr>
                                    <th className="px-5 py-3.5">No. Transaksi</th>
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5">Jenis</th>
                                    <th className="px-5 py-3.5">Kategori</th>
                                    <th className="px-5 py-3.5">Keterangan & Ref</th>
                                    <th className="px-5 py-3.5 text-right">Nominal (Rp)</th>
                                    <th className="px-5 py-3.5 text-center">Metode</th>
                                    <th className="px-5 py-3.5">Petugas</th>
                                    {isAdmin && <th className="px-5 py-3.5 text-center">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={isAdmin ? 9 : 8}
                                            className="px-4 py-10 text-center text-slate-400"
                                        >
                                            <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                            Belum ada catatan kas untuk periode yang dipilih.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50/70 transition">
                                            <td className="px-4 py-3 font-mono font-bold text-slate-700">
                                                {trx.transaction_number}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                                {trx.transaction_date}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                        trx.type === 'income'
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                    }`}
                                                >
                                                    {trx.type === 'income' ? (
                                                        <ArrowDownLeft className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    )}
                                                    <span>{trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                {trx.category_label}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 max-w-xs">
                                                <div>{trx.description || '-'}</div>
                                                {trx.reference_number && (
                                                    <div className="text-[10px] font-mono text-slate-400">
                                                        No. Ref/Nota: {trx.reference_number}
                                                    </div>
                                                )}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right font-black whitespace-nowrap ${
                                                    trx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                                }`}
                                            >
                                                {trx.type === 'income' ? '+' : '-'} {formatCurrency(trx.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                                    {trx.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                                {trx.user?.name || '-'}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => setDeleteTransaction(trx)}
                                                        className="rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                        title="Hapus Transaksi"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
                            <div className="text-xs text-slate-500">
                                Menampilkan {transactions.from || 0} - {transactions.to || 0} dari {transactions.total} data
                            </div>
                            <div className="flex items-center gap-1">
                                {transactions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-emerald-600 font-bold text-white'
                                                : !link.url
                                                ? 'cursor-not-allowed text-slate-300'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Catat Transaksi Kas Baru */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="lg">
                <form onSubmit={handleSubmitTransaction} className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Catat Transaksi Kas Baru
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Masukkan pengeluaran operasional atau penerimaan kas apotek.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {/* Type Toggle: Pengeluaran vs Pemasukan */}
                        <div>
                            <InputLabel value="Jenis Transaksi Kas *" />
                            <div className="mt-1 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('expense')}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-bold transition ${
                                        data.type === 'expense'
                                            ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <ArrowUpRight className="h-4 w-4 text-rose-600" />
                                    <span>PENGELUARAN (KAS KELUAR)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('income')}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-bold transition ${
                                        data.type === 'income'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                                    <span>PEMASUKAN (KAS MASUK)</span>
                                </button>
                            </div>
                            <InputError message={errors.type} className="mt-1" />
                        </div>

                        {/* Kategori */}
                        <div>
                            <InputLabel htmlFor="category" value="Kategori Transaksi *" />
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                {Object.entries(categories[data.type] || {}).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} className="mt-1" />
                        </div>

                        {/* Nominal & Tanggal in 2 cols */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="amount" value="Nominal Transaksi (Rp) *" />
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-500">
                                        Rp
                                    </span>
                                    <input
                                        id="amount"
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="0"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="block w-full rounded-lg border-slate-300 pl-9 text-xs font-bold text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                {data.amount > 0 && (
                                    <div className="mt-1 text-[11px] font-semibold text-emerald-600">
                                        Terbilang: {formatCurrency(data.amount)}
                                    </div>
                                )}
                                <InputError message={errors.amount} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="transaction_date" value="Tanggal Transaksi *" />
                                <input
                                    id="transaction_date"
                                    type="date"
                                    value={data.transaction_date}
                                    onChange={(e) => setData('transaction_date', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-slate-300 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                                <InputError message={errors.transaction_date} className="mt-1" />
                            </div>
                        </div>

                        {/* Metode Pembayaran & No. Referensi */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="payment_method" value="Metode Pembayaran *" />
                                <select
                                    id="payment_method"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-slate-300 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                >
                                    <option value="cash">Tunai (Kas Kasir / Laci Kas)</option>
                                    <option value="transfer">Transfer Bank Apotek</option>
                                    <option value="qris">QRIS / Non-Tunai</option>
                                </select>
                                <InputError message={errors.payment_method} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="reference_number" value="No. Referensi / No. Faktur (Opsional)" />
                                <TextInput
                                    id="reference_number"
                                    type="text"
                                    placeholder="Contoh: INV-PBF-9821, Nota #12"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                />
                                <InputError message={errors.reference_number} className="mt-1" />
                            </div>
                        </div>

                        {/* Keterangan */}
                        <div>
                            <InputLabel htmlFor="description" value="Keterangan / Keperluan (Opsional)" />
                            <textarea
                                id="description"
                                rows="2"
                                placeholder="Tuliskan catatan rincian transaksi..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
                            {processing ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Konfirmasi Hapus Transaksi (Admin only) */}
            <Modal show={!!deleteTransaction} onClose={() => setDeleteTransaction(null)} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-rose-600">
                        <div className="rounded-full bg-rose-100 p-2">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Hapus Transaksi Keuangan?
                            </h3>
                            <p className="text-xs text-slate-500">
                                Tindakan ini hanya dapat dilakukan oleh Administrator.
                            </p>
                        </div>
                    </div>

                    {deleteTransaction && (
                        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs space-y-1">
                            <div>No: <strong>{deleteTransaction.transaction_number}</strong></div>
                            <div>Kategori: <strong>{deleteTransaction.category_label}</strong></div>
                            <div>
                                Nominal:{' '}
                                <strong className="text-rose-600">
                                    {formatCurrency(deleteTransaction.amount)}
                                </strong>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton onClick={() => setDeleteTransaction(null)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            Ya, Hapus Transaksi
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
