import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    CheckCircle,
    FileText,
    Image as ImageIcon,
    Mail,
    MapPin,
    Phone,
    Printer,
    Save,
    ShieldCheck,
    Store,
    UploadCloud,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';

export default function PharmacyProfile({ pharmacy }) {
    const [logoPreview, setLogoPreview] = useState(pharmacy.logo_url || null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: pharmacy.name || '',
        tagline: pharmacy.tagline || '',
        owner_name: pharmacy.owner_name || '',
        apa_name: pharmacy.apa_name || '',
        sipa_number: pharmacy.sipa_number || '',
        sia_number: pharmacy.sia_number || '',
        address: pharmacy.address || '',
        phone: pharmacy.phone || '',
        email: pharmacy.email || '',
        receipt_footer: pharmacy.receipt_footer || '',
        logo: null,
    });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.pharmacy.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                <Store className="w-3.5 h-3.5" />
                                Pengaturan Sistem
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                            Profil & Legalitas Apotek
                        </h1>
                        <p className="text-sm text-slate-500">
                            Kelola nama apotek, logo, legalitas SIPA/SIA, kontak, dan footer struk untuk laporan resmi.
                        </p>
                    </div>

                    {recentlySuccessful && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-semibold shadow-sm animate-fade-in">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Data profil apotek berhasil diperbarui!
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Profil & Legalitas Apotek" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Form Column (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Section 1: Identitas Utama */}
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-7">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Identitas & Nama Resmi
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Nama ini akan tercantum di kepala laporan, kop surat resep, dan struk kasir.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Nama Resmi Apotek <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 shadow-xs focus:border-red-500 focus:ring-red-500 text-sm font-semibold text-slate-900"
                                        placeholder="Contoh: Apotek Hibbatillah"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Slogan / Tagline
                                    </label>
                                    <input
                                        type="text"
                                        value={data.tagline}
                                        onChange={(e) => setData('tagline', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 shadow-xs focus:border-red-500 focus:ring-red-500 text-sm text-slate-900"
                                        placeholder="Contoh: Sahabat Sehat Keluarga Anda"
                                    />
                                    {errors.tagline && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.tagline}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Nomor Telepon / WhatsApp
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full pl-10 rounded-xl border-slate-300 shadow-xs focus:border-red-500 focus:ring-red-500 text-sm text-slate-900"
                                            placeholder="Contoh: 0812-3456-7890"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Email Apotek
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full pl-10 rounded-xl border-slate-300 shadow-xs focus:border-red-500 focus:ring-red-500 text-sm text-slate-900"
                                            placeholder="Contoh: kontak@apotekhibbatillah.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Alamat Lengkap Apotek
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                        <textarea
                                            rows={2}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="w-full pl-10 rounded-xl border-slate-300 shadow-xs focus:border-red-500 focus:ring-red-500 text-sm text-slate-900"
                                            placeholder="Contoh: Jl. Sudirman No. 123, Buol"
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.address}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Legalitas & Personalia */}
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-7">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Legalitas & Personalia Kefarmasian
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Dicantumkan pada lembar penandatanganan laporan keuangan, laba rugi, dan resep dokter.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Nama Pemilik Sarana Apotek (PSA)
                                    </label>
                                    <div className="relative">
                                        <UserCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            value={data.owner_name}
                                            onChange={(e) => setData('owner_name', e.target.value)}
                                            className="w-full pl-10 rounded-xl border-slate-300 shadow-xs focus:border-purple-500 focus:ring-purple-500 text-sm text-slate-900"
                                            placeholder="Contoh: H. Ahmad Santoso, S.E."
                                        />
                                    </div>
                                    {errors.owner_name && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.owner_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Apoteker Pengelola Apotek (APA)
                                    </label>
                                    <div className="relative">
                                        <UserCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            value={data.apa_name}
                                            onChange={(e) => setData('apa_name', e.target.value)}
                                            className="w-full pl-10 rounded-xl border-slate-300 shadow-xs focus:border-purple-500 focus:ring-purple-500 text-sm font-semibold text-slate-900"
                                            placeholder="Contoh: apt. Siti Nurhaliza, S.Farm."
                                        />
                                    </div>
                                    {errors.apa_name && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.apa_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Nomor SIPA (Surat Izin Praktik Apoteker)
                                    </label>
                                    <div className="relative">
                                        <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            value={data.sipa_number}
                                            onChange={(e) => setData('sipa_number', e.target.value)}
                                            className="w-full pl-10 rounded-xl border-slate-300 shadow-xs focus:border-purple-500 focus:ring-purple-500 text-sm text-slate-900 font-mono"
                                            placeholder="Contoh: 19850101/SIPA_32.73/2024/2001"
                                        />
                                    </div>
                                    {errors.sipa_number && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.sipa_number}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Nomor SIA / Izin Operasional
                                    </label>
                                    <div className="relative">
                                        <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            value={data.sia_number}
                                            onChange={(e) => setData('sia_number', e.target.value)}
                                            className="w-full pl-10 rounded-xl border-slate-300 shadow-xs focus:border-purple-500 focus:ring-purple-500 text-sm text-slate-900 font-mono"
                                            placeholder="Contoh: 503/001/SIA-DPMPTSP/2023"
                                        />
                                    </div>
                                    {errors.sia_number && (
                                        <p className="text-xs text-rose-600 mt-1 font-medium">{errors.sia_number}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Kustomisasi Struk Kasir */}
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-7">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                    <Printer className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Catatan Kaki Struk Kasir (Receipt Footer)
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Pesan atau kebijakan apotek yang tercetak di bagian paling bawah nota termal POS.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Teks Footer Struk
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.receipt_footer}
                                    onChange={(e) => setData('receipt_footer', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm text-slate-900"
                                    placeholder="Contoh: Terima Kasih Atas Kunjungan Anda&#10;Semoga Lekas Sembuh&#10;Barang yang sudah dibeli tidak dapat ditukar/dikembalikan"
                                />
                                <p className="text-xs text-slate-400 mt-1.5">
                                    Tip: Anda dapat menggunakan baris baru (enter) untuk memisahkan baris pesan ucapan.
                                </p>
                                {errors.receipt_footer && (
                                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.receipt_footer}</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-500/20 text-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Menyimpan Perubahan...' : 'Simpan Profil Apotek'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Logo Upload & Live Thermal Receipt Preview (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Logo Upload Card */}
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                                <ImageIcon className="w-4 h-4 text-red-600" />
                                <h3 className="text-sm font-bold text-slate-900">Logo Apotek</h3>
                            </div>

                            <div className="mt-4 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                {logoPreview ? (
                                    <div className="relative group">
                                        <img
                                            src={logoPreview}
                                            alt="Logo Apotek"
                                            className="h-28 w-28 object-contain rounded-xl border border-slate-200 bg-white p-2 shadow-xs"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-28 w-28 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                        <Building2 className="w-10 h-10 stroke-1 text-slate-300" />
                                        <span className="text-[11px] mt-1 font-medium">Belum ada logo</span>
                                    </div>
                                )}

                                <label className="mt-4 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors">
                                    <UploadCloud className="w-3.5 h-3.5 text-red-600" />
                                    <span>Pilih Gambar Logo</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/jpg"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-[11px] text-slate-400 mt-2 text-center">
                                    Format: PNG, JPG, WEBP. Maks 2MB. Disarankan berlatar transparan.
                                </p>
                                {errors.logo && (
                                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.logo}</p>
                                )}
                            </div>
                        </div>

                        {/* Live Thermal Receipt & Header Preview Card */}
                        <div className="bg-slate-900 text-white rounded-2xl shadow-md p-5 border border-slate-800">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Printer className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                                        Pratinjau Struk POS
                                    </span>
                                </div>
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                                    58mm Thermal
                                </span>
                            </div>

                            {/* White paper simulation */}
                            <div className="mt-4 bg-white text-slate-900 rounded-xl p-4 shadow-inner text-xs font-mono space-y-2">
                                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                                    {logoPreview && (
                                        <img
                                            src={logoPreview}
                                            alt="Preview"
                                            className="h-10 w-10 mx-auto object-contain mb-1"
                                        />
                                    )}
                                    <div className="font-black text-sm uppercase tracking-tight">
                                        {data.name || 'APOTEK SEHAT'}
                                    </div>
                                    {data.tagline && (
                                        <div className="text-[10px] text-slate-500 italic">{data.tagline}</div>
                                    )}
                                    <div className="text-[10px] text-slate-600 mt-0.5">
                                        {data.address || 'Jl. Farmasi Sehat No. 88'}
                                    </div>
                                    {data.phone && (
                                        <div className="text-[10px] text-slate-600">Telp: {data.phone}</div>
                                    )}
                                </div>

                                <div className="text-[10px] space-y-1 py-1 border-b border-dashed border-slate-300">
                                    <div className="flex justify-between">
                                        <span>No: #INV-20261028-001</span>
                                        <span>28/10/26</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Kasir: Budi Santoso</span>
                                        <span>10:30 WIB</span>
                                    </div>
                                </div>

                                <div className="text-[10px] space-y-1 py-1 border-b border-dashed border-slate-300">
                                    <div className="flex justify-between font-semibold">
                                        <span>1x Paracetamol 500mg</span>
                                        <span>15.000</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>1x Vitamin C 1000mg</span>
                                        <span>25.000</span>
                                    </div>
                                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                                        <span>TOTAL</span>
                                        <span>Rp 40.000</span>
                                    </div>
                                </div>

                                <div className="text-center text-[9px] text-slate-500 pt-1 whitespace-pre-line leading-relaxed">
                                    {data.receipt_footer || 'Terima kasih atas kunjungan Anda\nSemoga lekas sembuh'}
                                </div>
                            </div>
                        </div>

                        {/* Legal Signature Preview Card */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-slate-600">
                            <span className="font-bold text-slate-800 text-[11px] block uppercase tracking-wider mb-2">
                                Pratinjau Tanda Tangan Laporan
                            </span>
                            <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center space-y-3">
                                <p className="text-[10px] text-slate-400">
                                    {data.address ? data.address.split(',')[0] : 'Kota Apotek'}, 28 Oktober 2026
                                </p>
                                <p className="text-[10px] font-semibold text-slate-700">Apoteker Pengelola Apotek (APA)</p>
                                <div className="h-8 border-b border-dashed border-slate-300 w-36 mx-auto"></div>
                                <div>
                                    <p className="font-bold text-slate-900 text-xs">
                                        {data.apa_name || 'apt. Siti Nurhaliza, S.Farm.'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono">
                                        SIPA: {data.sipa_number || '19850101/SIPA_32.73/2024'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
