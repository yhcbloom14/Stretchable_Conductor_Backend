export default function Card({children, className = ""}: {children: React.ReactNode, className?: string}) {
    return (
        <div className={`${className} bg-white dark:bg-gray-800 shadow-sm rounded-xl px-8 xl:px-16 py-4`}>
            {children}
        </div>
    )
}