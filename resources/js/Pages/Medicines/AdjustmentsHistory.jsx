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
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
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

            {/* Search */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kode obat, nama obat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/75 font-semibold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-5 py-3.5">Waktu</th>
                                <th className="px-5 py-3.5">Obat</th>
                                <th className="px-5 py-3.5">Jenis Mutasi</th>
                                <th className="px-5 py-3.5 text-center">Jumlah</th>
                                <th className="px-5 py-3.5 text-center">Sebelum &gt; Sesudah</th>
                                <th className="px-5 py-3.5">Keterangan</th>
                                <th className="px-5 py-3.5">Petugas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {adjustments.data && adjustments.data.length > 0 ? (
                                adjustments.data.map((adj) => {
                                    const isAdd = adj.type === 'in';
                                    const isSub = adj.type === 'out';
                                    return (
                                        <tr
                                            key={adj.id}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
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
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {adj.medicine?.name || 'Obat Dihapus'}
                                                </div>
                                                <div className="font-mono text-[10px] text-emerald-600">
                                                    {adj.medicine?.code}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                        isAdd
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : isSub
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
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
                                                            ? 'text-emerald-600'
                                                            : isSub
                                                            ? 'text-rose-600'
                                                            : 'text-blue-600'
                                                    }
                                                >
                                                    {isAdd ? '+' : isSub ? '-' : ''}
                                                    {adj.quantity} {adj.medicine?.unit}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center text-slate-500 font-mono">
                                                {adj.stock_before} &rarr;{' '}
                                                <strong className="text-slate-900 dark:text-white">
                                                    {adj.stock_after}
                                                </strong>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                {adj.notes || '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                                                {adj.user?.name || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="py-10 text-center text-xs text-slate-400"
                                    >
                                        Belum ada riwayat penyesuaian stok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {adjustments.links && adjustments.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs dark:border-slate-800">
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
