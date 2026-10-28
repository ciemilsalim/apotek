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
                <div className="flex items-center justify-between gap-3 w-full">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Riwayat Transaksi Penjualan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Daftar seluruh faktur struk penjualan yang telah selesai
                        </p>
                    </div>
                    <Link
                        href={route('pos.index')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-3.5 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition shadow-xs"
                    >
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                        <span>Buka Kasir</span>
                    </Link>
                </div>
            }
        >
            <Head title="Riwayat Penjualan" />

            {/* Filter Bar (Light Theme Consistent) */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between"
                >
                    <div className="relative w-full sm:flex-1 sm:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nomor faktur, nama pembeli..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-2 shrink-0">
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
                            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full sm:w-auto rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-xs"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Standardized Unified Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
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
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {sales.data && sales.data.length > 0 ? (
                                sales.data.map((sale) => (
                                    <tr
                                        key={sale.id}
                                        className="hover:bg-slate-50/80 transition-colors duration-150"
                                    >
                                        <td className="px-5 py-3.5 font-bold font-mono text-slate-800">
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
                                        <td className="px-5 py-3.5 text-slate-800 font-medium">
                                            {sale.user?.name || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-800 font-medium">
                                            {sale.customer_name}
                                        </td>
                                        <td className="px-5 py-3.5">
                                             <span className="inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700 border border-slate-200/60">
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-bold text-slate-700">
                                            {sale.items?.reduce((s, i) => s + i.quantity, 0) || 0}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-sm text-slate-900">
                                            {formatCurrency(sale.total_amount)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <Link
                                                href={route('pos.receipt', sale.id)}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-700 shadow-2xs transition"
                                            >
                                                <Printer className="h-3.5 w-3.5 text-red-600" />
                                                <span>Cetak Struk</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-12 text-center text-xs text-slate-400"
                                    >
                                        <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                                        <p className="font-semibold text-slate-600">Tidak ada riwayat transaksi</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Transaksi penjualan yang selesai akan muncul di sini</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {sales.links && sales.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-200/80 px-5 py-3.5 text-xs bg-slate-50/50">
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
                                            ? 'bg-red-600 text-white font-bold'
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
