import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    LogIn,
    Mail,
    Pill,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('kasir');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'kasir@apotek.test',
        password: 'password',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleSelectRole = (role) => {
        setSelectedRole(role);
        if (role === 'kasir') {
            setData({
                email: 'kasir@apotek.test',
                password: 'password',
                remember: true,
            });
        } else if (role === 'operator') {
            setData({
                email: 'operator@apotek.test',
                password: 'password',
                remember: true,
            });
        } else if (role === 'admin') {
            setData({
                email: 'admin@apotek.test',
                password: 'password',
                remember: true,
            });
        }
    };

    return (
        <GuestLayout maxWidth="sm:max-w-xl">
            <Head title="Masuk Sistem - Apotek Sehat" />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200/60 mb-2">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    <span>Sistem Informasi Farmasi & Kasir</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Masuk ke Sistem Apotek
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                    Pilih peran staf di bawah untuk akses cepat, atau masukkan akun Anda.
                </p>
            </div>

            {/* Quick 1-Click Role Switcher */}
            <div className="mb-6 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Pilih Cepat Peran Staf (1-Klik)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Klik untuk isi otomatis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Role 1: Kasir */}
                    <button
                        type="button"
                        onClick={() => handleSelectRole('kasir')}
                        className={`group relative flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 rounded-xl p-3 text-left transition border ${
                            selectedRole === 'kasir'
                                ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-sm'
                                : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                        }`}
                    >
                        <div className="flex items-center sm:items-start gap-2.5 sm:w-full">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    selectedRole === 'kasir'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}
                            >
                                <ShoppingCart className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                    Kasir
                                </div>
                                <div className="text-[10px] text-slate-500 line-clamp-1">
                                    Penjualan & Struk
                                </div>
                            </div>
                        </div>
                        {selectedRole === 'kasir' && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 sm:absolute sm:top-2.5 sm:right-2.5" />
                        )}
                    </button>

                    {/* Role 2: Operator (Petugas Stok) */}
                    <button
                        type="button"
                        onClick={() => handleSelectRole('operator')}
                        className={`group relative flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 rounded-xl p-3 text-left transition border ${
                            selectedRole === 'operator'
                                ? 'border-teal-500 bg-white ring-2 ring-teal-500/20 shadow-sm'
                                : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                        }`}
                    >
                        <div className="flex items-center sm:items-start gap-2.5 sm:w-full">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    selectedRole === 'operator'
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-teal-100 text-teal-700'
                                }`}
                            >
                                <Pill className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                    Petugas Stok
                                </div>
                                <div className="text-[10px] text-slate-500 line-clamp-1">
                                    Obat, Resep & FEFO
                                </div>
                            </div>
                        </div>
                        {selectedRole === 'operator' && (
                            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 sm:absolute sm:top-2.5 sm:right-2.5" />
                        )}
                    </button>

                    {/* Role 3: Admin */}
                    <button
                        type="button"
                        onClick={() => handleSelectRole('admin')}
                        className={`group relative flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 rounded-xl p-3 text-left transition border ${
                            selectedRole === 'admin'
                                ? 'border-purple-500 bg-white ring-2 ring-purple-500/20 shadow-sm'
                                : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                        }`}
                    >
                        <div className="flex items-center sm:items-start gap-2.5 sm:w-full">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    selectedRole === 'admin'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-100 text-purple-700'
                                }`}
                            >
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                    Admin Apotek
                                </div>
                                <div className="text-[10px] text-slate-500 line-clamp-1">
                                    Akses Penuh & Kas
                                </div>
                            </div>
                        </div>
                        {selectedRole === 'admin' && (
                            <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 sm:absolute sm:top-2.5 sm:right-2.5" />
                        )}
                    </button>
                </div>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 text-xs">
                {/* Email Field */}
                <div>
                    <label className="block font-bold text-slate-700 mb-1">
                        Alamat Email Staf
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@apotek.test"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">
                            Kata Sandi (Password)
                        </label>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                            title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs font-medium text-slate-600">
                            Ingat sesi saya di komputer ini
                        </span>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-50"
                    >
                        <LogIn className="h-4 w-4" />
                        <span>{processing ? 'Memverifikasi Akun...' : 'Masuk ke Sistem Apotek'}</span>
                    </button>
                </div>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 border-t border-slate-100 pt-4">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Koneksi Aman & Akses Berbasis Peran Terlindungi</span>
            </div>
        </GuestLayout>
    );
}
