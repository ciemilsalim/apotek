import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Barcode,
    CheckCircle2,
    Compass,
    ExternalLink,
    FileBarChart2,
    FileText,
    Pill,
    Printer,
    QrCode,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Store,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function FeatureTourModal({ isOpen, onClose, currentRole = 'admin' }) {
    const [currentStep, setCurrentStep] = useState(0);

    const tourSteps = [
        {
            id: 'pos',
            title: 'Kasir & Transaksi Penjualan (POS)',
            category: 'Layanan Kasir',
            route: 'pos.index',
            roleAccess: 'Kasir & Admin',
            icon: Sparkles,
            gradient: 'from-emerald-600 to-teal-500',
            bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            description:
                'Layanan kasir cepat untuk transaksi obat bebas, obat resep, maupun suplemen dengan dukungan scanner dan printer kasir.',
            highlights: [
                'Scan barcode cepat via kamera ponsel/laptop atau Barcode Scanner Gun (USB / Bluetooth).',
                'Otomatis mengurangi stok menggunakan metode FEFO (First Expired First Out).',
                'Kalkulasi subtotal, diskon, uang diterima, dan kembalian tunai otomatis.',
                'Otomatis cetak struk thermal (58mm / 80mm) setelah pembayaran berhasil.',
            ],
            shortcut: 'Tekan F2 atau klik tombol "Buka Kasir" di navigasi atas.',
        },
        {
            id: 'medicines',
            title: 'Katalog Obat, Multi-Batch & Barcode Mandiri',
            category: 'Inventaris & Stok',
            route: 'medicines.index',
            roleAccess: 'Petugas Stok & Admin',
            icon: Pill,
            gradient: 'from-teal-600 to-cyan-500',
            bgLight: 'bg-teal-50 border-teal-200 text-teal-900',
            description:
                'Pengelolaan master data obat lengkap dengan manajemen nomor lot/batch, harga bertingkat, dan stiker barcode.',
            highlights: [
                'Scan barcode langsung saat input/edit obat lewat kamera perangkat.',
                'Generator barcode 12-digit otomatis untuk obat yang belum memiliki barcode kemasan pabrik.',
                'Cetak stiker barcode label (format roll printer thermal 50x30mm atau kertas A4 grid).',
                'Impor massal persediaan obat langsung dari file Excel (.xlsx / .csv).',
                'Pencatatan mutasi stok opname fisik, stok masuk, dan stok keluar.',
            ],
            shortcut: 'Tersedia tombol "Cetak Barcode" pada setiap baris obat.',
        },
        {
            id: 'prescriptions',
            title: 'Resep Dokter, Racikan & Cetak Etiket',
            category: 'Farmasi & Resep',
            route: 'prescriptions.index',
            roleAccess: 'Petugas Stok, Kasir & Admin',
            icon: FileText,
            gradient: 'from-indigo-600 to-purple-500',
            bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-900',
            description:
                'Manajemen resep dokter rawat jalan, resep racikan multi-komposisi (kapsul/sirup/puyer), serta pencetakan etiket aturan pakai.',
            highlights: [
                'Pencatatan nomor resep, nama dokter, dan data pasien.',
                'Dukungan formula racikan dengan pengurangan stok otomatis untuk setiap bahan obat.',
                'Cetak etiket aturan pakai instan untuk ditempelkan pada klip plastik obat.',
                'Integrasi 1-klik dengan Kasir: resep siap tebus langsung dimuat ke keranjang POS.',
            ],
            shortcut: 'Buka menu "Resep & Racikan" untuk melihat antrean resep.',
        },
        {
            id: 'expiries',
            title: 'Monitoring Kadaluarsa (FEFO) & Karantina',
            category: 'Keamanan Obat',
            route: 'expiries.index',
            roleAccess: 'Petugas Stok & Admin',
            icon: AlertTriangle,
            gradient: 'from-amber-500 to-orange-500',
            bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
            description:
                'Sistem peringatan dini otomatis untuk mencegah penjualan obat yang sudah lewat atau mendekati tanggal kadaluarsa.',
            highlights: [
                'Indikator warna risiko: Merah (Kritis <= 30 hari), Kuning (Waspada <= 90 hari), dan Biru (Aman).',
                'Tombol Karantina: Mengunci batch kadaluarsa agar otomatis tidak dapat dipilih atau dijual di kasir.',
                'Prioritas penjualan FEFO: batch kadaluarsa terdekat selalu otomatis dijual lebih dahulu.',
                'Ekspor rekap obat kadaluarsa ke file CSV untuk retur ke distributor/PBF.',
            ],
            shortcut: 'Badge peringatan stok kadaluarsa tampil di beranda dan menu samping.',
        },
        {
            id: 'reports',
            title: 'Laporan Laba Rugi & Rekap Penjualan',
            category: 'Laporan & Finansial',
            route: 'reports.profit-loss',
            roleAccess: 'Petugas Stok & Admin',
            icon: TrendingUp,
            gradient: 'from-rose-600 to-pink-500',
            bgLight: 'bg-rose-50 border-rose-200 text-rose-900',
            description:
                'Analisis keuangan komprehensif untuk memantau performa bisnis apotek secara transparan dan akurat.',
            highlights: [
                'Perhitungan otomatis HPP (Harga Pokok Penjualan) & Laba Kotor penjualan.',
                'Pencatatan buku kas masuk dan pengeluaran operasional apotek.',
                'Laba Bersih (Net Profit) terhitung otomatis dalam rentang tanggal fleksibel.',
                'Ekspor resmi ke format PDF siap cetak dan file spreadsheet Excel (.xlsx/.csv).',
            ],
            shortcut: 'Tersedia di menu Laporan -> Laba Rugi.',
        },
        {
            id: 'profile',
            title: 'Pengaturan Profil Apotek & Desain Struk',
            category: 'Pengaturan',
            route: 'pharmacy.profile',
            roleAccess: 'Khusus Admin Apotek',
            icon: Store,
            gradient: 'from-slate-800 to-slate-900',
            bgLight: 'bg-slate-100 border-slate-200 text-slate-900',
            description:
                'Pusat pengaturan identitas legal apotek, logo, kop surat, dan informasi yang dicetak pada struk belanja pelanggan.',
            highlights: [
                'Kustomisasi Nama Apotek, Tagline, Alamat, No. Telp, dan SIA / SIPA Apoteker.',
                'Unggah logo resmi apotek (otomatis tampil di halaman login, navbar, dan struk belanja).',
                'Kustomisasi pesan terima kasih atau catatan kaki pada struk belanja printer termal.',
            ],
            shortcut: 'Bisa diakses oleh Admin melalui menu samping "Profil Apotek".',
        },
        {
            id: 'pwa',
            title: 'Desain Responsif & Aplikasi PWA',
            category: 'Kemudahan Akses',
            route: 'dashboard',
            roleAccess: 'Semua Staf',
            icon: Smartphone,
            gradient: 'from-blue-600 to-indigo-600',
            bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
            description:
                'Aplikasi apotek dirancang mobile-first sehingga nyaman digunakan di HP, tablet kasir, maupun komputer desktop.',
            highlights: [
                'Dukungan PWA (Progressive Web App): bisa di-install langsung ke homescreen Android / iOS / Windows.',
                'Sidebar desktop yang bisa diciutkan (collapsible) untuk memaksimalkan ruang layar kerja.',
                'Bottom sheet menu khusus di ponsel dan tablet untuk navigasi satu jempol yang ergonomis.',
                'Tampilan login dioptimasi penuh di atas lipatan layar (above the fold) tanpa perlu scroll.',
            ],
            shortcut: 'Pilih "Tambahkan ke Layar Utama" di peramban ponsel Anda.',
        },
    ];

    if (!isOpen) return null;

    const step = tourSteps[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === tourSteps.length - 1;
    const StepIcon = step.icon;

    const handleNext = () => {
        if (!isLast) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-backdrop-fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                            <Compass className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                Tour & Panduan Fitur Apotek
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Panduan interaktif memahami seluruh modul sistem informasi apotek
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Tutup Panduan"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Quick Topic Chips (Jump to step anytime) */}
                <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/80 overflow-x-auto text-xs no-scrollbar">
                    {tourSteps.map((s, idx) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setCurrentStep(idx)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] whitespace-nowrap transition shrink-0 ${
                                currentStep === idx
                                    ? 'bg-slate-900 text-white shadow-2xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            {idx + 1}. {s.category}
                        </button>
                    ))}
                </div>

                {/* Tour Step Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                    {/* Step Hero Card */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div
                                className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${step.gradient} text-white shadow-md shrink-0`}
                            >
                                <StepIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                        Langkah {currentStep + 1} dari {tourSteps.length}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                                        {step.roleAccess}
                                    </span>
                                </div>
                                <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                                    {step.title}
                                </h4>
                            </div>
                        </div>

                        {/* Direct Jump Link to this feature */}
                        {route().has(step.route) && (
                            <Link
                                href={route(step.route)}
                                onClick={onClose}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs shrink-0 self-end sm:self-center"
                            >
                                <span>Buka Fitur</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                        )}
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {step.description}
                    </p>

                    {/* Capabilities & Highlights List */}
                    <div className="space-y-2">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Kemampuan Utama Modul:
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {step.highlights.map((item, hIdx) => (
                                <div
                                    key={hIdx}
                                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs text-slate-800"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Practical Tip / Shortcut */}
                    {step.shortcut && (
                        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                            <span className="font-extrabold shrink-0 px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950 text-[10px]">
                                TIPS
                            </span>
                            <span>{step.shortcut}</span>
                        </div>
                    )}
                </div>

                {/* Progress Indicator & Navigation Controls */}
                <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={isFirst}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    {/* Dot Progress Indicator */}
                    <div className="flex items-center gap-1.5">
                        {tourSteps.map((_, dotIdx) => (
                            <button
                                key={dotIdx}
                                type="button"
                                onClick={() => setCurrentStep(dotIdx)}
                                aria-label={`Ke langkah ${dotIdx + 1}`}
                                className={`h-2 rounded-full transition-all ${
                                    currentStep === dotIdx
                                        ? 'w-6 bg-emerald-600'
                                        : 'w-2 bg-slate-200 hover:bg-slate-300'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                        <span>{isLast ? 'Selesai & Tutup' : 'Selanjutnya'}</span>
                        {!isLast && <ArrowRight className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
