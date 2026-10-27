import { Check, Copy, Minus, Plus, Printer, X, Tag, FileText, Sliders } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { useEffect, useRef, useState } from 'react';

// Single Barcode Label Component
function BarcodeLabelItem({
    code,
    name,
    price,
    unit,
    expiryDate,
    location,
    pharmacyName,
    size = '50x30',
    showPrice = true,
    showPharmacy = true,
    showExpiry = true,
}) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (svgRef.current && code) {
            try {
                JsBarcode(svgRef.current, String(code).trim(), {
                    format: 'CODE128',
                    width: size === '40x30' ? 1.2 : 1.4,
                    height: size === '40x30' ? 30 : 36,
                    displayValue: true,
                    fontSize: 10,
                    font: 'monospace',
                    textMargin: 1,
                    margin: 0,
                    lineColor: '#000000',
                });
            } catch (err) {
                console.warn('JsBarcode render error:', err);
            }
        }
    }, [code, size]);

    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(price || 0);

    const isSmall = size === '40x30';

    return (
        <div
            className={`barcode-label-card bg-white text-black border border-slate-300 rounded-lg p-1.5 flex flex-col justify-between items-center text-center overflow-hidden leading-tight ${
                isSmall ? 'w-[40mm] h-[30mm]' : 'w-[50mm] h-[30mm]'
            }`}
            style={{ boxSizing: 'border-box' }}
        >
            {/* Header: Pharmacy Name */}
            {showPharmacy && (
                <div className="w-full text-[8.5px] font-black uppercase tracking-wider text-slate-800 border-b border-dashed border-slate-400 pb-0.5 truncate">
                    {pharmacyName || 'APOTEK'}
                </div>
            )}

            {/* Medicine Name */}
            <div className="w-full px-0.5 py-0.5">
                <div className="text-[10px] font-extrabold text-black truncate uppercase">
                    {name || 'Nama Obat'}
                </div>
            </div>

            {/* SVG Barcode */}
            <div className="flex items-center justify-center my-auto w-full overflow-hidden">
                <svg ref={svgRef} className="max-w-full h-auto block mx-auto" />
            </div>

            {/* Footer: Price & Expiry / Rak */}
            <div className="w-full flex items-center justify-between px-1 pt-0.5 border-t border-dashed border-slate-400 text-[8.5px] font-bold">
                {showPrice ? (
                    <span className="font-black text-black">
                        {formattedPrice}
                        {unit ? `/${unit}` : ''}
                    </span>
                ) : (
                    <span>{unit || ''}</span>
                )}

                {showExpiry && expiryDate ? (
                    <span className="text-[7.5px] text-slate-600 font-mono">
                        EXP: {new Date(expiryDate).toLocaleDateString('id-ID', { month: '2-digit', year: '2-digit' })}
                    </span>
                ) : location ? (
                    <span className="text-[7.5px] text-slate-600 font-mono">
                        {location}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export default function BarcodePrintModal({ isOpen, onClose, medicine, pharmacy }) {
    const [quantity, setQuantity] = useState(1);
    const [paperMode, setPaperMode] = useState('thermal'); // 'thermal' (roll sticker) or 'a4' (sheet grid)
    const [labelSize, setLabelSize] = useState('50x30'); // '50x30' or '40x30'
    const [showPrice, setShowPrice] = useState(true);
    const [showPharmacy, setShowPharmacy] = useState(true);
    const [showExpiry, setShowExpiry] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (medicine) {
            // Default quantity: 1, or can default to medicine.stock if <= 50
            setQuantity(1);
        }
    }, [medicine]);

    if (!isOpen || !medicine) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleCopyCode = () => {
        if (medicine.code) {
            navigator.clipboard.writeText(medicine.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const labelsArray = Array.from({ length: Math.max(1, Math.min(200, quantity)) }, (_, i) => i);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-backdrop-fade-in">
            {/* Scoped Print Styles */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: ${
                                paperMode === 'thermal'
                                    ? labelSize === '40x30'
                                        ? '40mm 30mm'
                                        : '50mm 30mm'
                                    : 'A4 portrait'
                            };
                            margin: ${paperMode === 'thermal' ? '0' : '8mm'};
                        }
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: #ffffff !important;
                            color: #000000 !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        body * {
                            visibility: hidden !important;
                        }
                        #printable-barcode-container, #printable-barcode-container * {
                            visibility: visible !important;
                        }
                        #printable-barcode-container {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            background: transparent !important;
                        }
                        .barcode-label-card {
                            border: none !important;
                            box-shadow: none !important;
                            ${
                                paperMode === 'thermal'
                                    ? `
                                page-break-after: always !important;
                                break-after: page !important;
                                width: ${labelSize === '40x30' ? '39mm' : '49mm'} !important;
                                height: 28.5mm !important;
                                margin: 0.5mm auto !important;
                                padding: 1mm !important;
                            `
                                    : `
                                width: 48mm !important;
                                height: 28mm !important;
                                margin: 2mm !important;
                                border: 1px dotted #ccc !important;
                            `
                            }
                        }
                        .a4-grid-layout {
                            display: flex !important;
                            flex-wrap: wrap !important;
                            gap: 3mm !important;
                            justify-content: flex-start !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `,
                }}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                            <Tag className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">
                                Cetak Label Stiker Barcode
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Stiker barcode obat untuk ditempel pada box / strip / botol
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="no-print flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Item Summary Banner */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                Target Obat
                            </div>
                            <h4 className="text-base font-black text-slate-900">
                                {medicine.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                                <span>Satuan: <strong className="text-slate-800">{medicine.unit}</strong></span>
                                <span>•</span>
                                <span>Stok: <strong className="text-slate-800">{medicine.stock}</strong></span>
                                <span>•</span>
                                <span>Kategori: <strong className="text-slate-800">{medicine.category?.name || '-'}</strong></span>
                            </div>
                        </div>

                        {/* Barcode code & copy button */}
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Barcode / SKU</div>
                                <div className="text-sm font-mono font-black text-slate-900 tracking-wider">
                                    {medicine.code}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                                title="Salin Kode Barcode"
                            >
                                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                                Pratinjau Tampilan Label Stiker
                            </span>
                            <span className="text-xs text-slate-500">
                                Ukuran: {labelSize === '50x30' ? '50 x 30 mm' : '40 x 30 mm'}
                            </span>
                        </div>
                        <div className="p-6 bg-slate-100/80 rounded-2xl border border-slate-200 flex items-center justify-center">
                            <div className="shadow-lg hover:shadow-xl transition transform hover:scale-105 duration-200">
                                <BarcodeLabelItem
                                    code={medicine.code}
                                    name={medicine.name}
                                    price={medicine.sell_price}
                                    unit={medicine.unit}
                                    expiryDate={medicine.expiry_date}
                                    location={medicine.location}
                                    pharmacyName={pharmacy?.name || 'APOTEK SEHAT'}
                                    size={labelSize}
                                    showPrice={showPrice}
                                    showPharmacy={showPharmacy}
                                    showExpiry={showExpiry}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Quantity Selector */}
                        <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white">
                            <label className="block text-xs font-bold text-slate-700">
                                Jumlah Label yang Ingin Dicetak
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 transition"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="flex-1 text-center font-black text-lg py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 transition"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Quick Presets */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {[1, 5, 10, 20].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setQuantity(num)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                            quantity === num
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {num} pcs
                                    </button>
                                ))}
                                {medicine.stock > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(200, medicine.stock))}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                            quantity === medicine.stock
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                        }`}
                                    >
                                        Sesuai Stok ({medicine.stock})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Format & Size Settings */}
                        <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white">
                            <label className="block text-xs font-bold text-slate-700">
                                Jenis Kertas & Format Cetak
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaperMode('thermal')}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition ${
                                        paperMode === 'thermal'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div>Stiker Roll (Thermal)</div>
                                    <div className="text-[10px] opacity-80 font-normal">Satu per satu</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaperMode('a4')}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition ${
                                        paperMode === 'a4'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div>Kertas A4 (Grid)</div>
                                    <div className="text-[10px] opacity-80 font-normal">Lembaran stiker</div>
                                </button>
                            </div>

                            {/* Label Dimension */}
                            <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-600 font-medium">Ukuran Stiker:</span>
                                <div className="flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setLabelSize('50x30')}
                                        className={`px-2 py-1 rounded-lg text-xs font-bold border transition ${
                                            labelSize === '50x30'
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-white text-slate-600 border-slate-200'
                                        }`}
                                    >
                                        50 x 30 mm (Standar)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLabelSize('40x30')}
                                        className={`px-2 py-1 rounded-lg text-xs font-bold border transition ${
                                            labelSize === '40x30'
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-white text-slate-600 border-slate-200'
                                        }`}
                                    >
                                        40 x 30 mm (Kecil)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Elements Checkboxes */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-6 text-xs">
                        <span className="font-bold text-slate-700">Elemen Tambahan:</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPharmacy}
                                onChange={(e) => setShowPharmacy(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-slate-700">Nama Apotek</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPrice}
                                onChange={(e) => setShowPrice(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-slate-700">Harga Jual</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showExpiry}
                                onChange={(e) => setShowExpiry(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-slate-700">Kadaluarsa / Lokasi</span>
                        </label>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="no-print p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Tutup
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak {quantity} Stiker Barcode</span>
                    </button>
                </div>
            </div>

            {/* Hidden Printable Container - Rendered only when printing */}
            <div id="printable-barcode-container" className="hidden">
                <div className={paperMode === 'a4' ? 'a4-grid-layout' : ''}>
                    {labelsArray.map((idx) => (
                        <BarcodeLabelItem
                            key={idx}
                            code={medicine.code}
                            name={medicine.name}
                            price={medicine.sell_price}
                            unit={medicine.unit}
                            expiryDate={medicine.expiry_date}
                            location={medicine.location}
                            pharmacyName={pharmacy?.name || 'APOTEK SEHAT'}
                            size={labelSize}
                            showPrice={showPrice}
                            showPharmacy={showPharmacy}
                            showExpiry={showExpiry}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
