"use client"

import { useSearchParams } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { selectMaterials } from "@/lib/store/slices/templateSlice"
import { useEffect, useState, Suspense } from "react"
import { CompositionSegment, COLORS } from "@/lib/types/Template"
import { AlertCircle } from "lucide-react"

function CompositionBar() {
    const searchParams = useSearchParams()
    const materials = useAppSelector(selectMaterials)
    const [segments, setSegments] = useState<CompositionSegment[]>([])
    
    useEffect(() => {
        const selected = materials
            .map((material, index) => {
                const value = Number(searchParams.get(material.featureKey)) || material.min
                const colorIndex = index % COLORS.length
                
                return {
                    ...material,
                    value,
                    colorIndex
                }
            })
            .filter(segment => segment.value > 0) // Only show segments with nonzero values
        setSegments(selected)
    }, [searchParams, materials])

    // Calculate accumulated width and handle overflow
    let accumulatedWidth = 0;
    const visibleSegments = segments
        .filter(segment => {
            if (accumulatedWidth >= 100) return false;
            accumulatedWidth += segment.value;
            return true;
        });

    // Calculate empty space
    const emptySpace = Math.max(0, 100 - accumulatedWidth);

    return (
        <div className="w-full mx-auto p-4">
            <div 
            id="slider-container"
            className={`relative w-full h-16 rounded-lg overflow-hidden mb-6 ${
                accumulatedWidth > 100 
                    ? 'border-4 border-red-500 dark:border-red-400 animate-[pulse_3s_ease-in-out_infinite]' 
                    : ''
            }`}
            >
            {visibleSegments.map((segment, index) => {
                const leftPosition = index === 0 ? 0 : visibleSegments
                    .slice(0, index)
                    .reduce((sum, s) => sum + s.value, 0);
    
                return (
                <div
                    key={index}
                    className="absolute top-0 bottom-0 transition-colors duration-200 bg-opacity-100"
                    style={{
                    left: `${leftPosition}%`,
                    width: `${segment.value}%`,
                    backgroundColor: COLORS[segment.colorIndex]
                    }}
                >
                    {segment.value >= 5 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                            <span className="text-white font-medium text-sm">
                                {segment.label}
                            </span>
                            <span className="text-white text-xs">
                                {segment.value.toFixed(1)}%
                            </span>
                        </div>
                    )}
                    {(index < visibleSegments.length - 1 || Number(emptySpace.toFixed(1)) > 0) && (
                    <div 
                        className="absolute right-0 top-0 bottom-0 w-2 bg-white opacity-25"
                    />
                    )}
                </div>
                );
            })}
            {/*Add Empty Bar*/}
            { Number(emptySpace.toFixed(1)) > 0 &&
                <div
                    className={`absolute top-0 bottom-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200`}
                    style={{
                        left: `${accumulatedWidth}%`,
                        width: `${emptySpace}%`
                    }}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                        <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                        Empty
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 text-xs">
                        {emptySpace.toFixed(1)}%
                        </span>
                    </div>
                </div>
            }
            </div>
            {accumulatedWidth > 100 && (
                <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Warning: Total composition exceeds 100% ({accumulatedWidth.toFixed(1)}%)</span>
                </div>
            )}
        </div>
    )
}
export default function CompositionBarWrapper() {
    return (
        <Suspense fallback="Loading...">
            <CompositionBar />
        </Suspense>
    )
} 