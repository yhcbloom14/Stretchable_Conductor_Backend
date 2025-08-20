"use client"

import { NumericalFeature, CategoricalFeature } from "@/lib/types/Template"
import clsx from "clsx"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

interface InputTagProps {
    input: NumericalFeature | CategoricalFeature
}

function InputTag({ input }: InputTagProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [selected, setSelected] = useState(false)

    // Sync state with URL parameters
    useEffect(() => {
        const paramValue = searchParams.get(`${input.featureKey}_include`)
        setSelected(paramValue === "true")
    }, [searchParams, input.featureKey])

    const toggleInput = () => {
        const params = new URLSearchParams(searchParams)
        const newValue = !selected
        if (newValue) {
            params.set(`${input.featureKey}_include`, String(newValue))
        } else {
            params.delete(`${input.featureKey}_include`)
        }
        setSelected(newValue)
        router.push(`?${params.toString()}`, { scroll: false })
    }
    
    return (
        <span 
            className={clsx(
                `inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium 
                transition-all duration-200 cursor-pointer border
                hover:border-blue-400/60 dark:hover:border-blue-400/60 
                hover:drop-shadow-md dark:hover:drop-shadow-md`,
                selected ? `bg-blue-600 dark:bg-blue-600
                text-white dark:text-white
                border-blue-300 dark:border-blue-300`
                : `bg-gray-200 dark:bg-gray-600
                text-gray-600 dark:text-gray-100
                border-gray-300 dark:border-gray-500/60
                hover:bg-blue-200 dark:hover:bg-blue-500`
            )}
            onClick={toggleInput}
            >
            {input.label}
        </span>
    )
}

export default function InputTagWrapper({input}: InputTagProps) {
    return (
        <Suspense fallback="Loading...">
            <InputTag input={input} />
        </Suspense>
    )
}