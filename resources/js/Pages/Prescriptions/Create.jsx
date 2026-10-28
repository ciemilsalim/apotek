import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    Coins,
    FileText,
    Pill,
    Plus,
    Stethoscope,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function PrescriptionCreate({ medicines = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        doctor_name: '',
        doctor_sip: '',
        patient_name: '',
        patient_age: '',
        patient_phone: '',
        prescription_date: new Date().toISOString().split('T')[0],
        type: 'racikan',
        notes: '',
        items: [
            {
                item_type: 'racikan',
                racikan_name: 'Puyer Racikan',
                racikan_type: 'puyer',
                quantity: 10,
                unit: 'Bungkus',
                signa: '3 x 1 bungkus sehari sesudah makan',
                service_fee: 5000,
                ingredients: [
                    {
                        medicine_id: medicines[0]?.id || '',
                        dosage: '1 tablet',
                        quantity: 5,
                    },
                ],
            },
        ],
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    // Calculate subtotal of medicine ingredients
    const getIngredientPrice = (medId) => {
        const med = medicines.find((m) => m.id === parseInt(medId));
        return med ? parseFloat(med.sell_price) : 0;
    };

    const calculateTotals = () => {
        let medicineTotal = 0;
        let serviceTotal = 0;

        data.items.forEach((item) => {
            serviceTotal += parseFloat(item.service_fee || 0);
            item.ingredients.forEach((ing) => {
                const price = getIngredientPrice(ing.medicine_id);
                medicineTotal += price * (parseInt(ing.quantity) || 0);
            });
        });

        return {
            medicineTotal,
            serviceTotal,
            grandTotal: medicineTotal + serviceTotal,
        };
    };

    const totals = calculateTotals();

    // Add new compound formula item
    const addFormulaItem = () => {
        setData('items', [
            ...data.items,
            {
                item_type: 'racikan',
                racikan_name: 'Puyer Racikan #' + (data.items.length + 1),
                racikan_type: 'puyer',
                quantity: 10,
                unit: 'Bungkus',
                signa: '3 x 1 bungkus sehari sesudah makan',
                service_fee: 5000,
                ingredients: [
                    {
                        medicine_id: medicines[0]?.id || '',
                        dosage: '1 tablet',
                        quantity: 5,
                    },
                ],
            },
        ]);
    };

    // Remove formula item
    const removeFormulaItem = (index) => {
        if (data.items.length <= 1) return;
        const newItems = data.items.filter((_, idx) => idx !== index);
        setData('items', newItems);
    };

    // Add ingredient to formula item
    const addIngredient = (itemIndex) => {
        const newItems = [...data.items];
        newItems[itemIndex].ingredients.push({
            medicine_id: medicines[0]?.id || '',
            dosage: '1 tablet',
            quantity: 5,
        });
        setData('items', newItems);
    };

    // Remove ingredient
    const removeIngredient = (itemIndex, ingIndex) => {
        const newItems = [...data.items];
        if (newItems[itemIndex].ingredients.length <= 1) return;
        newItems[itemIndex].ingredients = newItems[itemIndex].ingredients.filter(
            (_, idx) => idx !== ingIndex
        );
        setData('items', newItems);
    };

    // Update item field
    const updateItemField = (itemIndex, field, value) => {
        const newItems = [...data.items];
        newItems[itemIndex][field] = value;
        setData('items', newItems);
    };

    // Update ingredient field
    const updateIngredientField = (itemIndex, ingIndex, field, value) => {
        const newItems = [...data.items];
        newItems[itemIndex].ingredients[ingIndex][field] = value;
        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('prescriptions.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('prescriptions.index')}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Buat Resep Dokter & Racikan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Susun formula obat puyer, kapsul, atau salep klinik dengan pemotongan stok otomatis.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Buat Resep Racikan Baru - Apotek Sehat" />

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                {/* 1. Header Information: Dokter & Pasien */}
                <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-red-700">
                        <Stethoscope className="h-5 w-5" />
                        <h2 className="text-base font-extrabold text-slate-900">
                            1. Informasi Dokter & Pasien
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dokter */}
                        <div>
                            <InputLabel htmlFor="doctor_name" value="Nama Dokter Perujuk *" />
                            <TextInput
                                id="doctor_name"
                                type="text"
                                value={data.doctor_name}
                                onChange={(e) => setData('doctor_name', e.target.value)}
                                placeholder="dr. Budi Santoso, Sp.A"
                                className="mt-1 w-full text-xs"
                                required
                            />
                            <InputError message={errors.doctor_name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="doctor_sip" value="Nomor SIP Dokter (Opsional)" />
                            <TextInput
                                id="doctor_sip"
                                type="text"
                                value={data.doctor_sip}
                                onChange={(e) => setData('doctor_sip', e.target.value)}
                                placeholder="SIP: 446/123/DISKES/2025"
                                className="mt-1 w-full text-xs"
                            />
                        </div>

                        {/* Pasien */}
                        <div>
                            <InputLabel htmlFor="patient_name" value="Nama Pasien *" />
                            <TextInput
                                id="patient_name"
                                type="text"
                                value={data.patient_name}
                                onChange={(e) => setData('patient_name', e.target.value)}
                                placeholder="Ananda Rizky"
                                className="mt-1 w-full text-xs"
                                required
                            />
                            <InputError message={errors.patient_name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="patient_age" value="Usia / Berat Badan Pasien" />
                            <TextInput
                                id="patient_age"
                                type="text"
                                value={data.patient_age}
                                onChange={(e) => setData('patient_age', e.target.value)}
                                placeholder="Contoh: 5 Tahun (18 kg)"
                                className="mt-1 w-full text-xs"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="patient_phone" value="No. Telepon / WhatsApp Pasien" />
                            <TextInput
                                id="patient_phone"
                                type="text"
                                value={data.patient_phone}
                                onChange={(e) => setData('patient_phone', e.target.value)}
                                placeholder="081234567890"
                                className="mt-1 w-full text-xs"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="prescription_date" value="Tanggal Resep *" />
                            <TextInput
                                id="prescription_date"
                                type="date"
                                value={data.prescription_date}
                                onChange={(e) => setData('prescription_date', e.target.value)}
                                className="mt-1 w-full text-xs"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Compound Items & Formulas */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-700">
                            <Pill className="h-5 w-5" />
                            <h2 className="text-base font-extrabold text-slate-900">
                                2. Formula Racikan & Komposisi Obat
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={addFormulaItem}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 border border-red-200 hover:bg-red-100 transition"
                        >
                            <Plus className="h-4 w-4" />
                            <span>+ Tambah Formula Racikan Lain</span>
                        </button>
                    </div>

                    {data.items.map((item, itemIdx) => (
                        <div
                            key={itemIdx}
                            className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs relative"
                        >
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-[11px] font-black text-white">
                                        {itemIdx + 1}
                                    </span>
                                    <h3 className="font-extrabold text-sm text-slate-900">
                                        Formula Racikan #{itemIdx + 1}
                                    </h3>
                                </div>

                                {data.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFormulaItem(itemIdx)}
                                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Hapus Formula</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                <div className="sm:col-span-2">
                                    <InputLabel value="Nama Racikan *" />
                                    <TextInput
                                        type="text"
                                        value={item.racikan_name}
                                        onChange={(e) => updateItemField(itemIdx, 'racikan_name', e.target.value)}
                                        placeholder="Puyer Batuk Pilek Anak"
                                        className="mt-1 w-full text-xs"
                                        required
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Bentuk Sediaan" />
                                    <select
                                        value={item.racikan_type}
                                        onChange={(e) => updateItemField(itemIdx, 'racikan_type', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    >
                                        <option value="puyer">Puyer (Serbuk Terbagi)</option>
                                        <option value="kapsul">Kapsul Racikan</option>
                                        <option value="salep">Salep / Krim Campur</option>
                                        <option value="sirup">Sirup Racikan</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel value="Jumlah Dibuat & Satuan" />
                                    <div className="flex gap-2 mt-1">
                                        <TextInput
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItemField(itemIdx, 'quantity', e.target.value)}
                                            className="w-20 text-xs"
                                            required
                                        />
                                        <TextInput
                                            type="text"
                                            value={item.unit}
                                            onChange={(e) => updateItemField(itemIdx, 'unit', e.target.value)}
                                            className="flex-1 text-xs"
                                            placeholder="Bungkus"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3">
                                    <InputLabel value="Aturan Pakai / Signa *" />
                                    <TextInput
                                        type="text"
                                        value={item.signa}
                                        onChange={(e) => updateItemField(itemIdx, 'signa', e.target.value)}
                                        placeholder="3 x 1 bungkus sehari sesudah makan"
                                        className="mt-1 w-full text-xs"
                                        required
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Jasa Racik / Embalase (Rp)" />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        step="500"
                                        value={item.service_fee}
                                        onChange={(e) => updateItemField(itemIdx, 'service_fee', e.target.value)}
                                        className="mt-1 w-full text-xs"
                                    />
                                </div>
                            </div>

                            {/* Komposisi Bahan Obat */}
                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                        Komposisi Bahan Obat (Dipotong dari Stok Apotek)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => addIngredient(itemIdx)}
                                        className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>+ Tambah Bahan Obat</span>
                                    </button>
                                </div>

                                <div className="space-y-2.5">
                                    {item.ingredients.map((ing, ingIdx) => {
                                        const selectedMed = medicines.find((m) => m.id === parseInt(ing.medicine_id));
                                        const subtotal = selectedMed ? selectedMed.sell_price * ing.quantity : 0;

                                        return (
                                            <div
                                                key={ingIdx}
                                                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs"
                                            >
                                                {/* Medicine Selector */}
                                                <div className="flex-1">
                                                    <select
                                                        value={ing.medicine_id}
                                                        onChange={(e) =>
                                                            updateIngredientField(itemIdx, ingIdx, 'medicine_id', e.target.value)
                                                        }
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                                        required
                                                    >
                                                        {medicines.map((med) => (
                                                            <option key={med.id} value={med.id}>
                                                                {med.name} (Stok: {med.stock} {med.unit}) - {formatCurrency(med.sell_price)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Dosage input */}
                                                <div className="w-full sm:w-36">
                                                    <TextInput
                                                        type="text"
                                                        value={ing.dosage}
                                                        onChange={(e) =>
                                                            updateIngredientField(itemIdx, ingIdx, 'dosage', e.target.value)
                                                        }
                                                        placeholder="Dosis: 1/2 tab"
                                                        className="w-full text-xs"
                                                    />
                                                </div>

                                                {/* Quantity Taken From Stock */}
                                                <div className="flex items-center gap-1 w-full sm:w-32">
                                                    <TextInput
                                                        type="number"
                                                        min="1"
                                                        value={ing.quantity}
                                                        onChange={(e) =>
                                                            updateIngredientField(itemIdx, ingIdx, 'quantity', e.target.value)
                                                        }
                                                        className="w-16 text-xs text-center font-bold"
                                                        required
                                                    />
                                                    <span className="text-xs text-slate-500 truncate">
                                                        {selectedMed?.unit || 'Unit'}
                                                    </span>
                                                </div>

                                                {/* Subtotal */}
                                                <div className="w-28 text-right font-black text-xs text-slate-900">
                                                    {formatCurrency(subtotal)}
                                                </div>

                                                {/* Delete ingredient */}
                                                {item.ingredients.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeIngredient(itemIdx, ingIdx)}
                                                        className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Cost Summary & Action Buttons */}
                <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between sm:justify-start gap-4 text-slate-600">
                                <span>Total Biaya Obat:</span>
                                <strong className="text-slate-900">{formatCurrency(totals.medicineTotal)}</strong>
                            </div>
                            <div className="flex justify-between sm:justify-start gap-4 text-slate-600">
                                <span>Total Jasa Racik / Embalase:</span>
                                <strong className="text-slate-900">{formatCurrency(totals.serviceTotal)}</strong>
                            </div>
                            <div className="flex justify-between sm:justify-start gap-4 text-base font-black text-red-700 pt-1">
                                <span>Grand Total Resep:</span>
                                <span>{formatCurrency(totals.grandTotal)}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={route('prescriptions.index')}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-black text-white shadow-sm hover:bg-red-700 transition active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan & Proses Resep'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
