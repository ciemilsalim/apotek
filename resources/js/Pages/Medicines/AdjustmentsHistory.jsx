import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeft,
    ArrowUpRight,
    Calendar,
    ClipboardList,
    Clock,
    Pill,
    Search,
    SlidersHorizontal,
    User,
} from 'lucide-react';
import { useState } from 'react';

export default function AdjustmentsHistory({ adjustments, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('medicines.adjustments'),
            { search },
            { preserveState: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('medicines.index')}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">
                                Riwayat Mutasi & Penyesuaian Stok
                            </h1>
                            <p className="text-xs text-slate-500">
                                Catatan audit keluar-masuk obat, restock distributor, dan penjualan
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Riwayat Penyesuaian Stok" />

            {/* Search (Light Theme Consistent) */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kode obat, nama obat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Standardized Unified Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-5 py-3.5">Waktu</th>
                                <th className="px-5 py-3.5">Obat</th>
                                <th className="px-5 py-3.5">No. Batch</th>
                                <th className="px-5 py-3.5">Jenis Mutasi</th>
                                <th className="px-5 py-3.5 text-center">Jumlah</th>
                                <th className="px-5 py-3.5 text-center">Sebelum &gt; Sesudah</th>
                                <th className="px-5 py-3.5">Keterangan</th>
                                <th className="px-5 py-3.5">Petugas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {adjustments.data && adjustments.data.length > 0 ? (
                                adjustments.data.map((adj) => {
                                    const isAdd = adj.type === 'in';
                                    const isSub = adj.type === 'out';
                                    const batchNo = adj.batch?.batch_number || adj.batch_number;

                                    return (
                                        <tr
                                            key={adj.id}
                                            className="hover:bg-slate-50/80 transition-colors duration-150"
                                        >
                                            <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                                                {new Date(adj.created_at).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-extrabold text-sm text-slate-900">
                                                    {adj.medicine?.name || 'Obat Dihapus'}
                                                </div>
                                                <div className="font-mono text-[10px] text-emerald-700">
                                                    {adj.medicine?.code}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {batchNo ? (
                                                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800 border border-slate-200/60">
                                                        {batchNo}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-mono text-[11px]">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                        isAdd
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            : isSub
                                                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    }`}
                                                >
                                                    {isAdd && <ArrowDownRight className="h-3 w-3" />}
                                                    {isSub && <ArrowUpRight className="h-3 w-3" />}
                                                    {!isAdd && !isSub && <SlidersHorizontal className="h-3 w-3" />}
                                                    <span>
                                                        {isAdd
                                                            ? 'Stok Masuk'
                                                            : isSub
                                                            ? 'Stok Keluar'
                                                            : 'Koreksi Fisik'}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center font-bold">
                                                <span
                                                    className={
                                                        isAdd
                                                            ? 'text-emerald-700 font-black'
                                                            : isSub
                                                            ? 'text-rose-700 font-black'
                                                            : 'text-blue-700 font-black'
                                                    }
                                                >
                                                    {isAdd ? '+' : isSub ? '-' : ''}
                                                    {adj.quantity} {adj.medicine?.unit}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center text-slate-500 font-mono">
                                                {adj.stock_before} &rarr;{' '}
                                                <strong className="text-slate-900">
                                                    {adj.stock_after}
                                                </strong>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                                                {adj.notes || '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                {adj.user?.name || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-12 text-center text-xs text-slate-400"
                                    >
                                        <ClipboardList className="mx-auto h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                                        <p className="font-semibold text-slate-600">Belum ada riwayat mutasi stok</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Semua riwayat restock dan penyesuaian fisik akan tercatat di sini</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {adjustments.links && adjustments.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-200/80 px-5 py-3.5 text-xs bg-slate-50/50">
                        <div className="text-slate-500">
                            Menampilkan {adjustments.from || 0} - {adjustments.to || 0} dari{' '}
                            {adjustments.total} catatan
                        </div>
                        <div className="flex gap-1">
                            {adjustments.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-lg px-2.5 py-1 ${
                                        link.active
                                            ? 'bg-emerald-600 text-white font-bold'
                                            : link.url
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-slate-300 cursor-not-allowed'
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
