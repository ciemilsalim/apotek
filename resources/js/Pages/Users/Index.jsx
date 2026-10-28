import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Edit,
    Plus,
    Search,
    Shield,
    Trash2,
    User,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function UsersIndex({ users, filters, roles }) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            email: '',
            password: '',
            role: 'kasir',
            phone: '',
            is_active: true,
        });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('users.index'),
            { search, role: roleFilter },
            { preserveState: true },
        );
    };

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setData({
            name: '',
            email: '',
            password: '',
            role: 'kasir',
            phone: '',
            is_active: true,
        });
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            phone: user.phone || '',
            is_active: Boolean(user.is_active),
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route('users.update', editingUser.id), {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!userToDelete) return;
        router.delete(route('users.destroy', userToDelete.id), {
            onSuccess: () => setDeleteModalOpen(false),
        });
    };

    const roleBadge = (role) => {
        if (role === 'admin') {
            return (
                <span className="rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-black text-purple-700 border border-purple-200">
                    Admin
                </span>
            );
        }
        if (role === 'operator') {
            return (
                <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700 border border-blue-200">
                    Operator
                </span>
            );
        }
        return (
            <span className="rounded-lg bg-green-100 px-2.5 py-1 text-xs font-black text-green-700 border border-green-200">
                Kasir
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Manajemen Staf & Pengguna
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Kelola data akun staf apotek (Admin, Operator, dan Kasir)
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-xs hover:bg-red-700 transition"
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>Tambah Pengguna Baru</span>
                    </button>
                </div>
            }
        >
            <Head title="Kelola Staf - Apotek Sehat" />

            {/* Filter and Search Bar */}
            <div className="mb-6 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row gap-3 items-center justify-between"
                >
                    <div className="relative w-full sm:flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email staf..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 py-2.5 text-sm font-semibold focus:border-red-500 focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                router.get(
                                    route('users.index'),
                                    { search, role: e.target.value },
                                    { preserveState: true },
                                );
                            }}
                            className="rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-red-500 focus:outline-none"
                        >
                            <option value="">Semua Peran</option>
                            <option value="admin">Admin</option>
                            <option value="operator">Operator</option>
                            <option value="kasir">Kasir</option>
                        </select>

                        <button
                            type="submit"
                            className="rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-xs"
                        >
                            Cari
                        </button>
                    </div>
                </form>
            </div>

            {/* Mobile Card List (< 768px) */}
            <div className="block md:hidden space-y-3 mb-6">
                {users.data && users.data.length > 0 ? (
                    users.data.map((u) => (
                        <div
                            key={u.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 font-black text-slate-700 text-sm">
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-sm text-slate-900">
                                            {u.name}
                                        </div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </div>
                                </div>
                                {roleBadge(u.role)}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                <span className="text-slate-500">
                                    No. HP: <strong className="text-slate-800">{u.phone || '-'}</strong>
                                </span>
                                <div className="flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(u)}
                                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => confirmDelete(u)}
                                        className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        Tidak ada pengguna yang ditemukan.
                    </div>
                )}
            </div>

            {/* Tablet & Desktop Table (>= 768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-5 py-3.5">Nama Lengkap & Email</th>
                                <th className="px-5 py-3.5">Hak Akses (Role)</th>
                                <th className="px-5 py-3.5">Nomor HP</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {users.data && users.data.length > 0 ? (
                                users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                                        <td className="px-5 py-3.5">
                                            <div className="font-extrabold text-sm text-slate-900">
                                                {u.name}
                                            </div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                        </td>
                                        <td className="px-5 py-3.5">{roleBadge(u.role)}</td>
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">
                                            {u.phone || '-'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-block h-2 w-2 rounded-full mr-1.5 ${
                                                    u.is_active ? 'bg-green-500' : 'bg-slate-400'
                                                }`}
                                            />
                                            <span className="font-bold text-slate-700">
                                                {u.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(u)}
                                                    className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-red-700 transition-colors"
                                                    title="Ubah"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => confirmDelete(u)}
                                                    className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-xs text-slate-400 font-medium">
                                        Tidak ada data staf pengguna yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit User Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <h2 className="text-base font-extrabold text-slate-900">
                            {editingUser ? 'Ubah Data Staf' : 'Tambah Staf Baru'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-3.5 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold focus:border-red-500 focus:outline-none"
                                placeholder="Contoh: Rian Pratama"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold focus:border-red-500 focus:outline-none"
                                placeholder="email@apotek.test"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Peran Akun (Wewenang)
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold focus:border-red-500 focus:outline-none"
                                required
                            >
                                <option value="kasir">Kasir (Transaksi Penjualan)</option>
                                <option value="operator">Operator (Kelola Stok & Laporan)</option>
                                <option value="admin">Admin (Akses Penuh Seluruh Sistem)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                {editingUser ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi Akun'}
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold focus:border-red-500 focus:outline-none"
                                placeholder="Minimal 8 karakter"
                                required={!editingUser}
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Nomor HP / WA (Opsional)
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold focus:border-red-500 focus:outline-none"
                                placeholder="08123456789"
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
                            className="rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-red-700"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
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
                        Hapus Staf Ini?
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                        Apakah Anda yakin ingin menghapus akun <strong>{userToDelete?.name}</strong>?
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
