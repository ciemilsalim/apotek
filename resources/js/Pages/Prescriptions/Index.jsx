import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    Pill,
    Plus,
    Printer,
    Search,
    Stethoscope,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function PrescriptionIndex({ prescriptions, stats, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');

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
            route('prescriptions.index'),
            { status: activeTab, search: search || undefined },
            { preserveState: true }
        );
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        router.get(
            route('prescriptions.index'),
            { status: newTab, search: search || undefined },
            { preserveState: true }
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        <span>Menunggu Diracik</span>
                    </span>
                );
            case 'processed':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-black text-blue-800 border border-blue-200">
                        <Pill className="h-3 w-3" />
                        <span>Siap Ditebus (Kasir)</span>
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Selesai Ditebus</span>
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600 border border-slate-200">
                        <X className="h-3 w-3" />
                        <span>Dibatalkan</span>
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Stethoscope className="h-6 w-6 text-teal-600" />
                            <span>Resep Dokter & Racikan Klinik</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Kelola resep obat jadi, formula puyer/kapsul racikan, cetak etiket signa, dan tebus langsung di kasir.
                        </p>
                    </div>

                    <Link
                        href={route('prescriptions.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>+ Buat Resep Racikan Baru</span>
                    </Link>
                </div>
            }
        >
            <Head title="Resep Dokter & Racikan - Apotek Sehat" />

            {/* Stats Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div
                    onClick={() => handleTabChange('pending')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition active:scale-[0.98] ${
                        activeTab === 'pending'
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
                            : 'bg-white border-slate-200/90 shadow-2xs hover:border-amber-300'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                            Menunggu Diracik
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-amber-700">
                        {stats.pending_count} <span className="text-xs font-bold text-amber-600">Resep</span>
                    </div>
                    <div className="mt-1 text-[11px] text-amber-800 font-medium">
                        Perlu penyiapan oleh apoteker
                    </div>
                </div>

                <div
                    onClick={() => handleTabChange('processed')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition active:scale-[0.98] ${
                        activeTab === 'processed'
                            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400'
                            : 'bg-white border-slate-200/90 shadow-2xs hover:border-blue-300'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                            Siap Ditebus (Kasir)
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                            <Pill className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-blue-700">
                        {stats.processed_count} <span className="text-xs font-bold text-blue-600">Resep</span>
                    </div>
                    <div className="mt-1 text-[11px] text-blue-800 font-medium">
                        Telah diracik & siap bayar
                    </div>
                </div>

                <div
                    onClick={() => handleTabChange('completed')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition active:scale-[0.98] ${
                        activeTab === 'completed'
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400'
                            : 'bg-white border-slate-200/90 shadow-2xs hover:border-emerald-300'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                            Selesai Hari Ini
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-700">
                        {stats.completed_today} <span className="text-xs font-bold text-emerald-600">Resep</span>
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-800 font-medium">
                        Sudah diserahkan ke pasien
                    </div>
                </div>

                <div
                    onClick={() => handleTabChange('all')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition active:scale-[0.98] ${
                        activeTab === 'all'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                            Total Seluruh Resep
                        </span>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${activeTab === 'all' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            <FileText className="h-4 w-4" />
                        </div>
                    </div>
                    <div className={`text-2xl font-black ${activeTab === 'all' ? 'text-white' : 'text-slate-900'}`}>
                        {stats.total_count} <span className={`text-xs font-bold ${activeTab === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>Resep</span>
                    </div>
                    <div className={`mt-1 text-[11px] ${activeTab === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Semua riwayat resep klinik
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                            Semua ({stats.total_count})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('pending')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'pending'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                        >
                            <span>Menunggu Diracik</span>
                            <span className="rounded-full bg-amber-700 px-1.5 py-0.2 text-[10px] text-white">
                                {stats.pending_count}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('processed')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'processed'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                        >
                            <span>Siap Ditebus (Kasir)</span>
                            <span className="rounded-full bg-blue-700 px-1.5 py-0.2 text-[10px] text-white">
                                {stats.processed_count}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('completed')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                activeTab === 'completed'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                        >
                            Selesai Ditebus
                        </button>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="No. Resep, Pasien, Dokter..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-7 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('prescriptions.index'), { status: activeTab }, { preserveState: true });
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>
            </div>

            {/* List / Table of Prescriptions */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">
                            Daftar Resep Dokter Masuk
                        </h2>
                        <p className="text-xs text-slate-500">
                            Kelola alur peracikan apotek dan penyerahan obat ke pasien
                        </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        Total {prescriptions.total || prescriptions.data?.length || 0} Resep
                    </span>
                </div>

                {/* Mobile Cards (< 768px) */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {prescriptions.data && prescriptions.data.length > 0 ? (
                        prescriptions.data.map((rx) => (
                            <div key={rx.id} className="p-4 hover:bg-slate-50/70 transition">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <span className="font-mono text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                            {rx.prescription_number}
                                        </span>
                                        <div className="font-black text-sm text-slate-900 mt-1">
                                            {rx.patient_name} {rx.patient_age && `(${rx.patient_age})`}
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            Dokter: <span className="font-bold text-slate-700">{rx.doctor_name}</span>
                                        </div>
                                    </div>
                                    {getStatusBadge(rx.status)}
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 text-xs mb-3 space-y-1">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Item Racikan / Obat:</span>
                                        <span className="font-bold">{rx.items?.length || 0} Formula</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Jasa Racik:</span>
                                        <span className="font-bold">{formatCurrency(rx.service_fee)}</span>
                                    </div>
                                    <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
                                        <span>Total Biaya Resep:</span>
                                        <span className="text-teal-700">{formatCurrency(rx.grand_total)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={route('prescriptions.etiket', rx.id)}
                                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                                    >
                                        <Printer className="h-3.5 w-3.5" />
                                        <span>Etiket</span>
                                    </Link>
                                    <Link
                                        href={route('prescriptions.show', rx.id)}
                                        className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition"
                                    >
                                        <span>Detail Formula</span>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-400">
                            Belum ada data resep dokter.
                        </div>
                    )}
                </div>

                {/* Desktop Table (>= 768px) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase text-slate-400">
                            <tr>
                                <th className="px-5 py-3.5">No. Resep & Tgl</th>
                                <th className="px-4 py-3.5">Pasien</th>
                                <th className="px-4 py-3.5">Dokter Perujuk</th>
                                <th className="px-4 py-3.5">Komposisi Racikan</th>
                                <th className="px-4 py-3.5 text-right">Total Biaya</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {prescriptions.data && prescriptions.data.length > 0 ? (
                                prescriptions.data.map((rx) => (
                                    <tr key={rx.id} className="hover:bg-slate-50 transition">
                                        <td className="px-5 py-3.5">
                                            <div className="font-mono font-bold text-teal-700">
                                                {rx.prescription_number}
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                {rx.prescription_date}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-black text-slate-900">
                                                {rx.patient_name}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {rx.patient_age ? `${rx.patient_age}` : 'Usia tidak tercatat'}
                                                {rx.patient_phone && ` • ${rx.patient_phone}`}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-slate-800">
                                                {rx.doctor_name}
                                            </div>
                                            {rx.doctor_sip && (
                                                <div className="text-[10px] text-slate-400">
                                                    SIP: {rx.doctor_sip}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="space-y-0.5">
                                                {rx.items?.map((it, idx) => (
                                                    <div key={idx} className="text-slate-800 font-medium">
                                                        <span className="font-bold">{it.racikan_name}</span>{' '}
                                                        <span className="text-[10px] text-slate-500 font-normal">
                                                            ({it.quantity} {it.unit} - {it.signa})
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-right">
                                            <div className="font-black text-slate-900 text-sm">
                                                {formatCurrency(rx.grand_total)}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Jasa: {formatCurrency(rx.service_fee)}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            {getStatusBadge(rx.status)}
                                        </td>

                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={route('prescriptions.etiket', rx.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                                                    title="Cetak Etiket Signa"
                                                >
                                                    <Printer className="h-3.5 w-3.5" />
                                                    <span>Etiket</span>
                                                </Link>
                                                <Link
                                                    href={route('prescriptions.show', rx.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition"
                                                >
                                                    <span>Lihat</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-xs text-slate-400">
                                        Belum ada data resep dokter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {prescriptions.links && prescriptions.links.length > 3 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Menampilkan {prescriptions.from || 0} - {prescriptions.to || 0} dari {prescriptions.total} resep
                        </div>
                        <div className="flex items-center gap-1">
                            {prescriptions.links.map((link, idx) => (
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
        </AuthenticatedLayout>
    );
}
