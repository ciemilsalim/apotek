import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Banknote,
    Check,
    CheckCircle2,
    CreditCard,
    Minus,
    Package,
    Pill,
    Plus,
    Printer,
    QrCode,
    Receipt,
    Search,
    ShoppingCart,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PosIndex({ medicines, categories, recentSales, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [cart, setCart] = useState([]);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [lastCompletedSale, setLastCompletedSale] = useState(null);

    // Watch for completed sale in flash session
    useEffect(() => {
        if (flash?.completed_sale) {
            setLastCompletedSale(flash.completed_sale);
            setReceiptModalOpen(true);
            setCart([]);
            setCartDrawerOpen(false);
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

    // Filter medicines
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
        if (confirm('Kosongkan semua obat dari keranjang?')) {
            setCart([]);
            setData((prev) => ({ ...prev, cash_paid: '', discount: 0 }));
        }
    };

    // Financial calculations
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = parseFloat(data.discount || 0);
    const totalAmount = Math.max(0, subtotal - discount);
    const cashPaid = parseFloat(data.cash_paid || 0);
    const changeAmount = data.payment_method === 'cash' ? Math.max(0, cashPaid - totalAmount) : 0;
    const isUnderpaid = data.payment_method === 'cash' && cashPaid < totalAmount;

    // Quick cash buttons
    const setQuickCash = (nominal) => {
        setData('cash_paid', nominal);
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Keranjang belanja masih kosong. Pilih obat terlebih dahulu.');
            return;
        }

        if (isUnderpaid) {
            alert('Uang yang dibayarkan kurang dari total belanja.');
            return;
        }

        const formattedItems = cart.map((item) => ({
            medicine_id: item.id,
            quantity: item.quantity,
        }));

        router.post(
            route('pos.store'),
            {
                customer_name: data.customer_name || 'Pelanggan Umum',
                payment_method: data.payment_method,
                cash_paid: data.payment_method === 'cash' ? cashPaid : totalAmount,
                discount: discount,
                notes: data.notes,
                items: formattedItems,
            },
            {
                onSuccess: () => {},
            },
        );
    };

    // Shared Cart Content Component (Used in Sidebar on Tablet/Desktop, and Drawer/Modal on Mobile)
    const CartContent = () => (
        <div className="flex flex-col h-full">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <ShoppingCart className="h-4 w-4" />
                    </div>
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                        Keranjang ({totalItemsCount} obat)
                    </span>
                </div>
                {cart.length > 0 && (
                    <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus Semua</span>
                    </button>
                )}
            </div>

            {/* Customer Name */}
            <div className="mt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pembeli / Pelanggan
                </label>
                <input
                    type="text"
                    value={data.customer_name}
                    onChange={(e) => setData('customer_name', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-emerald-600 focus:outline-none bg-slate-50"
                    placeholder="Pelanggan Umum"
                />
            </div>

            {/* Cart Items List */}
            <div className="my-3 flex-1 overflow-y-auto max-h-60 sm:max-h-72 divide-y divide-slate-100">
                {cart.length > 0 ? (
                    cart.map((item) => (
                        <div
                            key={item.id}
                            className="py-3 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-slate-900 truncate">
                                    {item.name}
                                </div>
                                <div className="text-xs font-semibold text-emerald-700">
                                    {formatCurrency(item.price)} / {item.unit}
                                </div>
                            </div>

                            {/* Quantity Selector (Big touch targets: min 36px) */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-7 text-center font-black text-sm">
                                    {item.quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-1 text-slate-300 hover:text-rose-500 ml-1"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-xs sm:text-sm text-slate-400">
                        Keranjang masih kosong. Pilih obat dari katalog di samping.
                    </div>
                )}
            </div>

            {/* Calculations & Payment Form */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
                {/* Total Bayar Banner */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-emerald-900 uppercase">
                            Total Tagihan
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                            {totalItemsCount} item obat
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-700">
                        {formatCurrency(totalAmount)}
                    </div>
                </div>

                {/* Payment Method Selector (Big buttons) */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-3 gap-2">
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
                                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold border-2 transition ${
                                        data.payment_method === m.id
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{m.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Cash Payment Section */}
                {data.payment_method === 'cash' && (
                    <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold text-slate-700">
                                Uang Diterima:
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.cash_paid}
                                onChange={(e) => setData('cash_paid', e.target.value)}
                                className="w-36 rounded-xl border border-slate-300 px-3 py-2 text-right font-black text-base text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
                                placeholder="0"
                            />
                        </div>

                        {/* Quick Nominal Buttons */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setQuickCash(totalAmount)}
                                className="rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-bold hover:bg-emerald-200"
                            >
                                Uang Pas
                            </button>
                            {[20000, 50000, 100000, 200000].map((nom) => (
                                <button
                                    key={nom}
                                    type="button"
                                    onClick={() => setQuickCash(nom)}
                                    className="rounded-lg bg-white border border-slate-200 text-slate-700 px-2 py-1 text-xs font-bold hover:bg-slate-100"
                                >
                                    {nom / 1000}rb
                                </button>
                            ))}
                        </div>

                        {/* Kembalian Banner */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">
                                Uang Kembalian:
                            </span>
                            <span
                                className={`text-base font-black ${
                                    isUnderpaid ? 'text-rose-600' : 'text-emerald-700'
                                }`}
                            >
                                {isUnderpaid
                                    ? 'Uang Kurang ' + formatCurrency(totalAmount - cashPaid)
                                    : formatCurrency(changeAmount)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Final Checkout Button */}
                <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={processing || cart.length === 0 || isUnderpaid}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-black text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Check className="h-5 w-5" />
                    <span>
                        {processing ? 'Menyimpan Transaksi...' : 'Bayar & Selesaikan Transaksi'}
                    </span>
                </button>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Kasir Penjualan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Pilih obat dari daftar untuk langsung dimasukkan ke keranjang
                        </p>
                    </div>
                    <Link
                        href={route('pos.history')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
                    >
                        <Receipt className="h-4 w-4" />
                        <span>Riwayat Struk</span>
                    </Link>
                </div>
            }
        >
            <Head title="Kasir - Apotek Sehat" />

            {/* Split Screen Layout (Mobile: Full width catalog + Bottom Bar; Tablet/Desktop: 2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 lg:pb-0">
                {/* Medicine Catalog Section (7 Cols on Desktop, Full Width on Mobile) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                    {/* Search & Category Filter */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs space-y-3">
                        {/* Big Search Input with Clear Button */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama obat atau kode (misal: Paracetamol, OBT-001)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-10 py-3 text-sm font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Horizontal Scrolling Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('')}
                                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                                    selectedCategory === ''
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                Semua Kategori
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                                        String(selectedCategory) === String(cat.id)
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Medicine Card Grid (Optimized for Finger Tap on Mobile & Tablet) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredMedicines.length > 0 ? (
                            filteredMedicines.map((med) => {
                                const inCartItem = cart.find((c) => c.id === med.id);
                                const isLowStock = med.stock <= med.min_stock;

                                return (
                                    <div
                                        key={med.id}
                                        onClick={() => addToCart(med)}
                                        className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border-2 bg-white transition active:scale-[0.98] cursor-pointer select-none ${
                                            inCartItem
                                                ? 'border-emerald-600 bg-emerald-50/20'
                                                : 'border-slate-200 hover:border-emerald-400'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-mono text-[11px] font-bold text-slate-500">
                                                    {med.code}
                                                </span>
                                                <span
                                                    className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${
                                                        isLowStock
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    Stok: {med.stock}
                                                </span>
                                            </div>

                                            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 line-clamp-2">
                                                {med.name}
                                            </h3>

                                            {med.generic_name && (
                                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                    {med.generic_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                            <div className="text-sm font-black text-emerald-700">
                                                {formatCurrency(med.sell_price)}
                                            </div>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        </div>

                                        {/* In-cart count badge */}
                                        {inCartItem && (
                                            <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-xs shadow-md">
                                                {inCartItem.quantity}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-16 text-center text-sm text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                                Tidak ada obat yang sesuai dengan pencarian ini.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel for Desktop / Tablet: Live Cart (5 Cols on Desktop) */}
                <div className="hidden lg:block lg:col-span-5">
                    <div className="sticky top-24 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                        <CartContent />
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Bottom Bar (Shows when items in cart) */}
            {cart.length > 0 && (
                <div className="fixed bottom-16 inset-x-0 z-30 lg:hidden p-3 bg-white/95 border-t border-slate-200 backdrop-blur-md shadow-lg">
                    <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                        <div
                            onClick={() => setCartDrawerOpen(true)}
                            className="flex flex-col cursor-pointer"
                        >
                            <span className="text-xs font-bold text-slate-500">
                                {totalItemsCount} Obat Dipilih
                            </span>
                            <span className="text-lg font-black text-emerald-700">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCartDrawerOpen(true)}
                            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                        >
                            <span>Bayar Sekarang</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Cart Drawer Modal */}
            <Modal
                show={cartDrawerOpen}
                onClose={() => setCartDrawerOpen(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <CartContent />
                </div>
            </Modal>

            {/* Instant Receipt Popup Modal (Clean Flat Design) */}
            <Modal
                show={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                maxWidth="sm"
            >
                {lastCompletedSale && (
                    <div className="p-6 text-xs text-slate-800">
                        <div className="text-center pb-4 border-b border-dashed border-slate-300">
                            <div className="flex justify-center mb-1 text-emerald-600">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">
                                APOTEK SEHAT
                            </h2>
                            <p className="text-xs text-slate-500">
                                Struk Pembayaran Sah
                            </p>
                            <div className="mt-2 inline-block rounded-lg bg-emerald-50 px-2.5 py-1 font-mono text-xs font-black text-emerald-700 border border-emerald-200">
                                {lastCompletedSale.invoice_number}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {new Date(lastCompletedSale.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>

                        {/* Customer & Cashier */}
                        <div className="py-3 text-xs space-y-1 border-b border-dashed border-slate-300">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Pembeli:</span>
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
                        <div className="py-3 space-y-2 border-b border-dashed border-slate-300 font-mono text-xs">
                            {lastCompletedSale.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-slate-900">
                                            {item.medicine_name}
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </div>
                                    </div>
                                    <div className="font-black text-slate-900">
                                        {formatCurrency(item.subtotal)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="py-3 space-y-1.5 text-xs border-b border-dashed border-slate-300">
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
                            <div className="flex justify-between font-black text-slate-900 text-sm pt-1">
                                <span>TOTAL BELANJA:</span>
                                <span className="text-emerald-700">
                                    {formatCurrency(lastCompletedSale.total_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Uang Diterima:</span>
                                <span>{formatCurrency(lastCompletedSale.cash_paid)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900">
                                <span>Uang Kembalian:</span>
                                <span>{formatCurrency(lastCompletedSale.change_amount)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Cetak Struk</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReceiptModalOpen(false)}
                                className="flex-1 inline-flex items-center justify-center rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
