"use client"

import { Suspense, lazy } from "react"
import { SkeletonChart } from "@/components/common/skeleton"
import { HeatmapProps } from "@/components/heatmap"

// Lazy load the Heatmap component to reduce initial bundle size
const Heatmap = lazy(() => import("@/components/heatmap"))

export default function HeatmapLazy(props: HeatmapProps) {
    return (
        <Suspense fallback={<SkeletonChart />}>
            <Heatmap {...props} />
        </Suspense>
    )
}