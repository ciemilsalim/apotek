import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Edit,
    FolderPlus,
    Layers,
    Pill,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function CategoriesIndex({ categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            description: '',
        });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('categories.index'),
            { search },
            { preserveState: true },
        );
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setData({ name: '', description: '' });
        setModalOpen(true);
    };

    const openEditModal = (cat) => {
        setEditingCategory(cat);
        clearErrors();
        setData({
            name: cat.name,
            description: cat.description || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const confirmDelete = (cat) => {
        setCategoryToDelete(cat);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!categoryToDelete) return;
        router.delete(route('categories.destroy', categoryToDelete.id), {
            onSuccess: () => setDeleteModalOpen(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Kategori Obat
                        </h1>
                        <p className="text-xs text-slate-500">
                            Kelola klasifikasi dan pengelompokan jenis obat farmasi
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                    >
                        <FolderPlus className="h-4 w-4" />
                        <span>Tambah Kategori</span>
                    </button>
                </div>
            }
        >
            <Head title="Kategori Obat" />

            {/* Search Bar (Light Theme Consistent) */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama kategori atau deskripsi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-xs"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Standardized Unified Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-5 py-3.5">Nama Kategori</th>
                                <th className="px-5 py-3.5">Deskripsi</th>
                                <th className="px-5 py-3.5 text-center">Jumlah Obat</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {categories.data && categories.data.length > 0 ? (
                                categories.data.map((cat) => (
                                    <tr
                                        key={cat.id}
                                        className="hover:bg-slate-50/80 transition-colors duration-150"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700 font-bold shrink-0">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                                <div className="font-extrabold text-sm text-slate-900">
                                                    {cat.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                                            {cat.description || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                                                <Pill className="h-3 w-3 text-slate-400" />
                                                <span>{cat.medicines_count || 0} Obat</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-700 shadow-2xs transition"
                                                    title="Ubah kategori"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    <span>Ubah</span>
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(cat)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-2xs transition"
                                                    title="Hapus kategori"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span>Hapus</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="py-12 text-center text-xs text-slate-400"
                                    >
                                        <Layers className="mx-auto h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                                        <p className="font-semibold text-slate-600">Tidak ada kategori obat</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Silakan buat kategori obat baru untuk memulai</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {categories.links && categories.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs">
                        <div className="text-slate-500">
                            Menampilkan {categories.from || 0} - {categories.to || 0} dari{' '}
                            {categories.total} kategori
                        </div>
                        <div className="flex gap-1">
                            {categories.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-lg px-2.5 py-1 ${
                                        link.active
                                            ? 'bg-red-600 text-white font-bold'
                                            : link.url
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-slate-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Create/Edit */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900">
                            {editingCategory ? 'Ubah Kategori Obat' : 'Tambah Kategori Baru'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700">
                                Nama Kategori
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                                placeholder="Contoh: Salep & Kulit"
                                required
                            />
                            {errors.name && (
                                <div className="mt-1 text-rose-500">{errors.name}</div>
                            )}
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700">
                                Deskripsi / Catatan Kategori (Opsional)
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                                placeholder="Keterangan obat-obatan dalam kategori ini..."
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Delete */}
            <Modal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                        Hapus Kategori Ini?
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Apakah Anda yakin ingin menghapus kategori{' '}
                        <strong className="text-slate-900">
                            {categoryToDelete?.name}
                        </strong>
                        ? Kategori hanya dapat dihapus jika tidak ada obat yang terdaftar di dalamnya.
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                        >
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
