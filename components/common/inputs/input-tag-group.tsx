"use client"

import { useEffect, useRef, Suspense } from "react";
import InputTag from "./input-tag";
import { NumericalFeature, CategoricalFeature } from "@/lib/types/Template";
import { useRouter, useSearchParams, usePathname } from "next/navigation"

function InputTagGroup({ title = "", inputs }: { title?: string, inputs: (NumericalFeature | CategoricalFeature)[] }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const isInitial = useRef(true)
    // TODO: remove this after MVP demo
    useEffect(() => {
        if (pathname.includes('heatmap')) {
            searchParams.forEach((_, key) => {
                if (key.includes('_include')) {
                isInitial.current = false
                }
            });
            if (isInitial.current) {
                const params = new URLSearchParams(searchParams)
                params.set("M-1_include", "true")
                params.set("M-4_include", "true")
                router.push(`?${params.toString()}`, { scroll: false })
            }
        }
    }, [searchParams, router, pathname])
    return (
        <div className="grid sm:grid-cols-6 px-5 py-4 items-center">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 grow-1 mb-3 sm:mb-0 col-span-6 sm:col-span-2 xl:col-span-1">{title || "Materials"}</h2>
            <div className="px-5 py-1 col-span-4 xl:col-span-5 ">
                <div className="flex flex-row flex-wrap gap-4">
                    {
                        inputs.map((input, i) => (
                            <InputTag key={`input-${i}`} input={input}/>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
export default function InputTagGroupWithSuspense(props: React.ComponentProps<typeof InputTagGroup>) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InputTagGroup {...props} />
        </Suspense>
    );
}