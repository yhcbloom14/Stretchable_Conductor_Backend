export default function Box({ className = "", children, level = "1" }: { className?: string, children: React.ReactNode, level: "1" | "2" }) {
    if (level === "1") {
        return (
            <div className={`${className}bg-white dark:bg-[#1c2438]/50 border border-gray-200 dark:border-[#2a3349] rounded-lg p-6 shadow-lg`}>
                {children}
            </div>
        )
    } else if (level === "2") {
        return (
            <div className={`${className} p-4 bg-gray-50 dark:bg-[#1a2133] rounded-md border border-gray-200 dark:border-[#2a3349]`}>
                {children}
            </div>
        )
    }
}