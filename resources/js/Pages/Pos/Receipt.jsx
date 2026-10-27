import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Printer, ShoppingCart } from 'lucide-react';

export default function PosReceipt({ sale }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('pos.history')}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Faktur Struk Penjualan
                            </h1>
                            <p className="text-xs text-slate-500">
                                No. Faktur: {sale.invoice_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-700 transition dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Cetak Struk Sekarang</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Struk ${sale.invoice_number} - Apotek Sehat`} />

            <div className="mx-auto max-w-md">
                {/* Thermal Receipt Paper Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200">
                    {/* Header */}
                    <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            APOTEK SEHAT
                        </h2>
                        <p className="text-[11px] text-slate-500 font-sans">
                            Sistem Pelayanan Farmasi & Obat Terpadu
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                            Jl. Farmasi Sehat No. 88, Telp: (021) 555-0123
                        </p>
                        <div className="mt-3 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            {sale.invoice_number}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-sans">
                            {new Date(sale.created_at).toLocaleString('id-ID')}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="py-3 text-[11px] space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Pelanggan:</span>
                            <span className="font-bold">{sale.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Kasir:</span>
                            <span className="font-bold">{sale.user?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Metode Bayar:</span>
                            <span className="font-bold uppercase">{sale.payment_method}</span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="py-4 space-y-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                        {sale.items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {item.medicine_name}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        {item.quantity} {item.unit} x {formatCurrency(item.price)}
                                    </div>
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(item.subtotal)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Financial Summary */}
                    <div className="py-4 space-y-1.5 text-xs border-b border-dashed border-slate-300 dark:border-slate-700">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(sale.subtotal)}</span>
                        </div>
                        {sale.discount > 0 && (
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Potongan Diskon:</span>
                                <span>-{formatCurrency(sale.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1">
                            <span>TOTAL BAYAR:</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(sale.total_amount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Bayar Tunai:</span>
                            <span>{formatCurrency(sale.cash_paid)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                            <span>Kembalian:</span>
                            <span>{formatCurrency(sale.change_amount)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-4 text-[10px] text-slate-400 font-sans space-y-1">
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                            Terima kasih atas kunjungan Anda.
                        </p>
                        <p>Semoga lekas sembuh & senantiasa sehat selalu!</p>
                        <p className="text-[9px]">
                            Struk ini merupakan bukti pembayaran yang sah.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
