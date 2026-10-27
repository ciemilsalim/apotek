import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    History,
    Printer,
    Receipt,
    Search,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';

export default function PosHistory({ sales, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

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
            route('pos.history'),
            { search, date },
            { preserveState: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Riwayat Transaksi Penjualan
                        </h1>
                        <p className="text-xs text-slate-500">
                            Daftar seluruh faktur struk penjualan yang telah selesai
                        </p>
                    </div>
                    <Link
                        href={route('pos.index')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Buka Kasir</span>
                    </Link>
                </div>
            }
        >
            <Head title="Riwayat Penjualan" />

            {/* Filter */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row gap-3 items-center justify-between"
                >
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nomor faktur, nama pembeli..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        />
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                router.get(
                                    route('pos.history'),
                                    { search, date: e.target.value },
                                    { preserveState: true },
                                );
                            }}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        />

                        <button
                            type="submit"
                            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/75 font-semibold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-5 py-3.5">No. Faktur</th>
                                <th className="px-5 py-3.5">Tanggal & Waktu</th>
                                <th className="px-5 py-3.5">Kasir</th>
                                <th className="px-5 py-3.5">Pelanggan</th>
                                <th className="px-5 py-3.5">Metode Bayar</th>
                                <th className="px-5 py-3.5 text-center">Item</th>
                                <th className="px-5 py-3.5 text-right">Total Transaksi</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {sales.data && sales.data.length > 0 ? (
                                sales.data.map((sale) => (
                                    <tr
                                        key={sale.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                                    >
                                        <td className="px-5 py-3.5 font-bold font-mono text-emerald-600">
                                            {sale.invoice_number}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500">
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
                                        <td className="px-5 py-3.5">
                                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                                            {sale.items?.reduce((s, i) => s + i.quantity, 0) || 0}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">
                                            {formatCurrency(sale.total_amount)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <Link
                                                href={route('pos.receipt', sale.id)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                            >
                                                <Printer className="h-3.5 w-3.5" />
                                                <span>Cetak Struk</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-10 text-center text-xs text-slate-400"
                                    >
                                        Tidak ada riwayat transaksi penjualan.
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
                            {sales.total} faktur
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
