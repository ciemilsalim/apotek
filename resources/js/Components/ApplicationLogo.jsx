export default function ApplicationLogo({ className = 'h-10 w-10', ...props }) {
    return (
        <div className={`flex items-center gap-2 ${className}`} {...props}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
                {/* Medical Cross Icon */}
                <svg
                    className="h-6 w-6 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M10.5 4a1.5 1.5 0 0 1 3 0v5h5a1.5 1.5 0 0 1 0 3h-5v5a1.5 1.5 0 0 1-3 0v-5h-5a1.5 1.5 0 0 1 0-3h5V4z" />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                    Apotek<span className="text-emerald-600 dark:text-emerald-400">Sehat</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Sistem Farmasi
                </span>
            </div>
        </div>
    );
}
