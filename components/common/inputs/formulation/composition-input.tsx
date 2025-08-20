"use client"

import { COLORS, CompositionSegment } from "@/lib/types/Template"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useCallback, useMemo, Suspense } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import { selectMaterials } from "@/lib/store/slices/templateSlice"
import { useDebouncedCallback } from "use-debounce"
import Box from "../../box"
import RangeInput from "../range-input"
import { AlertCircle } from "lucide-react"
import { InputNumber } from 'antd';

function CompositionInput({ title = "", removeCompositionIndicator = false }: { title?: string, removeCompositionIndicator?: boolean }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const materials = useAppSelector(selectMaterials)
    const [segments, setSegments] = useState<CompositionSegment[]>([])


    // TODO: remove this after MVP demo
    const defaultValues: Record<string, number> | undefined = useMemo(() => {
        if (pathname.includes('direct-prediction')) {
            return {
                'M-1': 30,
                'M-4': 70,
            }
        } else if (pathname.includes('heatmap')) {
            return {
                'M-1': 20,
                'M-4': 60,
            }
        }
        return undefined
    }, [pathname])

    // Memoize the updateValue callback
    const updateValue = useCallback((featureKey: string, value: number) => {
        setSegments(prevSegments => 
            prevSegments.map(segment => 
                segment.featureKey === featureKey 
                    ? { ...segment, value: value }
                    : segment
            )
        )
    }, [])

    // Sync with URL parameters - removed segments from dependencies
    useEffect(() => {
        const selected = materials
            .map((material, index) => {
                const value = Number(searchParams.get(`${material.featureKey}`)) || defaultValues?.[material.featureKey] || material.min
                const colorIndex = index % COLORS.length
                
                return {
                    ...material,
                    value,
                    colorIndex
                }
            })
        setSegments(selected)
    }, [searchParams, materials, defaultValues])

    // Optimize URL parameter updates with debouncing
    const updateUrlParams = useDebouncedCallback((segments: CompositionSegment[]) => {
        const params = new URLSearchParams(searchParams)
        let hasChanges = false

        segments.forEach(segment => {
            const valueKey = `${segment.featureKey}`
            const currentValue = searchParams.get(valueKey)
            const newValue = segment.value.toString()
            
            if (currentValue !== newValue) {
                params.set(valueKey, newValue)
                hasChanges = true
            }
        })

        if (hasChanges) {
            router.replace(`?${params.toString()}`, { scroll: false })
        }
    }, 300)

    useEffect(() => {
        updateUrlParams(segments)
    }, [segments, updateUrlParams])

    // Memoize the rendered segments
    const renderedSegments = useMemo(() => 
        segments.map((segment, i) => {
            const color = COLORS[segment.colorIndex]
            const isSelected = searchParams.get(`${segment.featureKey}_include`) === "true"
            return (
                <Box className="relative overflow-hidden" key={`composition-segment-input-${i}`} level="2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {segment.label}
                        </span>
                        <div 
                            className="w-3 h-3 rounded-full mr-1 xs:mr-2"
                            style={{ backgroundColor: color }}
                        />
                    </div>
                    <InputNumber
                        className="[&_input]:dark:text-gray-300 [&_input]:dark:bg-[#1c2438] dark:border-[#2a3349] dark:bg-[#1c2438]"
                        name={`${segment.featureKey}`}
                        min={segment.min}
                        max={Number(segment.max.toFixed(2))}
                        step={0.1}
                        value={segment.value}
                        onChange={(value) => {
                            if (value !== null) {
                                updateValue(segment.featureKey, value);
                            }
                        }}
                    />
                    <RangeInput
                        label={""}
                        name={`${segment.featureKey}`}
                        min={segment.min}
                        max={Number(segment.max.toFixed(2))}
                        step={0.1}
                        value={segment.value}
                        onChange={updateValue.bind(null, segment.featureKey)}
                        accentColor={color}
                    />
                    {isSelected && <div className="absolute w-full h-full bg-[#d4d4d8] opacity-50 top-0 left-0" />}
                </Box>
            )
        }), [segments, updateValue])

    return (
        <div className="grid sm:grid-cols-6 px-5 py-4 items-center">
                <div className="flex flex-col h-full relative">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0 mt-8">
                        {title || "Formulation"}
                    </div>
                </div>
            <div className="px-5 py-1 col-span-4 xl:col-span-5 relative">
                <div className="flex flex-row flex-wrap gap-4 items-start">
                    {renderedSegments}
                </div>
                {/* Grey text positioned to the right of the material inputs, moved down to center with boxes */}
                <div className="absolute -right-20 top-8 text-xs text-gray-500 dark:text-gray-400 [&_span]:block min-w-[180px] max-w-[280px]">
                    <span>MXene: Ti₃C₂Tₓ MXene</span>
                    <span>SWNT: Single-Walled Carbon Nanotube</span>
                    <span>AuNP: Gold Nanoparticle</span>
                    <span>PVA: Polyvinyl Alcohol</span>
                    <span>UL: Upper Limit (wt. %)</span>
                    <span>LL: Lower Limit (wt. %)</span>
                </div>
                {/* Validation text moved below the material input boxes */}
                {(() => {
                    if (removeCompositionIndicator) return null;
                    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
                    if (total > 100 || total < 100) {
                        return (
                            <div className="flex items-center gap-2 mt-4 ml-2">
                                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                                <span className="text-xs text-red-600 dark:text-red-400">
                                    Sum of selected formulation parameters should be 100%
                                </span>
                            </div>
                        );
                    } else {
                        return (
                            <div className="flex items-center gap-2 mt-4 ml-2">
                                <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs text-green-600 dark:text-green-400">
                                    Great! Sum of selected formulation parameters is 100%
                                </span>
                            </div>
                        );
                    }
                })()}
            </div>
        </div>
    )
}

export default  function CompositionInputWrapper({ title = "", removeCompositionIndicator = false }: { title?: string, removeCompositionIndicator?: boolean }) {
    return (
        <Suspense fallback="Loading...">
            <CompositionInput title={title} removeCompositionIndicator={removeCompositionIndicator} />
        </Suspense>
    )
}