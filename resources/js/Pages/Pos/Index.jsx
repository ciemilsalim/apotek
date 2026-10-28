import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import BarcodeScannerModal from '@/Components/BarcodeScannerModal';
import InteractiveSpotlightTour from '@/Components/InteractiveSpotlightTour';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Banknote,
    Barcode,
    Camera,
    Check,
    CheckCircle2,
    Compass,
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
    Stethoscope,
    Trash2,
    Volume2,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function PosIndex({
    medicines,
    categories,
    recentSales,
    filters,
    readyPrescriptions = [],
}) {
    const { flash, pharmacy } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [cart, setCart] = useState([]);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [lastCompletedSale, setLastCompletedSale] = useState(null);
    const [barcodeFeedback, setBarcodeFeedback] = useState(null);
    const [paperSize, setPaperSize] = useState('58mm'); // '58mm' or '80mm'
    const [cameraScannerOpen, setCameraScannerOpen] = useState(false);
    const [autoPrintThermal, setAutoPrintThermal] = useState(() => {
        const saved = localStorage.getItem('apotek_pos_auto_print');
        return saved !== null ? saved === 'true' : true;
    });

    const searchInputRef = useRef(null);

    // Play subtle POS beep for barcode scanner feedback
    const playBeep = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1400, ctx.currentTime);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            }
        } catch (e) {
            // Ignore if audio context not permitted
        }
    };

    // Auto-focus search input when page loads or modal closes
    useEffect(() => {
        const timer = setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, [receiptModalOpen, cartDrawerOpen]);

    // Watch for completed sale in flash session
    useEffect(() => {
        if (flash?.completed_sale) {
            setLastCompletedSale(flash.completed_sale);
            setReceiptModalOpen(true);

            // 1. Bersihkan seluruh layar kasir dari transaksi tersebut
            setCart([]);
            setSelectedPrescription(null);
            setSearch('');
            setData({
                customer_name: 'Pelanggan Umum',
                payment_method: 'cash',
                cash_paid: '',
                discount: 0,
                notes: '',
                prescription_id: null,
                items: [],
            });
            setCartDrawerOpen(false);

            // 2. Otomatis cetak nota/kwitansi di printer termal saat berhasil bayar
            if (autoPrintThermal) {
                const printTimer = setTimeout(() => {
                    window.print();
                }, 350);
                return () => clearTimeout(printTimer);
            }
        }
    }, [flash]);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: 'Pelanggan Umum',
        payment_method: 'cash',
        cash_paid: '',
        discount: 0,
        notes: '',
        prescription_id: null,
        items: [],
    });

    const loadPrescriptionToCart = (rx) => {
        setSelectedPrescription(rx);
        setData((prev) => ({
            ...prev,
            customer_name: rx.patient_name,
            prescription_id: rx.id,
        }));

        // Flatten all ingredients across all formula items in this prescription
        const newCartItems = [];
        rx.items?.forEach((item) => {
            item.ingredients?.forEach((ing) => {
                const med = ing.medicine || medicines.find((m) => m.id === ing.medicine_id);
                if (med) {
                    const existing = newCartItems.find((c) => c.id === med.id);
                    if (existing) {
                        existing.quantity += ing.quantity;
                    } else {
                        newCartItems.push({
                            id: med.id,
                            code: med.code,
                            name: med.name,
                            unit: med.unit,
                            price: parseFloat(ing.price || med.sell_price),
                            stock: med.stock,
                            quantity: ing.quantity,
                        });
                    }
                }
            });
        });

        if (newCartItems.length > 0) {
            setCart(newCartItems);
            playBeep();
        }

        setPrescriptionModalOpen(false);
    };

    const clearPrescription = () => {
        setSelectedPrescription(null);
        setData((prev) => ({
            ...prev,
            customer_name: 'Pelanggan Umum',
            prescription_id: null,
        }));
    };

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
    const addToCart = (med, notify = false) => {
        let addedSuccessfully = false;

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
                addedSuccessfully = true;
                return updated;
            } else {
                if (med.stock < 1) {
                    alert(`Stok ${med.name} habis.`);
                    return prev;
                }
                addedSuccessfully = true;
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

        if (notify) {
            playBeep();
            setBarcodeFeedback(`✓ ${med.name} (+1 ${med.unit})`);
            setTimeout(() => setBarcodeFeedback(null), 2500);
        }

        // Keep search input focused for continuous barcode scanning
        searchInputRef.current?.focus();
    };

    // Barcode scanner handler on Enter keypress
    const handleBarcodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = search.trim();
            if (!query) return;

            // 1. Check exact match on medicine code (case-insensitive)
            const exactCodeMatch = medicines.find(
                (m) => m.code.toLowerCase() === query.toLowerCase()
            );

            if (exactCodeMatch) {
                addToCart(exactCodeMatch, true);
                setSearch('');
                return;
            }

            // 2. Check exact match on medicine name
            const exactNameMatch = medicines.find(
                (m) => m.name.toLowerCase() === query.toLowerCase()
            );

            if (exactNameMatch) {
                addToCart(exactNameMatch, true);
                setSearch('');
                return;
            }

            // 3. If filtered results has exactly 1 item, add it
            if (filteredMedicines.length === 1) {
                addToCart(filteredMedicines[0], true);
                setSearch('');
                return;
            }
        }
    };

    // Handler when barcode is scanned via Device Camera
    const handleCameraBarcodeScanned = (scannedCode) => {
        if (!scannedCode) return;
        const query = scannedCode.trim().toLowerCase();

        // 1. Exact match code
        const exactCode = medicines.find(
            (m) => m.code.toLowerCase() === query
        );
        if (exactCode) {
            addToCart(exactCode, true);
            setSearch('');
            return;
        }

        // 2. Exact match name
        const exactName = medicines.find(
            (m) => m.name.toLowerCase() === query
        );
        if (exactName) {
            addToCart(exactName, true);
            setSearch('');
            return;
        }

        // 3. Partial match
        const partial = medicines.find(
            (m) => m.code.toLowerCase().includes(query) || m.name.toLowerCase().includes(query)
        );
        if (partial) {
            addToCart(partial, true);
            setSearch('');
        } else {
            setSearch(scannedCode);
            alert(`Obat dengan kode barcode "${scannedCode}" tidak ditemukan di database apotek.`);
        }
    };

    // Update quantity (with delta +1 or -1)
    const updateQuantity = (id, delta) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.id === id) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null; // removed
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
        searchInputRef.current?.focus();
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
        searchInputRef.current?.focus();
    };

    const clearCart = () => {
        if (confirm('Kosongkan semua obat dari keranjang?')) {
            setCart([]);
            setData((prev) => ({ ...prev, cash_paid: '', discount: 0 }));
            searchInputRef.current?.focus();
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

    // Format number or string with Indonesian thousand separator dots (e.g. 50000 -> "50.000")
    const formatNumberDots = (val) => {
        if (val === '' || val === null || val === undefined) return '';
        const clean = String(val).replace(/\D/g, '');
        if (!clean) return '';
        const num = parseInt(clean, 10);
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Handler for typing cash received with thousand separator dots
    const handleCashPaidChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw === '') {
            setData('cash_paid', '');
        } else {
            setData('cash_paid', parseInt(raw, 10));
        }
    };

    // Quick cash buttons
    const setQuickCash = (nominal) => {
        setData('cash_paid', nominal);
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Keranjang belanja masih kosong. Pilih atau scan barcode obat terlebih dahulu.');
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
                prescription_id: data.prescription_id,
                items: formattedItems,
            },
            {
                onSuccess: () => {
                    // Bersihkan layar kasir seketika
                    setCart([]);
                    setSelectedPrescription(null);
                    setSearch('');
                    setData({
                        customer_name: 'Pelanggan Umum',
                        payment_method: 'cash',
                        cash_paid: '',
                        discount: 0,
                        notes: '',
                        prescription_id: null,
                        items: [],
                    });
                    setCartDrawerOpen(false);
                },
            },
        );
    };

    const handlePrintThermal = () => {
        window.print();
    };

    const handleCloseReceiptModal = () => {
        setReceiptModalOpen(false);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 150);
    };

    // Shared Cart & Payment Component (Handles both Desktop Sidebar and Mobile Checkout Modal)
    const CartContent = ({ isModal = false, onClose = () => {} }) => (
        <div className={`flex flex-col ${isModal ? 'h-full max-h-[85vh]' : 'h-full'}`}>
            {/* Header (Sticky / Fixed at top) */}
            <div
                className={`shrink-0 flex items-center justify-between ${
                    isModal
                        ? 'p-4 sm:p-5 border-b border-slate-200 bg-white'
                        : 'pb-3 border-b border-slate-200'
                }`}
            >
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700">
                        <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight">
                            {isModal ? 'Pembayaran & Keranjang' : 'Keranjang Belanja'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                            {totalItemsCount} item obat dipilih
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {cart.length > 0 && (
                        <button
                            type="button"
                            onClick={clearCart}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                            title="Kosongkan Keranjang"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Hapus Semua</span>
                        </button>
                    )}
                    {isModal && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Tutup Modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Body (Internal scroll so top header & bottom checkout are never blocked) */}
            <div
                className={`flex-1 overflow-y-auto ${
                    isModal ? 'p-4 sm:p-5 space-y-4' : 'my-3 space-y-3'
                }`}
            >
                {/* Prescription Active Banner */}
                {selectedPrescription && (
                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1">
                            <span className="font-bold text-teal-900 block truncate">
                                Menebus Resep #{selectedPrescription.prescription_number}
                            </span>
                            <span className="text-[11px] text-teal-700 block truncate">
                                Pasien: {selectedPrescription.patient_name} • Dokter: {selectedPrescription.doctor_name}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={clearPrescription}
                            className="rounded-lg p-1 text-teal-500 hover:text-rose-600 hover:bg-teal-100/50"
                            title="Batalkan Penebusan Resep Ini"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Customer Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Pembeli / Pasien
                    </label>
                    <input
                        type="text"
                        value={data.customer_name}
                        onChange={(e) => setData('customer_name', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold focus:border-red-500 focus:outline-none bg-slate-50"
                        placeholder="Pelanggan Umum"
                    />
                </div>

                {/* Cart Items List */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Daftar Obat Yang Dibeli
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                            {cart.length} jenis obat
                        </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        {cart.length > 0 ? (
                            <div className="overflow-y-auto max-h-48 sm:max-h-56 divide-y divide-slate-100">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-bold text-slate-900 truncate">
                                                {item.name}
                                            </div>
                                            <div className="text-xs font-semibold text-slate-700">
                                                {formatCurrency(item.price)} / {item.unit}
                                                <span className="text-slate-400 font-normal ml-1.5">
                                                    (Subtotal: {formatCurrency(item.price * item.quantity)})
                                                </span>
                                            </div>
                                        </div>

                                        {/* Prominent Minus (-) & Plus (+) Buttons in Cart */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                                                title="Kurangi 1"
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="w-7 text-center font-black text-sm text-slate-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 active:scale-95 transition"
                                                title="Tambah 1"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-1.5 text-slate-300 hover:text-rose-600 ml-0.5 transition"
                                                title="Hapus dari keranjang"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-xs text-slate-400">
                                Keranjang masih kosong. Scan barcode atau klik obat di katalog.
                            </div>
                        )}
                    </div>
                </div>

                {/* Total Bayar Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50/70 to-slate-50 border border-red-200/90 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            Total Tagihan
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                            {totalItemsCount} item obat ({cart.length} jenis)
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-red-600">
                        {formatCurrency(totalAmount)}
                    </div>
                </div>

                {/* Payment Method Selector */}
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
                                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
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

                {/* Cash Payment Section with Dot Separator */}
                {data.payment_method === 'cash' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <label className="text-xs font-bold text-slate-700">
                                Uang Diterima:
                            </label>
                            <div className="relative flex-1 sm:max-w-[200px]">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatNumberDots(data.cash_paid)}
                                    onChange={handleCashPaidChange}
                                    className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-right font-black text-base text-slate-900 focus:border-red-500 focus:outline-none bg-white shadow-xs"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Quick Nominal Buttons */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setQuickCash(totalAmount)}
                                className="rounded-lg bg-green-100 text-green-800 px-2.5 py-1 text-xs font-bold hover:bg-green-200 transition"
                            >
                                Uang Pas
                            </button>
                            {[10000, 20000, 50000, 100000, 200000, 500000].map((nom) => (
                                <button
                                    key={nom}
                                    type="button"
                                    onClick={() => setQuickCash(nom)}
                                    className="rounded-lg bg-white border border-slate-200 text-slate-700 px-2 py-1 text-xs font-bold hover:bg-slate-100 transition"
                                >
                                    {nom >= 1000 ? `${nom / 1000}rb` : nom}
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
                                    isUnderpaid ? 'text-rose-600' : 'text-green-700'
                                }`}
                            >
                                {isUnderpaid
                                    ? 'Uang Kurang ' + formatCurrency(totalAmount - cashPaid)
                                    : formatCurrency(changeAmount)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer (Sticky / Fixed at bottom, always fully accessible) */}
            <div
                className={`shrink-0 ${
                    isModal
                        ? 'p-4 sm:p-5 border-t border-slate-200 bg-slate-50'
                        : 'pt-3 border-t border-slate-200'
                }`}
            >
                <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={processing || cart.length === 0 || isUnderpaid}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 sm:py-4 text-base font-black text-white shadow-sm hover:bg-red-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Check className="h-5 w-5" />
                    <span>
                        {processing
                            ? 'Menyimpan Transaksi...'
                            : `Bayar ${formatCurrency(totalAmount)} & Selesaikan`}
                    </span>
                </button>
            </div>
        </div>
    );

    // Tour steps for interactive animated spotlight on Kasir / POS
    const posTourSteps = [
        {
            target: '[data-tour="pos-search-input"]',
            title: 'Scan Barcode atau Cari Obat',
            content: 'Gunakan scanner barcode USB fisik atau ketik nama obat di sini. Tekan Enter untuk langsung memasukkan obat ke keranjang transaksi.',
        },
        {
            target: '[data-tour="pos-camera-btn"]',
            title: 'Scanner Kamera Perangkat',
            content: 'Klik tombol ini untuk memindai barcode obat fisik menggunakan kamera smartphone atau webcam tanpa perlu alat scanner eksternal.',
        },
        {
            target: '[data-tour="pos-prescriptions-btn"]',
            title: 'Tebus Resep Dokter',
            content: 'Buka daftar resep dokter yang berstatus siap tebus dan masukkan racikan obat ke keranjang dalam satu klik.',
        },
        {
            target: '[data-tour="pos-cart-panel"]',
            title: 'Keranjang Kasir & Pembayaran',
            content: 'Kelola jumlah item obat, atur diskon, pilih metode bayar (Tunai, QRIS, dsb), dan cetak struk termal otomatis saat transaksi berhasil.',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Kasir Penjualan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Scan barcode atau cari nama obat untuk langsung menambahkan ke keranjang
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('start-spotlight-tour', { detail: { key: 'pos' } }))}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:text-red-700 hover:bg-red-50 shadow-xs transition"
                            title="Panduan Interaktif Fitur Kasir"
                        >
                            <Compass className="h-4 w-4 text-red-600" />
                            <span className="hidden sm:inline">Tour Kasir</span>
                        </button>

                        <button
                            type="button"
                            data-tour="pos-prescriptions-btn"
                            onClick={() => setPrescriptionModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100 shadow-xs transition active:scale-[0.98]"
                        >
                            <Stethoscope className="h-4 w-4 text-teal-600" />
                            <span>Tebus Resep</span>
                            {readyPrescriptions.length > 0 && (
                                <span className="rounded-full bg-teal-600 text-white text-[10px] font-black px-1.5 py-0.2">
                                    {readyPrescriptions.length}
                                </span>
                            )}
                        </button>

                        <Link
                            href={route('pos.history')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-red-700 hover:bg-slate-50 shadow-xs transition"
                        >
                            <Receipt className="h-4 w-4" />
                            <span>Riwayat Struk</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Kasir POS - Apotek Sehat" />

            {/* Print Stylesheet for Thermal Roll Printers (58mm / 80mm) */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: ${paperSize === '80mm' ? '80mm auto' : '58mm auto'};
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Hide everything in print mode except thermal receipt */
                    body * {
                        visibility: hidden !important;
                    }
                    #thermal-receipt, #thermal-receipt * {
                        visibility: visible !important;
                    }
                    #thermal-receipt {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: ${paperSize === '80mm' ? '76mm' : '54mm'} !important;
                        max-width: ${paperSize === '80mm' ? '80mm' : '58mm'} !important;
                        padding: 2mm 3mm 15mm 3mm !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        font-family: 'Courier New', Courier, monospace !important;
                        font-size: ${paperSize === '80mm' ? '12px' : '10.5px'} !important;
                        line-height: 1.25 !important;
                        color: #000000 !important;
                        background: #ffffff !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            ` }} />

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24 md:pb-0">
                {/* Left Columns: Product Catalog & Barcode Scanner Area (7 Cols on Tablet & Desktop) */}
                <div className="md:col-span-7 lg:col-span-7 flex flex-col space-y-4">
                    {/* Barcode Search & Feedback Box */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs space-y-3">
                        {/* Search Input with Autofocus & Barcode icon */}
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                                <Barcode className="h-5 w-5 text-red-600" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                data-tour="pos-search-input"
                                placeholder="Scan barcode obat atau ketik nama/kode obat..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleBarcodeKeyDown}
                                className="w-full rounded-2xl border-2 border-slate-300 bg-slate-50 pl-11 pr-20 py-3 text-sm font-semibold focus:border-red-500 focus:bg-white focus:outline-none shadow-xs"
                                autoFocus
                            />
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            searchInputRef.current?.focus();
                                        }}
                                        className="rounded-full p-1 text-slate-400 hover:text-slate-600"
                                        title="Hapus pencarian"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    data-tour="pos-camera-btn"
                                    onClick={() => setCameraScannerOpen(true)}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs shadow-2xs transition"
                                    title="Scan Barcode via Kamera HP / Web"
                                >
                                    <Camera className="h-4 w-4 text-red-600" />
                                    <span className="hidden sm:inline text-[11px]">Kamera</span>
                                </button>
                            </div>
                        </div>

                        {/* Scanner Status & Visual Feedback Badge */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>Scanner Siap</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCameraScannerOpen(true)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-[11px] font-semibold transition"
                                >
                                    <Camera className="h-3 w-3 text-red-600" />
                                    <span>Scan Kamera</span>
                                </button>
                            </div>

                            {barcodeFeedback && (
                                <div className="font-extrabold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200 animate-fade-in">
                                    {barcodeFeedback}
                                </div>
                            )}
                        </div>

                        {/* Category Scrolling Filter Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory('');
                                    searchInputRef.current?.focus();
                                }}
                                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                                    selectedCategory === ''
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                Semua Kategori
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        searchInputRef.current?.focus();
                                    }}
                                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                                        String(selectedCategory) === String(cat.id)
                                            ? 'bg-red-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Medicine Card Grid (Responsive: 2 col mobile, 3 col tablet, 4 col desktop) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredMedicines.length > 0 ? (
                            filteredMedicines.map((med) => {
                                const inCartItem = cart.find((c) => c.id === med.id);
                                const isLowStock = med.stock <= med.min_stock;

                                return (
                                    <div
                                        key={med.id}
                                        className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border-2 bg-white transition ${
                                            inCartItem
                                                ? 'border-red-600 bg-red-50/15'
                                                : 'border-slate-200 hover:border-red-400'
                                        }`}
                                    >
                                        <div
                                            onClick={() => addToCart(med)}
                                            className="cursor-pointer select-none"
                                        >
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

                                            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-red-700 line-clamp-2">
                                                {med.name}
                                            </h3>

                                            {med.generic_name && (
                                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                    {med.generic_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Card Footer: Price & BOTH [+] and [-] Quantity Controls! */}
                                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                            <div className="text-sm font-extrabold text-slate-900">
                                                {formatCurrency(med.sell_price)}
                                            </div>

                                            {inCartItem ? (
                                                /* If already in cart, show BOTH minus (-) and plus (+) right on the card */
                                                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(med.id, -1);
                                                        }}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-200 shadow-xs active:scale-90 transition"
                                                        title="Kurangi 1"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-5 text-center font-black text-xs text-slate-900">
                                                        {inCartItem.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(med.id, 1);
                                                        }}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-xs active:scale-90 transition"
                                                        title="Tambah 1"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                /* If not yet in cart, show + Tambah button */
                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(med)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-700 group-hover:bg-red-600 group-hover:text-white transition shadow-xs"
                                                    title="Tambah ke keranjang"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* In-cart count bubble */}
                                        {inCartItem && (
                                            <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white font-black text-xs shadow-md">
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

                {/* Right Panel for Tablet & Desktop: Live Cart (5 Cols on Tablet & Desktop) */}
                <div className="hidden md:block md:col-span-5 lg:col-span-5">
                    <div data-tour="pos-cart-panel" className="sticky top-24 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                        <CartContent isModal={false} />
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Bottom Checkout Bar (Hidden on Tablet & Desktop) */}
            {cart.length > 0 && (
                <div className="fixed bottom-16 inset-x-0 z-30 md:hidden p-3 bg-white/95 border-t border-slate-200 backdrop-blur-md shadow-lg">
                    <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                        <div
                            onClick={() => setCartDrawerOpen(true)}
                            className="flex flex-col cursor-pointer"
                        >
                            <span className="text-xs font-bold text-slate-500">
                                {totalItemsCount} Obat Dipilih ({cart.length} jenis)
                            </span>
                            <span className="text-lg font-black text-red-700">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCartDrawerOpen(true)}
                            className="flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-red-700 active:scale-95 transition"
                        >
                            <span>Bayar Sekarang</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Cart & Checkout Modal (Structured with fixed header, internal scroll, and fixed footer) */}
            <Modal
                show={cartDrawerOpen}
                onClose={() => {
                    setCartDrawerOpen(false);
                    searchInputRef.current?.focus();
                }}
                maxWidth="lg"
            >
                <CartContent
                    isModal={true}
                    onClose={() => {
                        setCartDrawerOpen(false);
                        searchInputRef.current?.focus();
                    }}
                />
            </Modal>

            {/* Instant Receipt Popup Modal with Thermal Printer Support */}
            <Modal
                show={receiptModalOpen}
                onClose={handleCloseReceiptModal}
                maxWidth="sm"
            >
                {lastCompletedSale && (
                    <div className="flex flex-col max-h-[88vh] text-slate-900">
                        {/* Thermal Print CSS */}
                        <style dangerouslySetInnerHTML={{ __html: `
                            @media print {
                                @page {
                                    size: ${paperSize === '80mm' ? '80mm auto' : '58mm auto'};
                                    margin: 0;
                                }
                                body {
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    background: #fff !important;
                                }
                                /* Sembunyikan seluruh UI layar saat mencetak */
                                body * {
                                    visibility: hidden !important;
                                }
                                #thermal-receipt, #thermal-receipt * {
                                    visibility: visible !important;
                                }
                                #thermal-receipt {
                                    position: fixed !important;
                                    left: 0 !important;
                                    top: 0 !important;
                                    width: ${paperSize === '80mm' ? '80mm' : '58mm'} !important;
                                    margin: 0 !important;
                                    padding: 2mm !important;
                                    box-shadow: none !important;
                                    border: none !important;
                                    background: white !important;
                                }
                            }
                        ` }} />

                        {/* Header & Thermal Printer Paper Size Selector */}
                        <div className="shrink-0 p-4 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                                            Transaksi Berhasil!
                                        </span>
                                        <span className="text-[10px] text-green-600 font-bold">
                                            {autoPrintThermal ? 'Struk otomatis dicetak ke printer termal' : 'Struk siap dicetak'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseReceiptModal}
                                    className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="no-print p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">
                                    Format Kertas Termal:
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPaperSize('58mm')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                            paperSize === '58mm'
                                                ? 'bg-red-600 text-white border-red-600'
                                                : 'bg-white text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        58 mm (Mini)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaperSize('80mm')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                            paperSize === '80mm'
                                                ? 'bg-red-600 text-white border-red-600'
                                                : 'bg-white text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        80 mm (Standar)
                                    </button>
                                </div>
                            </div>

                            {/* Auto-print Toggle Switch */}
                            <div className="no-print mt-2 flex items-center justify-between px-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={autoPrintThermal}
                                        onChange={(e) => {
                                            const val = e.target.checked;
                                            setAutoPrintThermal(val);
                                            localStorage.setItem('apotek_pos_auto_print', val);
                                        }}
                                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span>Cetak Otomatis saat Bayar</span>
                                </label>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    autoPrintThermal ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                                }`}>
                                    {autoPrintThermal ? 'Aktif' : 'Manual'}
                                </span>
                            </div>
                        </div>

                        {/* Thermal Receipt Body (Has id="thermal-receipt" for @media print) */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                            <div
                                id="thermal-receipt"
                                className="bg-white p-4 rounded-xl border border-slate-200 font-mono text-xs text-black shadow-xs"
                                style={{ maxWidth: paperSize === '80mm' ? '80mm' : '58mm', margin: '0 auto' }}
                            >
                                {/* Header */}
                                <div className="text-center pb-2 border-b border-dashed border-black">
                                    {pharmacy?.logo_url && (
                                        <img
                                            src={pharmacy.logo_url}
                                            alt="Logo"
                                            className="h-8 w-8 mx-auto object-contain mb-1"
                                        />
                                    )}
                                    <h2 className="text-sm font-black tracking-tight uppercase">
                                        {pharmacy?.name || 'APOTEK HIBBATILLAH'}
                                    </h2>
                                    {pharmacy?.tagline && (
                                        <p className="text-[9px] italic text-slate-600 mb-0.5">
                                            {pharmacy.tagline}
                                        </p>
                                    )}
                                    <p className="text-[10px]">
                                        {pharmacy?.address || 'Buol'}
                                    </p>
                                    {pharmacy?.phone && (
                                        <p className="text-[10px]">
                                            Telp: {pharmacy.phone}
                                        </p>
                                    )}
                                    <div className="mt-1 font-bold text-[11px]">
                                        {lastCompletedSale.invoice_number}
                                    </div>
                                    <p className="text-[9px]">
                                        {new Date(lastCompletedSale.created_at).toLocaleString('id-ID')}
                                    </p>
                                </div>

                                {/* Customer & Cashier */}
                                <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-black">
                                    <div className="flex justify-between">
                                        <span>Kasir:</span>
                                        <span>{lastCompletedSale.user?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pelanggan:</span>
                                        <span>{lastCompletedSale.customer_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Metode:</span>
                                        <span className="uppercase">{lastCompletedSale.payment_method}</span>
                                    </div>
                                </div>

                                {/* Itemized List */}
                                <div className="py-2 space-y-1.5 border-b border-dashed border-black text-[10px]">
                                    {lastCompletedSale.items?.map((item, idx) => (
                                        <div key={idx}>
                                            <div className="font-bold">
                                                {item.medicine_name}
                                            </div>
                                            <div className="flex justify-between">
                                                <span>
                                                    {item.quantity} x {item.price.toLocaleString('id-ID')}
                                                </span>
                                                <span>
                                                    {item.subtotal.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-black">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{lastCompletedSale.subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    {lastCompletedSale.discount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Diskon:</span>
                                            <span>-{lastCompletedSale.discount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-black text-xs pt-1">
                                        <span>TOTAL:</span>
                                        <span>Rp {lastCompletedSale.total_amount.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Bayar:</span>
                                        <span>Rp {lastCompletedSale.cash_paid.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span>Kembali:</span>
                                        <span>Rp {lastCompletedSale.change_amount.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center pt-2 text-[9px] leading-relaxed">
                                    {pharmacy?.receipt_footer ? (
                                        <div className="whitespace-pre-line font-bold">
                                            {pharmacy.receipt_footer}
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5">
                                            <p className="font-bold">Terima kasih atas kunjungan Anda</p>
                                            <p>Semoga lekas sembuh!</p>
                                            <p>Struk pembayaran yang sah</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Buttons (Always sticky at bottom) */}
                        <div className="no-print shrink-0 p-4 border-t border-slate-200 bg-white flex gap-2">
                            <button
                                type="button"
                                onClick={handlePrintThermal}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-black text-white hover:bg-slate-800 active:scale-95 transition"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Cetak ({paperSize})</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseReceiptModal}
                                className="flex-1 inline-flex items-center justify-center rounded-2xl bg-red-600 py-3 text-xs font-black text-white hover:bg-red-700 active:scale-95 transition"
                            >
                                Transaksi Baru
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Pilih Resep Dokter */}
            <Modal show={prescriptionModalOpen} onClose={() => setPrescriptionModalOpen(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-teal-700">
                            <Stethoscope className="h-5 w-5" />
                            <h2 className="text-base font-extrabold text-slate-900">
                                Pilih Resep Dokter untuk Ditebus
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPrescriptionModalOpen(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {readyPrescriptions && readyPrescriptions.length > 0 ? (
                            readyPrescriptions.map((rx) => (
                                <div
                                    key={rx.id}
                                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-black text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                {rx.prescription_number}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                rx.status === 'processed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {rx.status === 'processed' ? 'Siap Ditebus' : 'Menunggu Diracik'}
                                            </span>
                                        </div>
                                        <div className="font-black text-sm text-slate-900 mt-1">
                                            {rx.patient_name} {rx.patient_age && `(${rx.patient_age})`}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Dokter: <span className="font-semibold text-slate-700">{rx.doctor_name}</span> • Tgl: {rx.prescription_date}
                                        </div>
                                        <div className="text-xs font-medium text-slate-600 mt-1">
                                            Formula: {rx.items?.map((it) => it.racikan_name).join(', ')}
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                                        <span className="font-black text-sm text-teal-700">
                                            {formatCurrency(rx.grand_total)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => loadPrescriptionToCart(rx)}
                                            className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition active:scale-[0.98]"
                                        >
                                            Muat ke Kasir
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-xs text-slate-400">
                                Tidak ada resep dokter yang menunggu penebusan saat ini.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Device Camera Barcode Scanner Modal */}
            <BarcodeScannerModal
                isOpen={cameraScannerOpen}
                onClose={() => setCameraScannerOpen(false)}
                onScan={handleCameraBarcodeScanned}
                title="Scan Barcode Obat Kasir"
            />

            {/* Interactive Spotlight Animated Tour */}
            <InteractiveSpotlightTour tourKey="pos" steps={posTourSteps} />
        </AuthenticatedLayout>
    );
}
