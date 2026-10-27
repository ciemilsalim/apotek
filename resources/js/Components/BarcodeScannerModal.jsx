import { Camera, RefreshCw, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

export default function BarcodeScannerModal({ isOpen, onClose, onScan, title = 'Scan Barcode / QR Obat' }) {
    const [scannerError, setScannerError] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const readerDivId = 'html5qr-code-full-region';

    useEffect(() => {
        if (!isOpen) {
            stopScanner();
            return;
        }

        let isMounted = true;
        setScannerError(null);

        // Discover cameras
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (!isMounted) return;
                if (devices && devices.length > 0) {
                    setCameras(devices);
                    // Prefer back camera ("environment") if available
                    const backCam = devices.find(
                        (d) =>
                            d.label.toLowerCase().includes('back') ||
                            d.label.toLowerCase().includes('rear') ||
                            d.label.toLowerCase().includes('environment'),
                    );
                    const chosen = backCam ? backCam.id : devices[0].id;
                    setSelectedCameraId(chosen);
                    startScanner(chosen);
                } else {
                    setScannerError('Tidak ada kamera yang terdeteksi pada perangkat Anda.');
                }
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error('Camera access error:', err);
                setScannerError(
                    'Izin akses kamera ditolak atau kamera sedang digunakan aplikasi lain. Mohon izinkan akses kamera pada peramban Anda.',
                );
            });

        return () => {
            isMounted = false;
            stopScanner();
        };
    }, [isOpen]);

    const startScanner = async (cameraId) => {
        try {
            await stopScanner();

            const html5QrCode = new Html5Qrcode(readerDivId);
            scannerRef.current = html5QrCode;

            const config = {
                fps: 15,
                qrbox: { width: 250, height: 180 },
                aspectRatio: 1.0,
            };

            await html5QrCode.start(
                cameraId,
                config,
                (decodedText) => {
                    // Success callback
                    if (decodedText) {
                        // Play beep sound effect
                        playBeep();
                        onScan(decodedText.trim());
                        stopScanner();
                        onClose();
                    }
                },
                (errorMessage) => {
                    // Non-critical scan failure per frame - ignore
                },
            );

            setIsScanning(true);
            setScannerError(null);
        } catch (err) {
            console.error('Failed to start camera scanner:', err);
            setScannerError('Gagal menyalakan scanner kamera. Pastikan izin kamera aktif.');
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                console.warn('Error stopping scanner:', err);
            }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleCameraSwitch = (cameraId) => {
        setSelectedCameraId(cameraId);
        startScanner(cameraId);
    };

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880; // A5 note
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {
            // AudioContext might not be allowed without direct gesture - safe to ignore
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-backdrop-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                            <Camera className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Arahkan kamera ke barcode atau QR code obat
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scanner Viewport */}
                <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[300px] relative">
                    <div id={readerDivId} className="w-full max-w-sm rounded-2xl overflow-hidden" />

                    {scannerError && (
                        <div className="p-4 mx-2 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs text-center">
                            <p className="font-bold">Kendala Kamera</p>
                            <p className="mt-1 text-[11px] text-rose-300">{scannerError}</p>
                            <button
                                type="button"
                                onClick={() => selectedCameraId && startScanner(selectedCameraId)}
                                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>Coba Lagi</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                    {cameras.length > 1 ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs text-slate-500 font-medium shrink-0">Kamera:</span>
                            <select
                                value={selectedCameraId || ''}
                                onChange={(e) => handleCameraSwitch(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 py-1.5 px-2 bg-slate-50 font-medium text-slate-800 focus:border-emerald-600 focus:outline-none truncate"
                            >
                                {cameras.map((cam) => (
                                    <option key={cam.id} value={cam.id}>
                                        {cam.label || `Kamera ${cam.id.slice(0, 5)}...`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-500">
                            {isScanning ? 'Scanner aktif & siap memindai...' : 'Mempersiapkan kamera...'}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shrink-0"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
