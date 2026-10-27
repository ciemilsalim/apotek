import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Printer, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function PosReceipt({ sale }) {
    const { pharmacy } = usePage().props;
    const [paperSize, setPaperSize] = useState('58mm'); // '58mm' or '80mm'

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
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">
                                Faktur Struk Penjualan
                            </h1>
                            <p className="text-xs text-slate-500 font-mono">
                                No: {sale.invoice_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Cetak Termal ({paperSize})</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Struk ${sale.invoice_number} - Apotek Sehat`} />

            {/* Thermal Print CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: ${paperSize === '80mm' ? '80mm auto' : '58mm auto'};
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #thermal-receipt, #thermal-receipt * {
                        visibility: visible !important;
                    }
                    #thermal-receipt {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: ${paperSize === '80mm' ? '76mm' : '54mm'} !important;
                        max-width: ${paperSize === '80mm' ? '80mm' : '58mm'} !important;
                        padding: 2mm 3mm 15mm 3mm !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        font-family: 'Courier New', Courier, monospace !important;
                        font-size: ${paperSize === '80mm' ? '12px' : '10.5px'} !important;
                        line-height: 1.25 !important;
                        color: #000000 !important;
                        background: #ffffff !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            ` }} />

            <div className="mx-auto max-w-sm">
                {/* Paper Size Switcher */}
                <div className="no-print mb-4 p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                        Format Kertas Termal:
                    </span>
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => setPaperSize('58mm')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                paperSize === '58mm'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-slate-700 border-slate-200'
                            }`}
                        >
                            58 mm (Roll Kecil)
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaperSize('80mm')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                paperSize === '80mm'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-slate-700 border-slate-200'
                            }`}
                        >
                            80 mm (Standar POS)
                        </button>
                    </div>
                </div>

                {/* Thermal Receipt Paper */}
                <div
                    id="thermal-receipt"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm font-mono text-xs text-black"
                    style={{ maxWidth: paperSize === '80mm' ? '80mm' : '58mm', margin: '0 auto' }}
                >
                    {/* Header */}
                    <div className="text-center pb-3 border-b border-dashed border-black">
                        {pharmacy?.logo_url && (
                            <img
                                src={pharmacy.logo_url}
                                alt="Logo"
                                className="h-9 w-9 mx-auto object-contain mb-1"
                            />
                        )}
                        <h2 className="text-base font-black tracking-tight uppercase">
                            {pharmacy?.name || 'APOTEK SEHAT'}
                        </h2>
                        {pharmacy?.tagline && (
                            <p className="text-[9px] italic text-slate-600 mb-0.5">
                                {pharmacy.tagline}
                            </p>
                        )}
                        <p className="text-[10px]">
                            {pharmacy?.address || 'Jl. Farmasi Sehat No. 88'}
                        </p>
                        {pharmacy?.phone && (
                            <p className="text-[10px]">
                                Telp: {pharmacy.phone}
                            </p>
                        )}
                        <div className="mt-1 font-bold text-xs">
                            {sale.invoice_number}
                        </div>
                        <p className="text-[9px]">
                            {new Date(sale.created_at).toLocaleString('id-ID')}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="py-2.5 text-[10px] space-y-0.5 border-b border-dashed border-black">
                        <div className="flex justify-between">
                            <span>Kasir:</span>
                            <span className="font-bold">{sale.user?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pelanggan:</span>
                            <span className="font-bold">{sale.customer_name}</span>
                        </div>
                        {sale.prescription && (
                            <>
                                <div className="flex justify-between">
                                    <span>No. Resep:</span>
                                    <span className="font-bold">{sale.prescription.prescription_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dokter:</span>
                                    <span className="font-bold">{sale.prescription.doctor_name}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between">
                            <span>Pembayaran:</span>
                            <span className="font-bold uppercase">{sale.payment_method}</span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="py-2.5 space-y-1.5 border-b border-dashed border-black text-[10px]">
                        {sale.items?.map((item) => (
                            <div key={item.id}>
                                <div className="font-bold">
                                    {item.medicine_name}
                                </div>
                                <div className="flex justify-between">
                                    <span>
                                        {item.quantity} {item.unit} x {item.price.toLocaleString('id-ID')}
                                    </span>
                                    <span>
                                        {item.subtotal.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Financial Summary */}
                    <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-black">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{sale.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        {sale.discount > 0 && (
                            <div className="flex justify-between">
                                <span>Diskon:</span>
                                <span>-{sale.discount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-black text-xs pt-1">
                            <span>TOTAL BAYAR:</span>
                            <span>Rp {sale.total_amount.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Uang Diterima:</span>
                            <span>Rp {sale.cash_paid.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Uang Kembalian:</span>
                            <span>Rp {sale.change_amount.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-3 text-[9px] leading-relaxed">
                        {pharmacy?.receipt_footer ? (
                            <div className="whitespace-pre-line font-bold">
                                {pharmacy.receipt_footer}
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                <p className="font-bold">Terima kasih atas kunjungan Anda</p>
                                <p>Semoga lekas sembuh!</p>
                                <p>Struk ini bukti pembayaran sah</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Print button on screen */}
                <div className="no-print mt-4">
                    <button
                        onClick={() => window.print()}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                        <Printer className="h-5 w-5" />
                        <span>Cetak Struk ke Printer Termal</span>
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
