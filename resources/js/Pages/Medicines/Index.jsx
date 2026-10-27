import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    ClipboardList,
    Edit,
    Filter,
    MapPin,
    PackagePlus,
    Pill,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function MedicinesIndex({ medicines, categories, filters, units }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [status, setStatus] = useState(filters.status || 'all');

    // Create / Edit Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);

    // Restock Modal State
    const [restockModalOpen, setRestockModalOpen] = useState(false);
    const [targetMedicine, setTargetMedicine] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            code: '',
            name: '',
            generic_name: '',
            category_id: categories[0]?.id || '',
            unit: 'Strip',
            buy_price: '',
            sell_price: '',
            stock: 10,
            min_stock: 10,
            expiry_date: '',
            location: 'Rak A-1',
            description: '',
        });

    const restockForm = useForm({
        type: 'in',
        quantity: 10,
        notes: 'Penerimaan stok dari distributor',
    });

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
            route('medicines.index'),
            { search, category_id: categoryId, status },
            { preserveState: true },
        );
    };

    const handleQuickFilter = (newStatus) => {
        setStatus(newStatus);
        router.get(
            route('medicines.index'),
            { search, category_id: categoryId, status: newStatus },
            { preserveState: true },
        );
    };

    const openCreateModal = () => {
        setEditingMedicine(null);
        reset();
        clearErrors();
        setData({
            code: 'OBT-' + Math.floor(100 + Math.random() * 900),
            name: '',
            generic_name: '',
            category_id: categories[0]?.id || '',
            unit: 'Strip',
            buy_price: '',
            sell_price: '',
            stock: 10,
            min_stock: 10,
            expiry_date: '',
            location: 'Rak A-1',
            description: '',
        });
        setModalOpen(true);
    };

    const openEditModal = (med) => {
        setEditingMedicine(med);
        clearErrors();
        setData({
            code: med.code,
            name: med.name,
            generic_name: med.generic_name || '',
            category_id: med.category_id,
            unit: med.unit,
            buy_price: med.buy_price,
            sell_price: med.sell_price,
            stock: med.stock,
            min_stock: med.min_stock,
            expiry_date: med.expiry_date ? med.expiry_date.substring(0, 10) : '',
            location: med.location || '',
            description: med.description || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMedicine) {
            put(route('medicines.update', editingMedicine.id), {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post(route('medicines.store'), {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const openRestockModal = (med) => {
        setTargetMedicine(med);
        restockForm.reset();
        restockForm.clearErrors();
        restockForm.setData({
            type: 'in',
            quantity: 10,
            notes: 'Penerimaan stok dari distributor',
        });
        setRestockModalOpen(true);
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        if (!targetMedicine) return;
        restockForm.post(route('medicines.adjust-stock', targetMedicine.id), {
            onSuccess: () => setRestockModalOpen(false),
        });
    };

    const confirmDelete = (med) => {
        setMedicineToDelete(med);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!medicineToDelete) return;
        router.delete(route('medicines.destroy', medicineToDelete.id), {
            onSuccess: () => setDeleteModalOpen(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Data Obat & Persediaan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Kelola daftar obat, periksa stok fisik, dan tambah persediaan
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('medicines.adjustments')}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
                        >
                            <ClipboardList className="h-4 w-4" />
                            <span>Riwayat Mutasi</span>
                        </Link>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-xs hover:bg-emerald-700 transition"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Tambah Obat Baru</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Katalog Obat - Apotek Sehat" />

            {/* Quick Status Filter Tabs (Big touch targets for mobile) */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                    { id: 'all', label: 'Semua Obat' },
                    { id: 'low_stock', label: '⚠️ Stok Menipis' },
                    { id: 'out_of_stock', label: '❌ Stok Habis' },
                    { id: 'expiring', label: '📅 Hampir Kedaluwarsa' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleQuickFilter(tab.id)}
                        className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-extrabold border-2 transition ${
                            status === tab.id
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search and Category Filter Bar */}
            <div className="mb-6 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row gap-3 items-center justify-between"
                >
                    <div className="relative w-full sm:flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama obat, kode, atau kandungan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 py-2.5 text-sm font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                router.get(
                                    route('medicines.index'),
                                    { search, category_id: e.target.value, status },
                                    { preserveState: true },
                                );
                            }}
                            className="rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="rounded-2xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition"
                        >
                            Cari
                        </button>
                    </div>
                </form>
            </div>

            {/* Mobile View: Clean Medicine Cards (Screen < 768px) */}
            <div className="block md:hidden space-y-3 mb-6">
                {medicines.data && medicines.data.length > 0 ? (
                    medicines.data.map((med) => {
                        const isLow = med.stock <= med.min_stock;
                        const isOut = med.stock <= 0;

                        return (
                            <div
                                key={med.id}
                                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-base font-extrabold text-slate-900">
                                            {med.name}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                                            {med.code} • {med.category?.name || '-'}
                                        </div>
                                    </div>
                                    <span
                                        className={`rounded-xl px-2.5 py-1 text-xs font-black ${
                                            isOut
                                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                : isLow
                                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        }`}
                                    >
                                        Stok: {med.stock} {med.unit}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{med.location || 'Rak belum diatur'}</span>
                                    </div>
                                    <div className="font-black text-sm text-emerald-700">
                                        {formatCurrency(med.sell_price)}
                                    </div>
                                </div>

                                {/* Action Buttons for Mobile */}
                                <div className="flex items-center justify-between pt-1 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openRestockModal(med)}
                                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Tambah Stok</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(med)}
                                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100"
                                        title="Ubah Data"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => confirmDelete(med)}
                                        className="rounded-xl border border-rose-200 p-2.5 text-rose-600 hover:bg-rose-50"
                                        title="Hapus"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        Tidak ada data obat yang ditemukan.
                    </div>
                )}
            </div>

            {/* Tablet & Desktop View: Clean Flat Table (Screen >= 768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-400">
                            <tr>
                                <th className="px-5 py-4">Kode & Nama Obat</th>
                                <th className="px-5 py-4">Kategori & Posisi Rak</th>
                                <th className="px-5 py-4 text-right">Harga Jual</th>
                                <th className="px-5 py-4 text-center">Jumlah Stok</th>
                                <th className="px-5 py-4">Kedaluwarsa</th>
                                <th className="px-5 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {medicines.data && medicines.data.length > 0 ? (
                                medicines.data.map((med) => {
                                    const isLow = med.stock <= med.min_stock;
                                    const isOut = med.stock <= 0;

                                    return (
                                        <tr key={med.id} className="hover:bg-slate-50 transition">
                                            <td className="px-5 py-4">
                                                <div className="font-extrabold text-sm text-slate-900">
                                                    {med.name}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-mono">
                                                    {med.code} {med.generic_name && `• ${med.generic_name}`}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-800">
                                                    {med.category?.name || '-'}
                                                </div>
                                                <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{med.location || 'Belum diatur'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right font-black text-sm text-slate-900">
                                                {formatCurrency(med.sell_price)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span
                                                    className={`inline-block rounded-xl px-2.5 py-1 text-xs font-black ${
                                                        isOut
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : isLow
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-emerald-100 text-emerald-800'
                                                    }`}
                                                >
                                                    {med.stock} {med.unit}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {med.expiry_date ? (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>
                                                            {new Date(med.expiry_date).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openRestockModal(med)}
                                                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        <span>Tambah Stok</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(med)}
                                                        className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                                                        title="Ubah"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(med)}
                                                        className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-xs text-slate-400">
                                        Tidak ada data obat yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {medicines.links && medicines.links.length > 3 && (
                <div className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4 text-xs">
                    <div className="text-slate-500 font-medium">
                        Total {medicines.total} obat
                    </div>
                    <div className="flex gap-1">
                        {medicines.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-xl px-3 py-1.5 font-bold ${
                                    link.active
                                        ? 'bg-emerald-600 text-white'
                                        : link.url
                                        ? 'text-slate-700 hover:bg-slate-100'
                                        : 'text-slate-300 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Restock Modal (Extremely simple for orang awam) */}
            <Modal
                show={restockModalOpen}
                onClose={() => setRestockModalOpen(false)}
                maxWidth="sm"
            >
                <form onSubmit={handleRestockSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">
                                Tambah Stok Obat
                            </h2>
                            <p className="text-xs text-slate-500">
                                {targetMedicine?.name} (Stok Saat Ini: {targetMedicine?.stock} {targetMedicine?.unit})
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setRestockModalOpen(false)}
                            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Jumlah Stok yang Ditambahkan
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={restockForm.data.quantity}
                                onChange={(e) => restockForm.setData('quantity', e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 p-3 text-lg font-black text-slate-900 focus:border-emerald-600 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Catatan / Keterangan
                            </label>
                            <input
                                type="text"
                                value={restockForm.data.notes}
                                onChange={(e) => restockForm.setData('notes', e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 p-3 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                                placeholder="Penerimaan dari distributor"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setRestockModalOpen(false)}
                            className="rounded-2xl px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={restockForm.processing}
                            className="rounded-2xl bg-emerald-600 px-5 py-2.5 font-extrabold text-white shadow-xs hover:bg-emerald-700"
                        >
                            {restockForm.processing ? 'Menyimpan...' : 'Simpan Stok Masuk'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create / Edit Medicine Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <h2 className="text-base font-extrabold text-slate-900">
                            {editingMedicine ? 'Ubah Data Obat' : 'Tambah Obat Baru ke Apotek'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Kode Obat (Unik)
                            </label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-emerald-600 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Kategori Obat
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-emerald-600 focus:outline-none"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 mb-1">
                                Nama Obat / Merk
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-emerald-600 focus:outline-none"
                                placeholder="Contoh: Paracetamol 500mg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Satuan Kemasan
                            </label>
                            <select
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-emerald-600 focus:outline-none"
                                required
                            >
                                {units.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Lokasi Rak Penyimpanan
                            </label>
                            <input
                                type="text"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                                placeholder="Contoh: Rak A-1"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Harga Beli Pokok (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.buy_price}
                                onChange={(e) => setData('buy_price', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Harga Jual Konsumen (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.sell_price}
                                onChange={(e) => setData('sell_price', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-emerald-700 focus:border-emerald-600 focus:outline-none"
                                required
                            />
                        </div>

                        {!editingMedicine && (
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Stok Awal
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Batas Peringatan Stok Menipis
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.min_stock}
                                onChange={(e) => setData('min_stock', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Tanggal Kedaluwarsa
                            </label>
                            <input
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-2xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-700"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Data Obat'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <h3 className="text-base font-extrabold text-slate-900">
                        Hapus Obat Ini?
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                        Apakah Anda yakin ingin menghapus data obat <strong>{medicineToDelete?.name}</strong>?
                    </p>
                    <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
                        >
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
