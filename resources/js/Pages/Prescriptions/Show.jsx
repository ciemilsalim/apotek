import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    Pill,
    Printer,
    Receipt,
    Stethoscope,
    User,
    X,
} from 'lucide-react';

export default function PrescriptionShow({ prescription }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const updateStatus = (newStatus) => {
        router.patch(route('prescriptions.update-status', prescription.id), {
            status: newStatus,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 border border-amber-200">
                        <Clock className="h-4 w-4" />
                        <span>Menunggu Diracik</span>
                    </span>
                );
            case 'processed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1 text-xs font-black text-blue-800 border border-blue-200">
                        <Pill className="h-4 w-4" />
                        <span>Siap Ditebus di Kasir</span>
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Sudah Ditebus (Selesai)</span>
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 border border-slate-200">
                        <X className="h-4 w-4" />
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
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('prescriptions.index')}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Resep #{prescription.prescription_number}
                                </h1>
                                {getStatusBadge(prescription.status)}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Tanggal Resep: {prescription.prescription_date} • Dibuat oleh {prescription.creator?.name || 'Staf'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('prescriptions.etiket', prescription.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-[0.98]"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Cetak Etiket Obat</span>
                        </Link>

                        {prescription.status === 'pending' && (
                            <button
                                type="button"
                                onClick={() => updateStatus('processed')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition active:scale-[0.98]"
                            >
                                <Check className="h-4 w-4" />
                                <span>Tandai Selesai Diracik</span>
                            </button>
                        )}

                        {prescription.status === 'completed' && prescription.sale_id && (
                            <Link
                                href={route('pos.receipt', prescription.sale_id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                            >
                                <Receipt className="h-4 w-4" />
                                <span>Lihat Struk Kasir</span>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Resep #${prescription.prescription_number} - Apotek Sehat`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
                {/* Left 2 Cols: Formulas and Medicines */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                        <h2 className="text-base font-extrabold text-slate-900 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
                            <Pill className="h-5 w-5 text-teal-600" />
                            <span>Formula Racikan & Rincian Obat</span>
                        </h2>

                        <div className="space-y-4">
                            {prescription.items?.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-600 text-[10px] font-black text-white">
                                                    {idx + 1}
                                                </span>
                                                <h3 className="font-extrabold text-sm text-slate-900">
                                                    {item.racikan_name}
                                                </h3>
                                                <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                                    {item.racikan_type}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-xs font-bold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-lg inline-block">
                                                Signa: {item.signa}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs font-bold text-slate-600">
                                                {item.quantity} {item.unit}
                                            </span>
                                            <div className="text-xs font-black text-slate-900 mt-0.5">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ingredients Table */}
                                    <div className="rounded-xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                                                <tr>
                                                    <th className="px-3.5 py-2.5">Bahan Obat</th>
                                                    <th className="px-3.5 py-2.5">Dosis</th>
                                                    <th className="px-3.5 py-2.5 text-center">Jumlah Ambil</th>
                                                    <th className="px-3.5 py-2.5 text-right">Harga Satuan</th>
                                                    <th className="px-3.5 py-2.5 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                                {item.ingredients?.map((ing) => (
                                                    <tr key={ing.id} className="hover:bg-slate-50/70 transition-colors">
                                                        <td className="px-3.5 py-2.5 font-bold text-slate-800">
                                                            {ing.medicine_name}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 text-slate-600">
                                                            {ing.dosage || '-'}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 text-center font-bold text-slate-900">
                                                            {ing.quantity}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 text-right text-slate-600">
                                                            {formatCurrency(ing.price)}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 text-right font-black text-slate-900">
                                                            {formatCurrency(ing.subtotal)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {parseFloat(item.service_fee) > 0 && (
                                        <div className="flex justify-end text-xs text-slate-500 gap-2">
                                            <span>Jasa Racik / Embalase:</span>
                                            <span className="font-bold text-slate-800">
                                                {formatCurrency(item.service_fee)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right 1 Col: Info Pasien, Dokter, Ringkasan Biaya */}
                <div className="space-y-6">
                    {/* Patient & Doctor Card */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                Informasi Pasien
                            </span>
                            <div className="font-black text-base text-slate-900">
                                {prescription.patient_name}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                                Usia: {prescription.patient_age || 'Tidak dicatat'}
                            </div>
                            {prescription.patient_phone && (
                                <div className="text-xs text-slate-600">
                                    No. HP: {prescription.patient_phone}
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                Dokter Perujuk
                            </span>
                            <div className="font-bold text-sm text-slate-800">
                                {prescription.doctor_name}
                            </div>
                            {prescription.doctor_sip && (
                                <div className="text-xs text-slate-500">
                                    SIP: {prescription.doctor_sip}
                                </div>
                            )}
                        </div>

                        {prescription.notes && (
                            <div className="pt-3 border-t border-slate-100">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                    Catatan Resep
                                </span>
                                <p className="text-xs text-slate-600 italic">
                                    "{prescription.notes}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Cost Summary Card */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-3">
                        <h3 className="font-extrabold text-sm text-slate-900">
                            Ringkasan Biaya Resep
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Total Harga Obat:</span>
                                <span className="font-bold text-slate-800">
                                    {formatCurrency(prescription.total_medicine_price)}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Biaya Jasa Racik / Tuslah:</span>
                                <span className="font-bold text-slate-800">
                                    {formatCurrency(prescription.service_fee)}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-black text-teal-700 pt-2 border-t border-slate-100">
                                <span>Grand Total:</span>
                                <span>{formatCurrency(prescription.grand_total)}</span>
                            </div>
                        </div>

                        {prescription.status === 'processed' && (
                            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                                <strong>Siap Ditebus:</strong> Pasien dapat menuju kasir untuk melakukan pembayaran dan penebusan obat.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
