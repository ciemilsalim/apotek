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

    const roles = [
        {
            id: 'kasir',
            email: 'kasir@apotek.test',
            label: 'Kasir',
            desc: 'Penjualan & Struk',
            icon: ShoppingCart,
            activeClass: 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs',
            badgeClass: 'text-emerald-600',
            iconActive: 'bg-emerald-600 text-white shadow-2xs',
            iconInactive: 'bg-emerald-100 text-emerald-700',
        },
        {
            id: 'operator',
            email: 'operator@apotek.test',
            label: 'Petugas Stok',
            desc: 'Obat, Resep & FEFO',
            icon: Pill,
            activeClass: 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs',
            badgeClass: 'text-teal-600',
            iconActive: 'bg-teal-600 text-white shadow-2xs',
            iconInactive: 'bg-teal-100 text-teal-700',
        },
        {
            id: 'admin',
            email: 'admin@apotek.test',
            label: 'Admin Apotek',
            desc: 'Akses Penuh & Kas',
            icon: ShieldCheck,
            activeClass: 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs',
            badgeClass: 'text-purple-600',
            iconActive: 'bg-purple-600 text-white shadow-2xs',
            iconInactive: 'bg-purple-100 text-purple-700',
        },
    ];

    const handleSelectRole = (role) => {
        setSelectedRole(role.id);
        setData({
            email: role.email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <GuestLayout maxWidth="sm:max-w-xl">
            <Head title="Masuk Sistem - Apotek Sehat" />

            <div className="mb-4 sm:mb-5 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200/60 mb-2">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    <span>Sistem Informasi Farmasi & Kasir</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Masuk ke Sistem Apotek
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                    Pilih peran staf di bawah untuk isi otomatis, atau gunakan akun Anda.
                </p>
            </div>

            {/* Quick 1-Click Role Switcher */}
            <div className="mb-4 sm:mb-5 rounded-2xl bg-slate-50/90 p-3 sm:p-3.5 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Pilih Cepat Peran Staf (1-Klik)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-fill akun</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => {
                        const Icon = r.icon;
                        const isSelected = selectedRole === r.id;
                        return (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => handleSelectRole(r)}
                                className={`relative flex flex-col items-center sm:items-start text-center sm:text-left p-2 sm:p-2.5 rounded-xl transition border ${
                                    isSelected
                                        ? r.activeClass + ' bg-white'
                                        : 'border-slate-200 bg-white/80 hover:bg-white text-slate-700'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-2 w-full">
                                    <div
                                        className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg transition ${
                                            isSelected ? r.iconActive : r.iconInactive
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                                            {r.label}
                                        </div>
                                        <div className="text-[9.5px] text-slate-400 hidden sm:block truncate">
                                            {r.desc}
                                        </div>
                                    </div>
                                </div>
                                {isSelected && (
                                    <CheckCircle2 className={`h-3.5 w-3.5 ${r.badgeClass} hidden sm:block absolute top-2 right-2`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-3.5 text-xs">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block font-bold text-slate-700 mb-1">
                        Alamat Email Staf
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 shadow-2xs transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                        <label htmlFor="password" className="block font-bold text-slate-700">
                            Kata Sandi (Password)
                        </label>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 shadow-2xs transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition focus:outline-none"
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
                <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs font-medium text-slate-600">
                            Ingat sesi saya di perangkat ini
                        </span>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="pt-1.5">
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

            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400 border-t border-slate-100 pt-3.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Koneksi Aman & Akses Berbasis Peran Terlindungi</span>
            </div>
        </GuestLayout>
    );
}
