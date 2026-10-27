import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    Check,
    CheckCircle2,
    CreditCard,
    DollarSign,
    Minus,
    Package,
    Pill,
    Plus,
    Printer,
    QrCode,
    Receipt,
    RefreshCw,
    Search,
    ShoppingCart,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PosIndex({ medicines, categories, recentSales, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [cart, setCart] = useState([]);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [lastCompletedSale, setLastCompletedSale] = useState(null);

    // Watch for completed sale in flash session
    useEffect(() => {
        if (flash?.completed_sale) {
            setLastCompletedSale(flash.completed_sale);
            setReceiptModalOpen(true);
            setCart([]);
        }
    }, [flash]);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: 'Pelanggan Umum',
        payment_method: 'cash',
        cash_paid: '',
        discount: 0,
        notes: '',
        items: [],
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    // Filter medicines locally for instantaneous responsiveness
    const filteredMedicines = medicines.filter((med) => {
        const matchesCategory =
            !selectedCategory || String(med.category_id) === String(selectedCategory);
        const matchesSearch =
            !search ||
            med.name.toLowerCase().includes(search.toLowerCase()) ||
            med.code.toLowerCase().includes(search.toLowerCase()) ||
            (med.generic_name &&
                med.generic_name.toLowerCase().includes(search.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Add to cart
    const addToCart = (med) => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === med.id);
            if (existingIndex > -1) {
                const currentQty = prev[existingIndex].quantity;
                if (currentQty >= med.stock) {
                    alert(`Stok ${med.name} hanya tersisa ${med.stock} ${med.unit}.`);
                    return prev;
                }
                const updated = [...prev];
                updated[existingIndex].quantity += 1;
                return updated;
            } else {
                if (med.stock < 1) {
                    alert(`Stok ${med.name} habis.`);
                    return prev;
                }
                return [
                    ...prev,
                    {
                        id: med.id,
                        code: med.code,
                        name: med.name,
                        unit: med.unit,
                        price: parseFloat(med.sell_price),
                        stock: med.stock,
                        quantity: 1,
                    },
                ];
            }
        });
    };

    // Update cart quantity
    const updateQuantity = (id, delta) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.id === id) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null;
                        if (newQty > item.stock) {
                            alert(`Maksimal stok tersedia adalah ${item.stock} ${item.unit}.`);
                            return item;
                        }
                        return { ...item, quantity: newQty };
                    }
                    return item;
                })
                .filter(Boolean);
        });
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
        setData((prev) => ({
            ...prev,
            cash_paid: '',
            discount: 0,
        }));
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = parseFloat(data.discount || 0);
    const totalAmount = Math.max(0, subtotal - discount);
    const cashPaid = parseFloat(data.cash_paid || 0);
    const changeAmount = data.payment_method === 'cash' ? Math.max(0, cashPaid - totalAmount) : 0;
    const isUnderpaid = data.payment_method === 'cash' && cashPaid < totalAmount;

    // Quick Cash Buttons
    const setQuickCash = (nominal) => {
        setData('cash_paid', nominal);
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Keranjang belanja masih kosong.');
            return;
        }

        if (isUnderpaid) {
            alert('Nominal uang yang dibayarkan kurang dari total belanja.');
            return;
        }

        const formattedItems = cart.map((item) => ({
            medicine_id: item.id,
            quantity: item.quantity,
        }));

        setData('items', formattedItems);

        // Submit form
        router.post(
            route('pos.store'),
            {
                customer_name: data.customer_name,
                payment_method: data.payment_method,
                cash_paid: data.payment_method === 'cash' ? cashPaid : totalAmount,
                discount: discount,
                notes: data.notes,
                items: formattedItems,
            },
            {
                onSuccess: () => {
                    // Flash watcher triggers modal and resets cart
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-emerald-600" />
                            <span>Terminal Kasir (Point of Sale)</span>
                        </h1>
                        <p className="text-xs text-slate-500">
                            Pencarian obat cepat, keranjang otomatis, dan pencetakan struk
                        </p>
                    </div>
                    <Link
                        href={route('pos.history')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                        <Receipt className="h-4 w-4" />
                        <span>Riwayat Penjualan</span>
                    </Link>
                </div>
            }
        >
            <Head title="Kasir POS - Apotek Sehat" />

            {/* Split Screen POS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Columns: Product Catalog & Search */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                    {/* Search & Categories Bar */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="relative mb-3">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ketik kode obat atau nama obat (misal: OBT-001, Paracetamol)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                autoFocus
                            />
                        </div>

                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                    selectedCategory === ''
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                        String(selectedCategory) === String(cat.id)
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Medicines Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[600px] p-1">
                        {filteredMedicines.length > 0 ? (
                            filteredMedicines.map((med) => {
                                const inCartItem = cart.find((c) => c.id === med.id);
                                return (
                                    <div
                                        key={med.id}
                                        onClick={() => addToCart(med)}
                                        className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-3.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer select-none dark:bg-slate-950 ${
                                            inCartItem
                                                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                                                : 'border-slate-200/80 hover:border-emerald-400 dark:border-slate-800'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    {med.code}
                                                </span>
                                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-800">
                                                    Stok: {med.stock}
                                                </span>
                                            </div>
                                            <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white line-clamp-2">
                                                {med.name}
                                            </h3>
                                            {med.generic_name && (
                                                <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">
                                                    {med.generic_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                            <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                                {formatCurrency(med.sell_price)}
                                            </div>
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition shadow-sm dark:bg-emerald-950/60">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        </div>

                                        {/* In-cart indicator badge */}
                                        {inCartItem && (
                                            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-extrabold text-[11px] shadow-md">
                                                {inCartItem.quantity}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                                Tidak ada obat yang ditemukan untuk kata kunci ini.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right 5 Columns: Active Cart & Payment Calculation */}
                <div className="lg:col-span-5 flex flex-col">
                    <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        {/* Cart Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Keranjang Pembelian ({cart.length})
                                </h2>
                            </div>
                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Kosongkan</span>
                                </button>
                            )}
                        </div>

                        {/* Customer & Cart Items List */}
                        <div className="mt-3 space-y-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Nama Pelanggan
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                    placeholder="Pelanggan Umum"
                                />
                            </div>

                            {/* Items Container */}
                            <div className="overflow-y-auto max-h-56 divide-y divide-slate-100 dark:divide-slate-800/80 pr-1">
                                {cart.length > 0 ? (
                                    cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="py-2.5 flex items-center justify-between gap-2"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    {item.name}
                                                </div>
                                                <div className="text-[11px] text-emerald-600">
                                                    {formatCurrency(item.price)} / {item.unit}
                                                </div>
                                            </div>

                                            {/* Quantity modifier */}
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-6 text-center text-xs font-bold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-1 text-slate-300 hover:text-rose-500 ml-1"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-xs text-slate-400">
                                        Pilih obat dari katalog di sebelah kiri untuk menambahkan ke keranjang.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment & Summary */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span className="font-semibold">{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Potongan Diskon (Rp)</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                    className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                />
                            </div>

                            <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-800">
                                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                    TOTAL BAYAR
                                </span>
                                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="pt-2">
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                    Metode Pembayaran
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { id: 'cash', label: 'Tunai', icon: Banknote },
                                        { id: 'qris', label: 'QRIS', icon: QrCode },
                                        { id: 'transfer', label: 'Transfer', icon: CreditCard },
                                    ].map((m) => {
                                        const Icon = m.icon;
                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => {
                                                    setData('payment_method', m.id);
                                                    if (m.id !== 'cash') {
                                                        setData('cash_paid', totalAmount);
                                                    }
                                                }}
                                                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition border ${
                                                    data.payment_method === m.id
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                                                }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                <span>{m.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cash Paid input & Quick Buttons (Only for Cash) */}
                            {data.payment_method === 'cash' && (
                                <div className="space-y-2 pt-1">
                                    <div className="flex justify-between items-center">
                                        <label className="font-semibold text-slate-600 dark:text-slate-400">
                                            Uang Diterima (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.cash_paid}
                                            onChange={(e) => setData('cash_paid', e.target.value)}
                                            className="w-36 rounded-lg border border-slate-200 px-2.5 py-1.5 text-right text-xs font-bold focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                                            placeholder="0"
                                            required
                                        />
                                    </div>

                                    {/* Quick Cash Buttons */}
                                    <div className="flex flex-wrap gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setQuickCash(totalAmount)}
                                            className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                        >
                                            Uang Pas
                                        </button>
                                        {[20000, 50000, 100000, 200000].map((nom) => (
                                            <button
                                                key={nom}
                                                type="button"
                                                onClick={() => setQuickCash(nom)}
                                                className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                            >
                                                {nom / 1000}k
                                            </button>
                                        ))}
                                    </div>

                                    {/* Kembalian Display */}
                                    <div className="flex justify-between items-center pt-1 font-bold">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            Kembalian
                                        </span>
                                        <span
                                            className={`text-sm ${
                                                isUnderpaid
                                                    ? 'text-rose-500'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                            }`}
                                        >
                                            {isUnderpaid
                                                ? 'Uang Kurang ' + formatCurrency(totalAmount - cashPaid)
                                                : formatCurrency(changeAmount)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Checkout Button */}
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={processing || cart.length === 0 || isUnderpaid}
                                className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check className="h-4 w-4" />
                                <span>
                                    {processing ? 'Memproses Transaksi...' : 'Selesaikan Pembayaran'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instant Receipt Popup Modal */}
            <Modal
                show={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                maxWidth="sm"
            >
                {lastCompletedSale && (
                    <div className="p-6 text-xs text-slate-800">
                        <div className="text-center pb-4 border-b border-dashed border-slate-300">
                            <div className="flex justify-center mb-1 text-emerald-600">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h2 className="text-base font-extrabold text-slate-900">
                                APOTEK SEHAT
                            </h2>
                            <p className="text-[10px] text-slate-500">
                                Jl. Sehat Farma No. 123 • Telp: (021) 555-8888
                            </p>
                            <p className="text-[10px] font-mono font-bold mt-1 text-emerald-600">
                                {lastCompletedSale.invoice_number}
                            </p>
                            <p className="text-[9px] text-slate-400">
                                {new Date(lastCompletedSale.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>

                        {/* Customer & Cashier */}
                        <div className="py-2.5 text-[10px] space-y-0.5 border-b border-dashed border-slate-300">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Pelanggan:</span>
                                <span className="font-bold">{lastCompletedSale.customer_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Kasir:</span>
                                <span className="font-bold">{lastCompletedSale.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Metode Bayar:</span>
                                <span className="font-bold uppercase">
                                    {lastCompletedSale.payment_method}
                                </span>
                            </div>
                        </div>

                        {/* Itemized List */}
                        <div className="py-3 space-y-1.5 border-b border-dashed border-slate-300 font-mono text-[10px]">
                            {lastCompletedSale.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <div>
                                        <div className="font-bold text-slate-900">
                                            {item.medicine_name}
                                        </div>
                                        <div className="text-slate-500">
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </div>
                                    </div>
                                    <div className="font-bold text-slate-900">
                                        {formatCurrency(item.subtotal)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="py-3 space-y-1 text-[11px] border-b border-dashed border-slate-300">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(lastCompletedSale.subtotal)}</span>
                            </div>
                            {lastCompletedSale.discount > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Diskon:</span>
                                    <span>-{formatCurrency(lastCompletedSale.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-extrabold text-slate-900 text-xs pt-1">
                                <span>Total Belanja:</span>
                                <span className="text-emerald-600">
                                    {formatCurrency(lastCompletedSale.total_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Uang Tunai:</span>
                                <span>{formatCurrency(lastCompletedSale.cash_paid)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900">
                                <span>Kembalian:</span>
                                <span>{formatCurrency(lastCompletedSale.change_amount)}</span>
                            </div>
                        </div>

                        <div className="text-center pt-3 text-[10px] text-slate-400">
                            <p>Semoga lekas sembuh!</p>
                            <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Cetak Struk</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReceiptModalOpen(false)}
                                className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                            >
                                Transaksi Baru
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
