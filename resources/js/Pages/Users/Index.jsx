import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Edit,
    KeyRound,
    Mail,
    Phone,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCheck,
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
            password: '', // optional on update
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
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    Admin
                </span>
            );
        }
        if (role === 'operator') {
            return (
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    Operator
                </span>
            );
        }
        return (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Kasir
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Manajemen Pengguna
                        </h1>
                        <p className="text-xs text-slate-500">
                            Kelola hak akses dan akun staf (Admin, Operator, Kasir)
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>Tambah Pengguna</span>
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Pengguna" />

            {/* Filter and Search Bar */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row gap-3 items-center justify-between"
                >
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, nomor HP..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900"
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
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                        >
                            <option value="">Semua Peran</option>
                            <option value="admin">Admin</option>
                            <option value="operator">Operator</option>
                            <option value="kasir">Kasir</option>
                        </select>

                        <button
                            type="submit"
                            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            Cari
                        </button>
                    </div>
                </form>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/75 font-semibold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-5 py-3.5">Nama & Email</th>
                                <th className="px-5 py-3.5">Peran</th>
                                <th className="px-5 py-3.5">No. Telepon</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5">Terdaftar</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {users.data && users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold dark:bg-slate-800 dark:text-slate-300">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {roleBadge(user.role)}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-block h-2 w-2 rounded-full mr-1.5 ${
                                                    user.is_active
                                                        ? 'bg-emerald-500'
                                                        : 'bg-slate-400'
                                                }`}
                                            />
                                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                                    title="Ubah data"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(user)}
                                                    className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                                    title="Hapus pengguna"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="py-10 text-center text-xs text-slate-400"
                                    >
                                        Tidak ada data pengguna yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs dark:border-slate-800">
                        <div className="text-slate-500">
                            Menampilkan {users.from || 0} - {users.to || 0} dari{' '}
                            {users.total} pengguna
                        </div>
                        <div className="flex gap-1">
                            {users.links.map((link, idx) => (
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

            {/* Create / Edit Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            {editingUser ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                        {/* Name */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="Contoh: Budi Santoso"
                                required
                            />
                            {errors.name && (
                                <div className="mt-1 text-rose-500">{errors.name}</div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="email@apotek.test"
                                required
                            />
                            {errors.email && (
                                <div className="mt-1 text-rose-500">{errors.email}</div>
                            )}
                        </div>

                        {/* Role selection */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Peran / Hak Akses (Role)
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                required
                            >
                                <option value="admin">Admin (Manajemen User, Stok, POS, Laporan)</option>
                                <option value="operator">Operator (Kelola Stok Obat & Laporan Penjualan)</option>
                                <option value="kasir">Kasir (Transaksi Penjualan POS)</option>
                            </select>
                            {errors.role && (
                                <div className="mt-1 text-rose-500">{errors.role}</div>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                {editingUser
                                    ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)'
                                    : 'Kata Sandi'}
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="Minimal 8 karakter"
                                required={!editingUser}
                            />
                            {errors.password && (
                                <div className="mt-1 text-rose-500">{errors.password}</div>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                Nomor Telepon / WA (Opsional)
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                placeholder="08123456789"
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
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
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
                        Hapus Pengguna Ini?
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Apakah Anda yakin ingin menghapus akun pengguna{' '}
                        <strong className="text-slate-900 dark:text-white">
                            {userToDelete?.name}
                        </strong>
                        ? Tindakan ini tidak dapat dibatalkan.
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
                            Ya, Hapus Pengguna
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
