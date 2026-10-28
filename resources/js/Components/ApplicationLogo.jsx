export default function ApplicationLogo({ name, tagline, className = '', ...props }) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`} {...props}>
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-500/20">
                {/* Medical Cross Icon */}
                <svg
                    className="h-6 w-6 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M10.5 4a1.5 1.5 0 0 1 3 0v5h5a1.5 1.5 0 0 1 0 3h-5v5a1.5 1.5 0 0 1-3 0v-5h-5a1.5 1.5 0 0 1 0-3h5V4z" />
                </svg>
            </div>
            <div className="flex flex-col text-left">
                <span className="text-lg font-black tracking-tight text-slate-800 leading-tight">
                    {name || (
                        <>
                            Apotek<span className="text-red-600">Hibbatillah</span>
                        </>
                    )}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {tagline || 'Sistem Farmasi'}
                </span>
            </div>
        </div>
    );
}

