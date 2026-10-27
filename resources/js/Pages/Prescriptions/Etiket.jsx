import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

export default function PrescriptionEtiket({ prescription }) {
    const handlePrint = () => {
        window.print();
    };

    // Calculate Beyond Use Date (BUD): 30 days from prescription date for dry powders
    const rxDate = new Date(prescription.prescription_date);
    const budDate = new Date(rxDate);
    budDate.setDate(rxDate.getDate() + 30);
    const formattedBud = budDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900">
            <Head title={`Etiket Resep #${prescription.prescription_number}`} />

            {/* Controls (Hidden during print) */}
            <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={route('prescriptions.show', prescription.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Detail Resep</span>
                </Link>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-teal-700 transition active:scale-[0.98]"
                >
                    <Printer className="h-4 w-4" />
                    <span>Cetak Semua Etiket</span>
                </button>
            </div>

            {/* Printable Etiket Cards Container */}
            <div className="max-w-2xl mx-auto space-y-6 print:space-y-4">
                {prescription.items?.map((item, idx) => {
                    const isObatLuar = item.racikan_type === 'salep' || item.racikan_type === 'tetes';

                    return (
                        <div
                            key={item.id}
                            className={`p-5 rounded-2xl border-2 transition print:border-black print:rounded-none bg-white shadow-sm max-w-md mx-auto ${
                                isObatLuar
                                    ? 'border-blue-600 ring-2 ring-blue-100'
                                    : 'border-slate-800'
                            }`}
                        >
                            {/* Pharmacy Header */}
                            <div className="text-center pb-2 border-b-2 border-dashed border-slate-300">
                                <div className="font-black text-sm uppercase tracking-wide">
                                    APOTEK SEHAT FARMA
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    SIPA: 503/442/SIPA/2026 • Telp: (021) 555-0199
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    Jl. Raya Farmasi No. 12, Jakarta
                                </div>
                            </div>

                            {/* Prescription & Patient info */}
                            <div className="py-2.5 text-xs space-y-1">
                                <div className="flex justify-between font-mono text-[11px]">
                                    <span>No: <strong>{prescription.prescription_number}</strong></span>
                                    <span>Tgl: {prescription.prescription_date}</span>
                                </div>
                                <div className="font-bold text-sm text-slate-900 pt-0.5">
                                    Pasien: {prescription.patient_name} {prescription.patient_age && `(${prescription.patient_age})`}
                                </div>
                                <div className="text-[11px] text-slate-600">
                                    Dokter: {prescription.doctor_name}
                                </div>
                            </div>

                            {/* Signa & Directions (Giant font) */}
                            <div className={`my-2 p-3 rounded-xl text-center border ${
                                isObatLuar ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="font-extrabold text-sm uppercase tracking-tight text-slate-900">
                                    {item.signa}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                                    {item.racikan_name} ({item.quantity} {item.unit})
                                </div>
                            </div>

                            {/* Footer & BUD */}
                            <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                                <span className={`font-black uppercase px-2 py-0.5 rounded text-[9px] ${
                                    isObatLuar ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                                }`}>
                                    {isObatLuar ? 'OBAT LUAR' : 'OBAT DALAM'}
                                </span>
                                <span>BUD (Kadaluarsa Racikan): <strong>{formattedBud}</strong></span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
