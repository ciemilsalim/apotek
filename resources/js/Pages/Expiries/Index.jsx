import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
    Boxes,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    PackageX,
    Pill,
    RefreshCw,
    Search,
    ShieldAlert,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function ExpiryIndex({ batches, stats, filters = {}, categories = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
    const [quarantineModalOpen, setQuarantineModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

    const quarantineForm = useForm({
        reason: 'retur_pbf',
        notes: '',
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('expiries.index'),
            {
                status: activeTab,
                search: search || undefined,
                category_id: categoryId || undefined,
            },
            { preserveState: true }
        );
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        router.get(
            route('expiries.index'),
            {
                status: newTab,
                search: search || undefined,
                category_id: categoryId || undefined,
            },
            { preserveState: true }
        );
    };

    const handleCategoryChange = (catId) => {
        setCategoryId(catId);
        router.get(
            route('expiries.index'),
            {
                status: activeTab,
                search: search || undefined,
                category_id: catId || undefined,
            },
            { preserveState: true }
        );
    };

    const openQuarantineModal = (batch) => {
        setSelectedBatch(batch);
        quarantineForm.reset();
        quarantineForm.setData('reason', batch.expiry_date && new Date(batch.expiry_date) < new Date() ? 'pemusnahan' : 'retur_pbf');
        setQuarantineModalOpen(true);
    };

    const closeQuarantineModal = () => {
        setQuarantineModalOpen(false);
        setSelectedBatch(null);
        quarantineForm.reset();
    };

    const submitQuarantine = (e) => {
        e.preventDefault();
        if (!selectedBatch) return;

        quarantineForm.post(route('expiries.quarantine', selectedBatch.id), {
            onSuccess: () => {
                closeQuarantineModal();
            },
        });
    };

    const calculateDaysLeft = (dateStr) => {
        if (!dateStr) return null;
        const expDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expDate.setHours(0, 0, 0, 0);
        return Math.round((expDate - today) / (1000 * 60 * 60 * 24));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Clock className="h-6 w-6 text-rose-600" />
                            <span>Monitoring Tanggal Kadaluarsa</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Pantau masa simpan obat, karantina batch kadaluarsa, dan lindungi pasien dari obat kedaluwarsa.
                        </p>
                    </div>

                    <a
                        href={route('expiries.export', { status: activeTab })}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition active:scale-[0.98]"
                    >
                        <Download className="h-4 w-4" />
                        <span>Unduh Rekap Berita Acara (CSV)</span>
                    </a>
                </div>
            }
        >
            <Head title="Monitoring Kadaluarsa Obat - Apotek Sehat" />

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {/* 1. Sudah Kadaluarsa */}
                <div
                    onClick={() => handleTabChange('expired')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition active:scale-[0.98] ${
                        activeTab === 'expired'
                            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400'
                            : 'bg-white border-rose-200 hover:border-rose-300 shadow-2xs'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                            Sudah Kadaluarsa
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                            <AlertOctagon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-rose-700">
                        {stats.expired_count} <span className="text-xs font-bold text-rose-600">Batch</span>
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-rose-900">
                        Potensi Rugi: {formatCurrency(stats.expired_loss_value)}
                    </div>
                    <div className="mt-2 text-[10px] text-rose-600 font-semibold bg-rose-100/80 px-2 py-0.5 rounded-md inline-block">
                        Otomatis Ditolak Kasir
                    </div>
                </div>

                {/* 2. Kritis (≤ 30 Hari) */}
                <div
                    onClick={() => handleTabChange('critical')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition active:scale-[0.98] ${
                        activeTab === 'critical'
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
                            : 'bg-white border-amber-200 hover:border-amber-300 shadow-2xs'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                            Kritis (≤ 30 Hari)
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-amber-700">
                        {stats.critical_count} <span className="text-xs font-bold text-amber-600">Batch</span>
                    </div>
                    <div className="mt-1 text-[11px] text-amber-800 font-medium">
                        Prioritas FEFO / Siap Retur
                    </div>
                    <div className="mt-2 text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                        Masa Simpan Sangat Dekat
                    </div>
                </div>

                {/* 3. Waspada (31 - 90 Hari) */}
                <div
                    onClick={() => handleTabChange('warning')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition active:scale-[0.98] ${
                        activeTab === 'warning'
                            ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-400'
                            : 'bg-white border-yellow-200 hover:border-yellow-300 shadow-2xs'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-yellow-800">
                            Waspada (31 - 90 Hari)
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-yellow-800">
                        {stats.warning_count} <span className="text-xs font-bold text-yellow-700">Batch</span>
                    </div>
                    <div className="mt-1 text-[11px] text-yellow-800 font-medium">
                        Pantau kecepatan penjualan
                    </div>
                    <div className="mt-2 text-[10px] text-yellow-700 font-semibold bg-yellow-100 px-2 py-0.5 rounded-md inline-block">
                        1 - 3 Bulan ke Depan
                    </div>
                </div>

                {/* 4. Stok Aman (> 90 Hari) */}
                <div
                    onClick={() => handleTabChange('safe')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition active:scale-[0.98] ${
                        activeTab === 'safe'
                            ? 'bg-green-50 border-green-400 ring-2 ring-green-400'
                            : 'bg-white border-green-200 hover:border-green-300 shadow-2xs'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-800">
                            Stok Aman (&gt; 90 Hari)
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-green-700">
                        {stats.safe_count} <span className="text-xs font-bold text-green-600">Batch</span>
                    </div>
                    <div className="mt-1 text-[11px] text-green-800 font-medium">
                        Kondisi masa simpan optimal
                    </div>
                    <div className="mt-2 text-[10px] text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-md inline-block">
                        Layak Jual Penuh
                    </div>
                </div>
            </div>

            {/* Filter Navigation Tabs */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => handleTabChange('all')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                activeTab === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua Batch ({stats.expired_count + stats.critical_count + stats.warning_count + stats.safe_count})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('expired')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'expired'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                        >
                            <span>Kadaluarsa</span>
                            <span className="rounded-full bg-rose-700 px-1.5 py-0.2 text-[10px] text-white">
                                {stats.expired_count}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('critical')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'critical'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                        >
                            <span>Kritis (≤ 30 Hari)</span>
                            <span className="rounded-full bg-amber-700 px-1.5 py-0.2 text-[10px] text-white">
                                {stats.critical_count}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('warning')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'warning'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                        >
                            <span>Waspada (31-90 Hari)</span>
                            <span className="rounded-full bg-yellow-700 px-1.5 py-0.2 text-[10px] text-white">
                                {stats.warning_count}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('safe')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                activeTab === 'safe'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                            Aman (&gt; 90 Hari)
                        </button>
                    </div>

                    {/* Category Dropdown */}
                    <div className="w-full md:w-56 shrink-0">
                        <select
                            value={categoryId}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mt-4 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama obat, kode, atau nomor lot batch..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        route('expiries.index'),
                                        { status: activeTab, category_id: categoryId || undefined },
                                        { preserveState: true }
                                    );
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-xs active:scale-[0.98]"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* List / Table of Batches */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">
                            Daftar Batch & Masa Simpan
                        </h2>
                        <p className="text-xs text-slate-500">
                            Urutan prioritas FEFO (First Expired, First Out)
                        </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        Total {batches.total || batches.data?.length || 0} Batch Ditemukan
                    </span>
                </div>

                {/* Mobile Cards (< 768px) */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {batches.data && batches.data.length > 0 ? (
                        batches.data.map((batch) => {
                            const daysLeft = calculateDaysLeft(batch.expiry_date);
                            const isExpired = daysLeft !== null && daysLeft < 0;
                            const isToday = daysLeft === 0;
                            const isCritical = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
                            const isWarning = daysLeft !== null && daysLeft > 30 && daysLeft <= 90;

                            return (
                                <div key={batch.id} className="p-4 hover:bg-slate-50/70 transition">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <div className="font-black text-sm text-slate-900">
                                                {batch.medicine?.name}
                                            </div>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                                <span>{batch.medicine?.code}</span>
                                                <span>•</span>
                                                <span>{batch.medicine?.category?.name || 'Tanpa Kategori'}</span>
                                                {batch.medicine?.location && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-slate-600 font-semibold">{batch.medicine.location}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                                                isExpired
                                                    ? 'bg-rose-600 text-white animate-pulse'
                                                    : isToday
                                                    ? 'bg-rose-500 text-white'
                                                    : isCritical
                                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                    : isWarning
                                                    ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                                                    : 'bg-green-100 text-green-900'
                                            }`}
                                        >
                                            {isExpired
                                                ? `Kadaluarsa ${Math.abs(daysLeft)} hr lalu`
                                                : isToday
                                                ? 'Kadaluarsa HARI INI'
                                                : `${daysLeft} hr lagi`}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 text-xs mb-3">
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">No. Lot / Batch:</span>
                                            <span className="font-mono font-bold text-slate-800">
                                                {batch.batch_number}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">Tanggal Kadaluarsa:</span>
                                            <span className="font-bold text-slate-800">
                                                {batch.expiry_date}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">Sisa Stok Aktif:</span>
                                            <span className="font-extrabold text-green-700">
                                                {batch.current_stock} {batch.medicine?.unit}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px]">Estimasi Nilai Stok:</span>
                                            <span className="font-extrabold text-slate-900">
                                                {formatCurrency(batch.current_stock * batch.buy_price)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openQuarantineModal(batch)}
                                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                                                isExpired
                                                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                                                    : 'bg-amber-600 text-white hover:bg-amber-700'
                                            }`}
                                        >
                                            <PackageX className="h-4 w-4" />
                                            <span>Karantina / Retur</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-400">
                            Tidak ada batch obat yang sesuai dengan filter pencarian.
                        </div>
                    )}
                </div>

                {/* Standardized Unified Table (>= 768px) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                                <tr>
                                    <th className="px-5 py-3.5">Obat & Kategori</th>
                                    <th className="px-4 py-3.5">No. Batch (Lot)</th>
                                    <th className="px-4 py-3.5">Tgl Kadaluarsa</th>
                                    <th className="px-4 py-3.5">Sisa Hari</th>
                                    <th className="px-4 py-3.5 text-center">Sisa Stok</th>
                                    <th className="px-4 py-3.5 text-right">Nilai Stok (Beli)</th>
                                    <th className="px-5 py-3.5 text-right">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {batches.data && batches.data.length > 0 ? (
                                batches.data.map((batch) => {
                                    const daysLeft = calculateDaysLeft(batch.expiry_date);
                                    const isExpired = daysLeft !== null && daysLeft < 0;
                                    const isToday = daysLeft === 0;
                                    const isCritical = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
                                    const isWarning = daysLeft !== null && daysLeft > 30 && daysLeft <= 90;

                                    return (
                                        <tr key={batch.id} className="hover:bg-slate-50 transition">
                                            <td className="px-5 py-3.5">
                                                <div className="font-black text-slate-900">
                                                    {batch.medicine?.name}
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                    <span>{batch.medicine?.code}</span>
                                                    <span>•</span>
                                                    <span>{batch.medicine?.category?.name || 'Tanpa Kategori'}</span>
                                                    {batch.medicine?.location && (
                                                        <span className="text-slate-600 font-semibold bg-slate-100 px-1 rounded">
                                                            Rak: {batch.medicine.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                                                    {batch.batch_number}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 font-bold text-slate-800">
                                                {batch.expiry_date}
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black uppercase ${
                                                        isExpired
                                                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                                            : isToday
                                                            ? 'bg-rose-500 text-white'
                                                            : isCritical
                                                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                            : isWarning
                                                            ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                                                            : 'bg-green-100 text-green-900'
                                                    }`}
                                                >
                                                    {isExpired && <AlertOctagon className="h-3 w-3 text-rose-600" />}
                                                    {isCritical && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                                                    <span>
                                                        {isExpired
                                                            ? `Kadaluarsa (${Math.abs(daysLeft)} hr lalu)`
                                                            : isToday
                                                            ? 'Kadaluarsa HARI INI'
                                                            : `${daysLeft} hari lagi`}
                                                    </span>
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <span className="font-black text-slate-900 text-sm">
                                                    {batch.current_stock}
                                                </span>
                                                <span className="text-[11px] text-slate-500 ml-1">
                                                    {batch.medicine?.unit}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                                                {formatCurrency(batch.current_stock * batch.buy_price)}
                                            </td>

                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => openQuarantineModal(batch)}
                                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                                                        isExpired
                                                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                                                            : 'bg-amber-600 text-white hover:bg-amber-700'
                                                    }`}
                                                >
                                                    <PackageX className="h-3.5 w-3.5" />
                                                    <span>Karantina / Retur</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-xs text-slate-400">
                                        Tidak ada batch obat yang sesuai dengan filter pencarian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {batches.links && batches.links.length > 3 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Menampilkan {batches.from || 0} - {batches.to || 0} dari {batches.total} batch
                        </div>
                        <div className="flex items-center gap-1">
                            {batches.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-slate-900 text-white'
                                            : link.url
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-slate-300 pointer-events-none'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Karantina / Retur Obat */}
            <Modal show={quarantineModalOpen} onClose={closeQuarantineModal} maxWidth="md">
                <form onSubmit={submitQuarantine} className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <div className="flex items-center gap-2 text-rose-700">
                            <PackageX className="h-5 w-5" />
                            <h2 className="text-base font-extrabold text-slate-900">
                                Karantina / Retur Obat
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={closeQuarantineModal}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {selectedBatch && (
                        <div className="space-y-4">
                            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-900">
                                <div className="font-extrabold text-sm mb-1">
                                    {selectedBatch.medicine?.name}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] text-rose-800">
                                    <div>
                                        No. Batch: <span className="font-mono font-bold">{selectedBatch.batch_number}</span>
                                    </div>
                                    <div>
                                        Exp: <span className="font-bold">{selectedBatch.expiry_date}</span>
                                    </div>
                                    <div>
                                        Sisa Stok: <span className="font-extrabold text-rose-900">{selectedBatch.current_stock} {selectedBatch.medicine?.unit}</span>
                                    </div>
                                    <div>
                                        Nilai Beli: <span className="font-extrabold">{formatCurrency(selectedBatch.current_stock * selectedBatch.buy_price)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2">
                                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    Seluruh <strong>{selectedBatch.current_stock} {selectedBatch.medicine?.unit}</strong> dari batch ini akan dikeluarkan dari persediaan aktif dan tidak dapat dijual di kasir.
                                </div>
                            </div>

                            {/* Reason Dropdown */}
                            <div>
                                <InputLabel htmlFor="quarantine_reason" value="Alasan Karantina / Tindakan" />
                                <select
                                    id="quarantine_reason"
                                    value={quarantineForm.data.reason}
                                    onChange={(e) => quarantineForm.setData('reason', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                >
                                    <option value="retur_pbf">Retur ke Distributor (PBF)</option>
                                    <option value="pemusnahan">Berita Acara Pemusnahan Obat Kadaluarsa</option>
                                    <option value="rusak">Obat Rusak / Cacat Kemasan / Karantina Internal</option>
                                </select>
                            </div>

                            {/* Notes Input */}
                            <div>
                                <InputLabel htmlFor="quarantine_notes" value="Keterangan / Nomor Berita Acara (Opsional)" />
                                <TextInput
                                    id="quarantine_notes"
                                    type="text"
                                    value={quarantineForm.data.notes}
                                    onChange={(e) => quarantineForm.setData('notes', e.target.value)}
                                    placeholder="Contoh: Surat retur no. RT-2026/10 atau Berita Acara BPOM..."
                                    className="mt-1 w-full text-xs"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <SecondaryButton type="button" onClick={closeQuarantineModal} disabled={quarantineForm.processing}>
                                    Batal
                                </SecondaryButton>
                                <button
                                    type="submit"
                                    disabled={quarantineForm.processing}
                                    className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
                                >
                                    {quarantineForm.processing ? 'Memproses...' : 'Keluarkan dari Stok Kasir'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
