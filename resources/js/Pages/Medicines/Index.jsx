import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Boxes,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    Edit,
    Filter,
    Layers,
    MapPin,
    PackagePlus,
    Pill,
    Plus,
    Search,
    ShieldAlert,
    SlidersHorizontal,
    Tag,
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

    // Batch Management Modal State
    const [batchesModalOpen, setBatchesModalOpen] = useState(false);
    const [selectedMedicineForBatches, setSelectedMedicineForBatches] = useState(null);
    const [showAddBatchForm, setShowAddBatchForm] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);

    // Form for Create / Edit Medicine
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
            batch_number: '',
            expiry_date: '',
            location: 'Rak A-1',
            description: '',
        });

    // Form for Restock / Adjust Stock
    const restockForm = useForm({
        type: 'in',
        quantity: 10,
        notes: 'Penerimaan stok dari distributor',
        batch_mode: 'new', // 'new' or 'existing'
        batch_id: '',
        batch_number: '',
        expiry_date: '',
        buy_price: '',
    });

    // Form for Adding Batch directly
    const batchForm = useForm({
        batch_number: '',
        expiry_date: '',
        stock: 10,
        buy_price: '',
        notes: 'Penambahan batch baru',
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

    const generateBatchSuggestion = (medCode) => {
        const cleanCode = (medCode || 'MED').replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase();
        const now = new Date();
        const year = String(now.getFullYear()).substring(2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `B-${cleanCode}-${year}${month}`;
    };

    const openCreateModal = () => {
        setEditingMedicine(null);
        reset();
        clearErrors();
        const newCode = 'OBT-' + Math.floor(100 + Math.random() * 900);
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        setData({
            code: newCode,
            name: '',
            generic_name: '',
            category_id: categories[0]?.id || '',
            unit: 'Strip',
            buy_price: '',
            sell_price: '',
            stock: 10,
            min_stock: 10,
            batch_number: generateBatchSuggestion(newCode),
            expiry_date: nextYear.toISOString().substring(0, 10),
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
            batch_number: '',
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

        const hasBatches = med.batches && med.batches.length > 0;
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        restockForm.setData({
            type: 'in',
            quantity: 10,
            notes: 'Penerimaan stok dari distributor',
            batch_mode: hasBatches ? 'existing' : 'new',
            batch_id: hasBatches ? String(med.batches[0].id) : '',
            batch_number: generateBatchSuggestion(med.code),
            expiry_date: nextYear.toISOString().substring(0, 10),
            buy_price: med.buy_price || '',
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

    const openBatchesModal = (med) => {
        setSelectedMedicineForBatches(med);
        setShowAddBatchForm(false);
        batchForm.reset();
        batchForm.clearErrors();

        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        batchForm.setData({
            batch_number: generateBatchSuggestion(med.code),
            expiry_date: nextYear.toISOString().substring(0, 10),
            stock: 10,
            buy_price: med.buy_price || '',
            notes: 'Penambahan batch baru dari distributor',
        });
        setBatchesModalOpen(true);
    };

    const handleAddBatchSubmit = (e) => {
        e.preventDefault();
        if (!selectedMedicineForBatches) return;
        batchForm.post(route('medicines.batches.store', selectedMedicineForBatches.id), {
            onSuccess: () => {
                setShowAddBatchForm(false);
                setBatchesModalOpen(false);
            },
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

    // Helper to evaluate batch expiry badge
    const getBatchStatus = (batch) => {
        if (!batch.expiry_date) return { label: 'Tanpa Exp', color: 'bg-slate-100 text-slate-700' };
        const exp = new Date(batch.expiry_date);
        const now = new Date();
        const diffMonths = (exp - now) / (1000 * 60 * 60 * 24 * 30.44);

        if (exp < now) {
            return { label: 'Kadaluarsa', color: 'bg-rose-100 text-rose-800 border-rose-200' };
        } else if (diffMonths <= 3) {
            return { label: 'Segera Exp', color: 'bg-amber-100 text-amber-800 border-amber-200' };
        }
        return { label: 'Aman', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Data Obat, Stok & Batch
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Kelola persediaan obat, kontrol nomor batch, pantau kadaluarsa, dan alur FEFO
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
            <Head title="Katalog Obat & Batch - Apotek Sehat" />

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
                            placeholder="Cari nama obat, kode, nomor batch, atau lokasi rak..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 pl-11 pr-4 py-2.5 text-xs sm:text-sm font-semibold focus:border-emerald-600 focus:outline-none bg-slate-50/70"
                        />
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full sm:w-48 rounded-2xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none bg-white"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-emerald-700 transition shadow-xs"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Mobile View: High Contrast Flat Cards (Screen < 768px) */}
            <div className="grid grid-cols-1 gap-3 md:hidden mb-6">
                {medicines.data && medicines.data.length > 0 ? (
                    medicines.data.map((med) => {
                        const isLow = med.stock <= med.min_stock;
                        const isOut = med.stock <= 0;
                        const batchesCount = med.batches?.length || 0;

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

                                {/* Batch & Expiry Info on Mobile */}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => openBatchesModal(med)}
                                        className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-emerald-700"
                                    >
                                        <Boxes className="h-4 w-4 text-emerald-600" />
                                        <span>{batchesCount} Batch</span>
                                        <span className="text-[10px] text-emerald-600 font-semibold underline">
                                            (Kelola)
                                        </span>
                                    </button>
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
                                        <span>Mutasi Stok</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openBatchesModal(med)}
                                        className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100"
                                        title="Detail Batch"
                                    >
                                        <Boxes className="h-4 w-4" />
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

            {/* Standardized Unified Table (Screen >= 768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-5 py-3.5">Kode & Nama Obat</th>
                                <th className="px-5 py-3.5">Kategori & Rak</th>
                                <th className="px-5 py-3.5 text-center">Batch Obat</th>
                                <th className="px-5 py-3.5 text-right">Harga Jual</th>
                                <th className="px-5 py-3.5 text-center">Total Stok</th>
                                <th className="px-5 py-3.5">Exp Terdekat (FEFO)</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {medicines.data && medicines.data.length > 0 ? (
                                medicines.data.map((med) => {
                                    const isLow = med.stock <= med.min_stock;
                                    const isOut = med.stock <= 0;
                                    const batches = med.batches || [];
                                    const activeBatchesCount = batches.filter((b) => b.current_stock > 0).length;

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
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openBatchesModal(med)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition"
                                                    title="Kelola Batch Obat"
                                                >
                                                    <Boxes className="h-3.5 w-3.5 text-emerald-600" />
                                                    <span>{batches.length} Batch</span>
                                                    {activeBatchesCount > 0 && (
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    )}
                                                </button>
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
                                                        <span className="font-semibold">
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
                                                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs"
                                                        title="Mutasi Stok & Batch"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        <span>Mutasi</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openBatchesModal(med)}
                                                        className="rounded-xl border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-100"
                                                        title="Kelola Batch"
                                                    >
                                                        <Boxes className="h-4 w-4" />
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
                                    <td colSpan="7" className="py-12 text-center text-xs text-slate-400">
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

            {/* Restock & Mutasi Stok Modal (Supports Batches & FEFO) */}
            <Modal
                show={restockModalOpen}
                onClose={() => setRestockModalOpen(false)}
                maxWidth="md"
            >
                <form onSubmit={handleRestockSubmit} className="flex flex-col max-h-[88vh]">
                    <div className="shrink-0 p-5 border-b border-slate-200 bg-white flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">
                                Mutasi Persediaan & Batch Obat
                            </h2>
                            <p className="text-xs text-slate-500">
                                {targetMedicine?.name} (Total Stok: {targetMedicine?.stock} {targetMedicine?.unit})
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setRestockModalOpen(false)}
                            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                        {/* Type of Adjustment */}
                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">
                                Jenis Mutasi Stok
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'in', label: 'Stok Masuk (+)', icon: ArrowDownRight },
                                    { id: 'out', label: 'Stok Keluar (-)', icon: ArrowUpRight },
                                    { id: 'adjustment', label: 'Opname Fisik', icon: SlidersHorizontal },
                                ].map((t) => {
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => restockForm.setData('type', t.id)}
                                            className={`flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl font-bold border-2 transition ${
                                                restockForm.data.type === t.id
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            <span>{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Batch Options for Stok Masuk */}
                        {restockForm.data.type === 'in' && (
                            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-3">
                                <label className="block font-bold text-slate-700">
                                    Alokasi Nomor Batch
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => restockForm.setData('batch_mode', 'new')}
                                        className={`py-2 px-3 rounded-xl font-extrabold text-xs border transition ${
                                            restockForm.data.batch_mode === 'new'
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        + Buat Batch Baru
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => restockForm.setData('batch_mode', 'existing')}
                                        disabled={!targetMedicine?.batches || targetMedicine.batches.length === 0}
                                        className={`py-2 px-3 rounded-xl font-extrabold text-xs border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                            restockForm.data.batch_mode === 'existing'
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        Pilih Batch Yang Ada ({targetMedicine?.batches?.length || 0})
                                    </button>
                                </div>

                                {restockForm.data.batch_mode === 'new' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div>
                                            <label className="block font-semibold text-slate-600 mb-1">
                                                Nomor Batch Baru
                                            </label>
                                            <input
                                                type="text"
                                                value={restockForm.data.batch_number}
                                                onChange={(e) => restockForm.setData('batch_number', e.target.value)}
                                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-emerald-600 focus:outline-none bg-white"
                                                placeholder="Contoh: B-PCT-2601"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-600 mb-1">
                                                Tanggal Kadaluarsa Batch
                                            </label>
                                            <input
                                                type="date"
                                                value={restockForm.data.expiry_date}
                                                onChange={(e) => restockForm.setData('expiry_date', e.target.value)}
                                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none bg-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block font-semibold text-slate-600 mb-1">
                                            Pilih Batch Penerima
                                        </label>
                                        <select
                                            value={restockForm.data.batch_id}
                                            onChange={(e) => restockForm.setData('batch_id', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none bg-white"
                                            required
                                        >
                                            {targetMedicine?.batches?.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.batch_number} (Sisa: {b.current_stock} {targetMedicine.unit} • Exp: {b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('id-ID') : '-'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Batch Options for Stok Keluar */}
                        {restockForm.data.type === 'out' && targetMedicine?.batches?.length > 0 && (
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Pilih Batch yang Dikurangi (Opsional - Default FEFO)
                                </label>
                                <select
                                    value={restockForm.data.batch_id}
                                    onChange={(e) => restockForm.setData('batch_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none bg-white"
                                >
                                    <option value="">Otomatis FEFO (Kadaluarsa Terdekat)</option>
                                    {targetMedicine?.batches?.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            Batch {b.batch_number} (Stok: {b.current_stock} • Exp: {b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('id-ID') : '-'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                {restockForm.data.type === 'adjustment'
                                    ? 'Target Stok Fisik Hasil Opname'
                                    : 'Jumlah Kuantitas (' + (targetMedicine?.unit || 'Item') + ')'}
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

                        {/* Notes */}
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Catatan / Keterangan Mutasi
                            </label>
                            <input
                                type="text"
                                value={restockForm.data.notes}
                                onChange={(e) => restockForm.setData('notes', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                                placeholder="Contoh: Penerimaan dari PBF Kimia Farma"
                                required
                            />
                        </div>
                    </div>

                    <div className="shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setRestockModalOpen(false)}
                            className="rounded-xl px-4 py-2 font-bold text-slate-600 hover:bg-slate-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={restockForm.processing}
                            className="rounded-xl bg-emerald-600 px-5 py-2.5 font-extrabold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                            {restockForm.processing ? 'Menyimpan...' : 'Simpan Mutasi'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Batch Details & Management Modal */}
            <Modal
                show={batchesModalOpen}
                onClose={() => setBatchesModalOpen(false)}
                maxWidth="lg"
            >
                <div className="flex flex-col max-h-[88vh]">
                    <div className="shrink-0 p-5 border-b border-slate-200 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <Boxes className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    Daftar Batch: {selectedMedicineForBatches?.name}
                                </h2>
                                <p className="text-xs text-slate-500 font-mono">
                                    {selectedMedicineForBatches?.code} • Total Stok: {selectedMedicineForBatches?.stock} {selectedMedicineForBatches?.unit}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setBatchesModalOpen(false)}
                            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                                Batch Aktif & Riwayat Lot
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowAddBatchForm(!showAddBatchForm)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>{showAddBatchForm ? 'Tutup Form' : 'Tambah Batch Baru'}</span>
                            </button>
                        </div>

                        {/* Inline Add Batch Form */}
                        {showAddBatchForm && (
                            <form
                                onSubmit={handleAddBatchSubmit}
                                className="p-4 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200 space-y-3 animate-fade-in"
                            >
                                <div className="font-extrabold text-emerald-900">
                                    Form Input Batch Baru
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Nomor Batch / Lot
                                        </label>
                                        <input
                                            type="text"
                                            value={batchForm.data.batch_number}
                                            onChange={(e) => batchForm.setData('batch_number', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold bg-white focus:border-emerald-600 focus:outline-none"
                                            placeholder="Contoh: B-PCT-2601"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Tanggal Kadaluarsa
                                        </label>
                                        <input
                                            type="date"
                                            value={batchForm.data.expiry_date}
                                            onChange={(e) => batchForm.setData('expiry_date', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white focus:border-emerald-600 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Jumlah Stok Batch
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={batchForm.data.stock}
                                            onChange={(e) => batchForm.setData('stock', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-black bg-white focus:border-emerald-600 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Harga Beli Satuan (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={batchForm.data.buy_price}
                                            onChange={(e) => batchForm.setData('buy_price', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white focus:border-emerald-600 focus:outline-none"
                                            placeholder="Gunakan harga beli standar obat"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddBatchForm(false)}
                                        className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={batchForm.processing}
                                        className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-700"
                                    >
                                        {batchForm.processing ? 'Menyimpan...' : 'Simpan Batch'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Batches Table */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                            <table className="min-w-full text-left text-xs">
                                <thead className="border-b border-slate-200/80 bg-slate-50/90 font-extrabold uppercase text-slate-600 text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">No. Batch</th>
                                        <th className="px-4 py-3">Tanggal Exp</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Sisa Stok</th>
                                        <th className="px-4 py-3 text-right">Harga Beli</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                    {selectedMedicineForBatches?.batches && selectedMedicineForBatches.batches.length > 0 ? (
                                        selectedMedicineForBatches.batches.map((b) => {
                                            const statusInfo = getBatchStatus(b);
                                            return (
                                                <tr key={b.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                        {b.batch_number}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('id-ID') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold border ${statusInfo.color}`}
                                                        >
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-slate-900">
                                                        {b.current_stock} / {b.initial_stock} {selectedMedicineForBatches.unit}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                                                        {formatCurrency(b.buy_price)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-400">
                                                Belum ada batch terdaftar untuk obat ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => setBatchesModalOpen(false)}
                            className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white text-xs hover:bg-slate-800"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Create / Edit Medicine Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[88vh]">
                    <div className="shrink-0 p-5 border-b border-slate-200 bg-white flex items-center justify-between">
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

                    <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Kode Obat (Barcode / SKU)
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
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-emerald-600 focus:outline-none bg-white"
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
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-emerald-600 focus:outline-none bg-white"
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
                            <>
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

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Nomor Batch Awal
                                    </label>
                                    <input
                                        type="text"
                                        value={data.batch_number}
                                        onChange={(e) => setData('batch_number', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-emerald-600 focus:outline-none"
                                        placeholder="Contoh: B-MED-2601"
                                    />
                                </div>
                            </>
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

                    <div className="shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
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
