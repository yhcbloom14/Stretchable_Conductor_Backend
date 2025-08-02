"use client"

import { useCallback, useState } from "react"
import DefectBarChart from "./DefectBarChart"
import DefectHistogram from "./DefectHistogram"
import DefectControlChart from "./DefectControlChart"
import DefectStatsTable from "./DefectStatsTable"
import DefectBoxPlot from "./DefectBoxPlot"
import { StatsTooltipProvider, useStatsTooltip } from "./StatsTooltipContext"
import DynamicTooltip from "./DynamicTooltip"

const StatsViewContent = () => {
  const [usl, setUsl] = useState<number | null>(null)
  const [lsl, setLsl] = useState<number | null>(null)
  const [controlLimits, setControlLimits] = useState<{
    lcl: number
    average: number
    std: number
    ucl: number
  } | null>(null)

  const [yDomain, setYDomain] = useState<[number, number] | null>(null)
  const { tooltip } = useStatsTooltip()

  const handleUslChange = (value: number | null) => {
    setUsl(value)
  }

  const handleLslChange = (value: number | null) => {
    setLsl(value)
  }

  const handleControlLimitsChange = useCallback(
    (
      limits: {
        lcl: number
        average: number
        std: number
        ucl: number
      } | null
    ) => {
      setControlLimits(limits)
    },
    []
  )

  const handleYDomainChange = useCallback((domain: [number, number] | null) => {
    setYDomain(domain)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-full gap-2">
        {/* Left column - Split into top and bottom */}
        <div className="w-1/3 h-full flex flex-col gap-2">
          {/* Top half - Bar chart */}
          <div className="h-1/2">
            <div className="h-full border rounded-lg bg-white overflow-hidden">
              <DefectBarChart />
            </div>
          </div>

          {/* Bottom half - Histogram */}
          <div className="h-1/2">
            <div className="h-full border rounded-lg bg-white overflow-hidden">
              <DefectHistogram usl={usl} lsl={lsl} />
            </div>
          </div>
        </div>

        {/* Right column - Control chart (top) with box plot, and stats table (bottom) */}
        <div className="w-2/3 h-full flex flex-col gap-2">
          {/* Top 2/3 - Control chart with box plot */}
          <div className="h-2/3 flex gap-2">
            {/* Control chart - 7/8 width */}
            <div className="w-[87.5%]">
              <div className="h-full border rounded-lg bg-white overflow-hidden">
                <DefectControlChart
                  usl={usl}
                  lsl={lsl}
                  onControlLimitsChange={handleControlLimitsChange}
                  onYDomainChange={handleYDomainChange}
                />
              </div>
            </div>

            {/* Box plot - 1/8 width */}
            <div className="w-[12.5%]">
              <div className="h-full border rounded-lg bg-white overflow-hidden">
                <DefectBoxPlot usl={usl} lsl={lsl} yDomain={yDomain} />
              </div>
            </div>
          </div>

          {/* Bottom 1/3 - Stats table */}
          <div className="h-1/3">
            <DefectStatsTable
              lcl={controlLimits?.lcl ?? null}
              average={controlLimits?.average ?? null}
              std={controlLimits?.std ?? null}
              ucl={controlLimits?.ucl ?? null}
              onUslChange={handleUslChange}
              onLslChange={handleLslChange}
            />
          </div>
        </div>
      </div>
      
      {/* Global Tooltip - positioned absolutely on page */}
      {tooltip.visible && (
        <div
          className="fixed bg-white p-2 rounded shadow-md border border-gray-300 z-50 text-xs pointer-events-none"
          style={{
            left: tooltip.position.x + 10,
            top: tooltip.position.y - 10,
            maxWidth: "300px",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}

const StatsView = () => {
  return (
    <StatsTooltipProvider>
      <StatsViewContent />
    </StatsTooltipProvider>
  )
}

export default StatsView