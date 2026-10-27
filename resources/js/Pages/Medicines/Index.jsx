import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    ClipboardList,
    DollarSign,
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

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        code: '',
        name: '',
        generic_name: '',
        category_id: categories[0]?.id || '',
        unit: 'Strip',
        buy_price: '',
        sell_price: '',
        stock: 0,
        min_stock: 10,
        expiry_date: '',
        location: '',
        description: '',
    });

    const restockForm = useForm({
        type: 'in', // 'in', 'out', 'adjustment'
        quantity: 10,
        notes: '',
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
            notes: 'Penerimaan stok obat dari distributor',
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
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Data Obat & Manajemen Stok
                        </h1>
                        <p className="text-xs text-slate-500">
                            Kelola katalog farmasi, penyesuaian stok, dan pemantauan masa kedaluwarsa
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('medicines.adjustments')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <ClipboardList className="h-3.5 w-3.5" />
                            <span>Riwayat Stok</span>
                        </Link>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                        >
                            <PackagePlus className="h-4 w-4" />
                            <span>Tambah Obat</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Data Obat & Stok" />

            {/* Filter Bar */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col lg:flex-row gap-3 items-center justify-between"
                >
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kode obat, nama, kandungan, rak..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        />
                    </div>

                    <div className="flex flex-wrap w-full lg:w-auto items-center gap-2">
                        {/* Category filter */}
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
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Status filter */}
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                router.get(
                                    route('medicines.index'),
                                    { search, category_id: categoryId, status: e.target.value },
                                    { preserveState: true },
                                );
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        >
                            <option value="all">Semua Status Stok</option>
                            <option value="low_stock">Stok Menipis (Kritis)</option>
                            <option value="out_of_stock">Stok Habis (0)</option>
                            <option value="expiring">Mendekati Kedaluwarsa</option>
                        </select>

                        <button
                            type="submit"
                            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            Terapkan
                        </button>
                    </div>
                </form>
            </div>

            {/* Medicines Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/75 font-semibold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-5 py-3.5">Kode & Nama Obat</th>
                                <th className="px-5 py-3.5">Kategori & Lokasi</th>
                                <th className="px-5 py-3.5 text-right">Harga Beli</th>
                                <th className="px-5 py-3.5 text-right">Harga Jual</th>
                                <th className="px-5 py-3.5 text-center">Stok</th>
                                <th className="px-5 py-3.5">Kedaluwarsa</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {medicines.data && medicines.data.length > 0 ? (
                                medicines.data.map((med) => {
                                    const isLow = med.stock <= med.min_stock;
                                    const isOut = med.stock <= 0;
                                    return (
                                        <tr
                                            key={med.id}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-950/60 dark:text-emerald-300">
                                                        <Pill className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">
                                                            {med.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                                            <span className="font-mono font-semibold text-emerald-600">
                                                                {med.code}
                                                            </span>
                                                            {med.generic_name && (
                                                                <span>• {med.generic_name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                                    {med.category?.name || '-'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-slate-400" />
                                                    <span>{med.location || 'Belum diatur'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-slate-500">
                                                {formatCurrency(med.buy_price)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(med.sell_price)}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                                                            isOut
                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                                                : isLow
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        }`}
                                                    >
                                                        {med.stock} {med.unit}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">
                                                        Min: {med.min_stock}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {med.expiry_date ? (
                                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                        <Calendar className="h-3 w-3 text-slate-400" />
                                                        <span>
                                                            {new Date(med.expiry_date).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Restock Button */}
                                                    <button
                                                        onClick={() => openRestockModal(med)}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 transition dark:bg-teal-950/40 dark:text-teal-300"
                                                        title="Atur / Tambah Stok"
                                                    >
                                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                                        <span>Stok</span>
                                                    </button>
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => openEditModal(med)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                                        title="Ubah Data Obat"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => confirmDelete(med)}
                                                        className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                                        title="Hapus Obat"
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
                                    <td
                                        colSpan="7"
                                        className="py-12 text-center text-xs text-slate-400"
                                    >
                                        Tidak ada data obat yang sesuai dengan filter pencarian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {medicines.links && medicines.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs dark:border-slate-800">
                        <div className="text-slate-500">
                            Menampilkan {medicines.from || 0} - {medicines.to || 0} dari{' '}
                            {medicines.total} obat
                        </div>
                        <div className="flex gap-1">
                            {medicines.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-lg px-2.5 py-1 ${
                                        link.active
                                            ? 'bg-emerald-600 text-white font-bold'
                                            : link.url
                                            ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                            : 'text-slate-300 cursor-not-allowed dark:text-slate-700'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit Medicine Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Pill className="h-5 w-5 text-emerald-600" />
                            <span>{editingMedicine ? 'Ubah Data Obat' : 'Tambah Obat Baru'}</span>
                        </h2>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Code */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Kode Obat (Unik)
                            </label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 font-mono font-bold"
                                placeholder="Contoh: OBT-009"
                                required
                            />
                            {errors.code && (
                                <div className="mt-1 text-rose-500">{errors.code}</div>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Kategori Obat
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Nama Obat / Merk Dagang
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="Contoh: Panadol Extra 500mg"
                                required
                            />
                            {errors.name && (
                                <div className="mt-1 text-rose-500">{errors.name}</div>
                            )}
                        </div>

                        {/* Generic Name */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Nama Generik / Kandungan
                            </label>
                            <input
                                type="text"
                                value={data.generic_name}
                                onChange={(e) => setData('generic_name', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="Contoh: Paracetamol 500mg, Kafein 65mg"
                            />
                        </div>

                        {/* Unit */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Satuan Kemasan
                            </label>
                            <select
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                required
                            >
                                {units.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Posisi Rak / Tempat Penyimpanan
                            </label>
                            <input
                                type="text"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="Contoh: Rak B-3, Kulkas Suhu 2-8°C"
                            />
                        </div>

                        {/* Buy Price */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Harga Beli Pokok (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.buy_price}
                                onChange={(e) => setData('buy_price', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="0"
                                required
                            />
                            {errors.buy_price && (
                                <div className="mt-1 text-rose-500">{errors.buy_price}</div>
                            )}
                        </div>

                        {/* Sell Price */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Harga Jual Konsumen (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.sell_price}
                                onChange={(e) => setData('sell_price', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="0"
                                required
                            />
                            {errors.sell_price && (
                                <div className="mt-1 text-rose-500">{errors.sell_price}</div>
                            )}
                        </div>

                        {/* Initial Stock (Only on create) */}
                        {!editingMedicine && (
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                    Stok Awal
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                    required
                                />
                            </div>
                        )}

                        {/* Minimum Stock Alert */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Batas Minimum Stok (Peringatan Kritis)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.min_stock}
                                onChange={(e) => setData('min_stock', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                required
                            />
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Tanggal Kedaluwarsa (Expired)
                            </label>
                            <input
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Catatan / Indikasi / Aturan Pakai (Opsional)
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={2}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="Indikasi pemakaian, efek samping, dosis umum..."
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Data Obat'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Quick Restock / Adjust Stock Modal */}
            <Modal
                show={restockModalOpen}
                onClose={() => setRestockModalOpen(false)}
                maxWidth="md"
            >
                <form onSubmit={handleRestockSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Atur / Tambah Stok Obat
                            </h2>
                            <p className="text-xs text-slate-500">
                                {targetMedicine?.name} ({targetMedicine?.code}) • Saat ini: {targetMedicine?.stock} {targetMedicine?.unit}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setRestockModalOpen(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Jenis Penyesuaian
                            </label>
                            <select
                                value={restockForm.data.type}
                                onChange={(e) => restockForm.setData('type', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                required
                            >
                                <option value="in">Stok Masuk / Restock (+ Tambah)</option>
                                <option value="out">Stok Keluar / Rusak / Hilang (- Kurang)</option>
                                <option value="adjustment">Koreksi Fisik (Set Nilai Total)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                {restockForm.data.type === 'adjustment'
                                    ? 'Total Stok Hasil Opname Fisik'
                                    : 'Jumlah Kuantitas (' + (targetMedicine?.unit || 'Item') + ')'}
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={restockForm.data.quantity}
                                onChange={(e) => restockForm.setData('quantity', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                required
                            />
                            {restockForm.errors.quantity && (
                                <div className="mt-1 text-rose-500">{restockForm.errors.quantity}</div>
                            )}
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Keterangan / Alasan Penyesuaian
                            </label>
                            <input
                                type="text"
                                value={restockForm.data.notes}
                                onChange={(e) => restockForm.setData('notes', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="Contoh: Penerimaan faktur suplier no #1234"
                                required
                            />
                            {restockForm.errors.notes && (
                                <div className="mt-1 text-rose-500">{restockForm.errors.notes}</div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setRestockModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={restockForm.processing}
                            className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition disabled:opacity-50"
                        >
                            {restockForm.processing ? 'Menyimpan...' : 'Simpan Penyesuaian'}
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 dark:bg-rose-950/60 dark:text-rose-400">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Hapus Data Obat?
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Apakah Anda yakin ingin menghapus data obat{' '}
                        <strong className="text-slate-900 dark:text-white">
                            {medicineToDelete?.name}
                        </strong>
                        ? Data obat yang pernah digunakan dalam transaksi penjualan tidak dapat dihapus.
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                        >
                            Ya, Hapus Obat
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
