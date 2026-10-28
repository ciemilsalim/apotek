import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function InteractiveSpotlightTour({
    tourKey = 'default',
    steps = [],
    isOpen: controlledIsOpen,
    onClose: controlledOnClose,
    autoStart = true,
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const popoverRef = useRef(null);

    const isControlled = controlledIsOpen !== undefined;
    const isTourActive = isControlled ? controlledIsOpen : internalOpen;

    // Check localStorage on mount for first-time visit
    useEffect(() => {
        if (!isControlled && autoStart && typeof window !== 'undefined') {
            const hasSeen = localStorage.getItem(`apotek_tour_${tourKey}`);
            if (!hasSeen) {
                // Short delay to let the page and components render completely
                const timer = setTimeout(() => {
                    setInternalOpen(true);
                }, 600);
                return () => clearTimeout(timer);
            }
        }
    }, [tourKey, autoStart, isControlled]);

    // Handle global trigger events (e.g. window.dispatchEvent(new CustomEvent('start-spotlight-tour', { detail: { key: 'dashboard' } })))
    useEffect(() => {
        const handleStartEvent = (e) => {
            if (!e.detail?.key || e.detail.key === tourKey) {
                setCurrentStepIndex(0);
                if (isControlled) {
                    controlledOnClose?.(false);
                } else {
                    setInternalOpen(true);
                }
            }
        };

        window.addEventListener('start-spotlight-tour', handleStartEvent);
        return () => window.removeEventListener('start-spotlight-tour', handleStartEvent);
    }, [tourKey, isControlled, controlledOnClose]);

    // Handle keyboard navigation (Escape, ArrowRight, ArrowLeft, Enter)
    useEffect(() => {
        if (!isTourActive) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                e.preventDefault();
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTourActive, currentStepIndex, steps.length]);

    // Position spotlight on the target element of the current step
    useEffect(() => {
        if (!isTourActive || steps.length === 0) {
            setTargetRect(null);
            return;
        }

        const step = steps[currentStepIndex];
        if (!step) return;

        const updatePosition = () => {
            const el = document.querySelector(step.target);
            if (el) {
                // Smoothly scroll the target into center view if needed
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });

                // Measure bounding rect after scroll initiation
                setTimeout(() => {
                    const rect = el.getBoundingClientRect();
                    setTargetRect({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        bottom: rect.bottom,
                        right: rect.right,
                    });
                }, 150);
            } else {
                // Target not found on page, skip to next step or fallback
                setTargetRect(null);
            }
        };

        updatePosition();

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isTourActive, currentStepIndex, steps]);

    if (!isTourActive || steps.length === 0) return null;

    const step = steps[currentStepIndex] || steps[0];
    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === steps.length - 1;

    const handleClose = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`apotek_tour_${tourKey}`, 'seen');
        }
        if (isControlled) {
            controlledOnClose?.();
        } else {
            setInternalOpen(false);
        }
    };

    const handleNext = () => {
        if (!isLast) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    // Calculate smart positioning for the popover tooltip
    const getPopoverStyle = () => {
        const popoverWidth = 320;
        const popoverHeight = 180;
        const margin = 14;

        if (!targetRect) {
            // Centered fallback if element not yet measured
            return {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 99999,
            };
        }

        // Horizontal centering relative to target, clamped to viewport margins
        let left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
        left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, left));

        // Determine vertical placement: above or below
        const spaceBelow = window.innerHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;

        let top;
        let arrowPosition = 'top';

        if (spaceBelow >= popoverHeight + margin || spaceBelow >= spaceAbove) {
            // Place below target
            top = targetRect.bottom + margin;
            arrowPosition = 'top';
        } else {
            // Place above target
            top = Math.max(16, targetRect.top - popoverHeight - margin);
            arrowPosition = 'bottom';
        }

        return {
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            width: `${popoverWidth}px`,
            zIndex: 99999,
            arrowPosition,
        };
    };

    const popoverStyle = getPopoverStyle();

    return (
        <div className="fixed inset-0 z-[99990] pointer-events-auto">
            {/* Dark overlay backdrop with animated smooth spotlight cutout */}
            {targetRect ? (
                <div
                    className="fixed rounded-2xl pointer-events-none transition-all duration-300 ease-out"
                    style={{
                        top: `${targetRect.top - 6}px`,
                        left: `${targetRect.left - 6}px`,
                        width: `${targetRect.width + 12}px`,
                        height: `${targetRect.height + 12}px`,
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)',
                    }}
                >
                    {/* Pulsing Beacon Ring */}
                    <span className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent animate-pulse" />

                    {/* Glowing Ping Corner Beacon */}
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-sm" />
                    </span>
                </div>
            ) : (
                <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs transition-opacity" />
            )}

            {/* Click-outside barrier to prevent accidental clicks on background */}
            <div
                className="fixed inset-0 z-[99995]"
                onClick={(e) => {
                    // Click on backdrop advances to next step
                    if (e.target === e.currentTarget) {
                        handleNext();
                    }
                }}
            />

            {/* Floating Popover Tooltip Card */}
            <div
                ref={popoverRef}
                style={popoverStyle}
                className="z-[99999] rounded-2xl bg-white p-4 sm:p-5 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Popover Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white shadow-2xs">
                            <Compass className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800">
                            Panduan {currentStepIndex + 1} dari {steps.length}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        title="Lewati panduan ini"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Title & Body Content */}
                <h4 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                    {step.title}
                </h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
                    {step.content}
                </p>

                {/* Progress Dots & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Mini Progress Dots */}
                    <div className="flex items-center gap-1">
                        {steps.map((_, dotIdx) => (
                            <span
                                key={dotIdx}
                                className={`h-1.5 rounded-full transition-all ${
                                    currentStepIndex === dotIdx
                                        ? 'w-4 bg-emerald-600'
                                        : 'w-1.5 bg-slate-200'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {!isFirst && (
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[11px] font-extrabold text-white shadow-xs transition active:scale-95"
                        >
                            <span>{isLast ? 'Selesai' : 'Lanjut'}</span>
                            {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
