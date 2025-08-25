"use client"

export function SkeletonTable() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-1 p-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: 8 }).map((_, rowIndex) => (
                <div key={rowIndex} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex animate-pulse">
                        {Array.from({ length: 5 }).map((_, colIndex) => (
                            <div key={colIndex} className="flex-1 p-4">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function SkeletonSidebar() {
    return (
        <div className="sticky top-16 bg-white dark:bg-[#151D2C] overflow-x-hidden overflow-y-auto no-scrollbar shrink-0 border-r border-gray-200 dark:border-gray-700/60 md:w-[18rem] xl:w-[20rem] h-[calc(100dvh-64px)]">
            {/* Header */}
            <div className="sticky top-0 z-10">
                <div className="flex items-center bg-white dark:bg-[#151D2C] border-b border-gray-200 dark:border-gray-700/60 px-5 h-16">
                    <div className="w-full flex items-center justify-between">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
            
            {/* File List */}
            <div className="px-5 py-4">
                <div className="mt-4">
                    <ul className="mb-6 space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <li key={i} className="animate-pulse">
                                <div className="flex items-center p-2 rounded">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export function SkeletonTitle() {
    return (
        <div className="flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
    )
}