"use client"

export function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 animate-pulse">
            <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    )
}

export function SkeletonInput() {
    return (
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-x-4 animate-pulse">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            ))}
        </div>
    )
}

export function SkeletonChart() {
    return (
        <div className="h-[450px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-600">Loading chart...</div>
        </div>
    )
}