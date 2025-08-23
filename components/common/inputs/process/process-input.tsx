"use client"

import { selectProcess } from "@/lib/store/slices/templateSlice";
import Card from "../../card";
import { useAppSelector } from "@/lib/store/hooks";
import NumericalInput from "../numerical-input";
import CategoricalInput from "../categorical-input";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ProcessSegment } from "@/lib/types/Template";
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import InputTagGroup from '../input-tag-group';

type SegmentType = ProcessSegment & { isSelected: boolean}
function ProcessInput({ isSelectable = true, title = "" }: { isSelectable?: boolean, title?: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const process = useAppSelector(selectProcess)
    const [segments, setSegments] = useState<SegmentType[]>([])

    // Get the current Deformation Sequence value to determine Applied Pre-Strain options
    const getDeformationSequenceValue = () => {
        return searchParams.get("Deformation Sequence") || "G₁–1D"
    }

    // Filter Applied Pre-Strain options based on Deformation Sequence
    const getFilteredPreStrainOptions = (segment: ProcessSegment) => {
        if (segment.featureKey === "Applied Pre-Strain (%)") {
            const deformationValue = getDeformationSequenceValue()
            console.log(`Filtering Applied Pre-Strain options. Deformation: ${deformationValue}`)
            if (deformationValue === "G₁–1D" || deformationValue === "G₁–2D") {
                // Only allow 0 for G1 options
                const filtered = segment.options.filter(option => option === "0")
                console.log(`G1 deformation selected, filtered options:`, filtered)
                return filtered
            } else {
                // Allow all options for G2 options
                console.log(`G2 deformation selected, all options:`, segment.options)
                return segment.options
            }
        }
        return segment.options
    }

    // Memoize the updateValue callback
    const updateValue = useCallback((featureKey: string, isSelected: boolean, value: number | string) => {
        setSegments(prevSegments => 
            prevSegments.map(segment => 
                segment.featureKey === featureKey
                    ? { ...segment, value, isSelected }
                    : segment
            )
        )
    }, [])

    // Sync with URL parameters
    useEffect(() => {
        const params = process.map(feature => {
            const value = searchParams.get(feature.featureKey)
            const isSelected = searchParams.get(`${feature.featureKey}_include`) === "true"
            if (value !== null) {
                return {...feature, value: feature.type === "num" ? Number(value) : value, isSelected }
            } else {
                return {...feature, value: feature.type === "num" ? feature.min : feature.options[0], isSelected }
            }
        })
        setSegments(params)
    }, [searchParams, process])

    // Watch for Deformation Sequence changes and update Applied Pre-Strain accordingly
    useEffect(() => {
        const deformationValue = getDeformationSequenceValue()
        console.log(`Deformation Sequence changed to: ${deformationValue}`)
        if (deformationValue === "G₁–1D" || deformationValue === "G₁–2D") {
            // Force Applied Pre-Strain to 0 for G1 options
            const currentPreStrain = searchParams.get("Applied Pre-Strain (%)")
            console.log(`G1 deformation detected, current Pre-Strain: ${currentPreStrain}`)
            if (currentPreStrain !== "0") {
                console.log(`Forcing Applied Pre-Strain to 0`)
                const urlParams = new URLSearchParams(searchParams)
                urlParams.set("Applied Pre-Strain (%)", "0")
                router.replace(`?${urlParams.toString()}`, { scroll: false })
            }
        }
    }, [searchParams, router])

    // Optimize URL parameter updates with debouncing
    const updateUrlParams = useDebouncedCallback((segments: ProcessSegment[]) => {
        const urlParams = new URLSearchParams(searchParams)
        let hasChanges = false

        segments.forEach((segment) => {
            const currentValue = searchParams.get(segment.featureKey)
            const newValue = segment.value.toString()
            
            if (currentValue !== newValue) {
                urlParams.set(segment.featureKey, newValue)
                hasChanges = true
            }
        })

        if (hasChanges) {
            router.replace(`?${urlParams.toString()}`, { scroll: false })
        }
    }, 300)

    useEffect(() => {
        updateUrlParams(segments)
    }, [segments, updateUrlParams])
    
    const Segment = ({ segment }: { segment: SegmentType }) => {
        const isSelected = searchParams.get(`${segment.featureKey}_include`) === "true"
        
        // Get filtered options for this segment
        const filteredOptions = getFilteredPreStrainOptions(segment)
        
        // If this is Applied Pre-Strain and the current value is not in filtered options, reset to first available option
        const getValidValue = () => {
            if (segment.featureKey === "Applied Pre-Strain (%)") {
                if (!filteredOptions.includes(segment.value as string)) {
                    return filteredOptions[0]
                }
            }
            return segment.value
        }
        
        return (
            <div className="w-full flex flex-col">
                {
                    segment.type === "num" ? (
                        <NumericalInput
                            label={segment.label}
                            name={`${segment.featureKey}`}
                            min={segment.min}
                            max={segment.max}
                            step={segment.std}
                            value={segment.value as number}
                            onChange={updateValue.bind(null, segment.featureKey, segment.isSelected)}
                            disabled={isSelected}
                        />
                    ) : (
                        <CategoricalInput
                            label={segment.label}
                            name={`${segment.featureKey}`}
                            options={filteredOptions.map((option: any )=> ({value: option, label: option}))}
                            value={getValidValue() as string}
                            onChange={updateValue.bind(null, segment.featureKey, segment.isSelected)}
                            disabled={isSelected}
                        />
                    )
                }
            </div>
        )
    }
    // Don't render anything if there are no process parameters
    if (process.length === 0) {
        return null
    }

    return (
        <div className="space-y-6 mt-8">
            {isSelectable && (
                <Card>
                    <InputTagGroup title="Select Key Processing Parameters" inputs={process} />
                </Card>
            )}
            {segments.length > 0 && (
                <Card>
                    <div className="px-5 py-4">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            {title || ""}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                            {
                                segments.map((segment, i) => (
                                    <Segment key={`process-segment-${i}`} segment={segment} />
                                ))
                            }
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default function ProcessInputWrapper({ isSelectable = true, title = "" }: { isSelectable?: boolean, title?: string }) {
    return (
        <Suspense fallback="Loading...">
            <ProcessInput isSelectable={isSelectable} title={title} />
        </Suspense>
    )
}