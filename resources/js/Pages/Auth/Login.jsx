import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { KeyRound, Lock, LogIn, Mail, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'admin@apotek.test',
        password: 'password',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillCredentials = (role) => {
        if (role === 'admin') {
            setData({
                email: 'admin@apotek.test',
                password: 'password',
                remember: true,
            });
        } else if (role === 'operator') {
            setData({
                email: 'operator@apotek.test',
                password: 'password',
                remember: true,
            });
        } else if (role === 'kasir') {
            setData({
                email: 'kasir@apotek.test',
                password: 'password',
                remember: true,
            });
        }
    };

    return (
        <GuestLayout>
            <Head title="Masuk Sistem - Apotek Sehat" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Masuk ke Sistem Apotek
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                    Silakan masukkan akun Anda atau gunakan akun demo di bawah
                </p>
            </div>

            {/* Quick Demo Role Selector */}
            <div className="mb-6 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Pilih Akun Demo (1-Klik)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => fillCredentials('admin')}
                        className={`rounded-xl py-2 px-1 text-center transition border ${
                            data.email === 'admin@apotek.test'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <div className="text-xs font-black">Admin</div>
                        <div className="text-[9px] opacity-75">Full Akses</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => fillCredentials('operator')}
                        className={`rounded-xl py-2 px-1 text-center transition border ${
                            data.email === 'operator@apotek.test'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <div className="text-xs font-black">Operator</div>
                        <div className="text-[9px] opacity-75">Stok & Laporan</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => fillCredentials('kasir')}
                        className={`rounded-xl py-2 px-1 text-center transition border ${
                            data.email === 'kasir@apotek.test'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <div className="text-xs font-black">Kasir</div>
                        <div className="text-[9px] opacity-75">Penjualan POS</div>
                    </button>
                </div>
            </div>

            {status && (
                <div className="mb-4 text-xs font-medium text-emerald-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 text-xs">
                <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Alamat Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Kata Sandi (Password)
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs text-slate-600 dark:text-slate-400">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                        <LogIn className="h-4 w-4" />
                        <span>{processing ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}</span>
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
