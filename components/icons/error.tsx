export default function ErrorIcon() {
    return (
        <div className="flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-[#1a2133] flex items-center justify-center border border-gray-200 dark:border-[#2a3349]">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 text-red-500 dark:text-red-400"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
        </div>
    )
}
