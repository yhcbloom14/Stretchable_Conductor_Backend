"use client"

import { useRef, useEffect, useMemo } from "react"
import * as d3 from "d3"
import { useDefects } from "./DefectVisualizationProvider"
import { useStatsTooltip } from "./StatsTooltipContext"

// Define bin data structure
interface BinData {
  count: number
  position: number
}

// Box plot tooltip content interface
interface BoxPlotTooltipProps {
  type: "box" | "median" | "whisker" | "outlier"
  value?: number
  binPosition?: number
  stats: {
    min: number
    q1: number
    median: number
    q3: number
    max: number
    iqr: number
    whiskerBottom: number
    whiskerTop: number
  }
}

// Component props interface
interface DefectBoxPlotProps {
  usl: number | null
  lsl: number | null
  yDomain: [number, number] | null
}

// Box plot tooltip content component
const BoxPlotTooltipContent: React.FC<BoxPlotTooltipProps> = ({
  type,
  value,
  binPosition,
  stats,
}) => {
  return (
    <>
      <div className="font-bold mb-1">
        {type === "box" && "Box (Q1-Q3)"}
        {type === "median" && "Median"}
        {type === "whisker" && "Whisker"}
        {type === "outlier" && "Outlier"}
      </div>
      
      {value !== undefined && (
        <div className="flex justify-between mb-1">
          <span className="font-medium mr-2">Value:</span>
          <span>{value.toFixed(2)}</span>
        </div>
      )}
      
      {binPosition !== undefined && (
        <div className="flex justify-between mb-1">
          <span className="font-medium mr-2">Position:</span>
          <span>{binPosition.toFixed(1)}</span>
        </div>
      )}
      
      <div className="border-t pt-1 mt-1">
        <div className="text-xs text-gray-600">Box Plot Statistics:</div>
        <div className="flex justify-between">
          <span className="text-xs mr-2">Min:</span>
          <span className="text-xs">{stats.min.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs mr-2">Q1:</span>
          <span className="text-xs">{stats.q1.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs mr-2">Median:</span>
          <span className="text-xs">{stats.median.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs mr-2">Q3:</span>
          <span className="text-xs">{stats.q3.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs mr-2">Max:</span>
          <span className="text-xs">{stats.max.toFixed(2)}</span>
        </div>
      </div>
    </>
  )
}

const DefectBoxPlot: React.FC<DefectBoxPlotProps> = ({ usl, lsl, yDomain }) => {
  const { defects, coordinateBounds } = useDefects()
  const boxPlotRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { showTooltip, hideTooltip } = useStatsTooltip()

  // Create bins and calculate defect counts (same as control chart)
  const binData = useMemo(() => {
    if (!coordinateBounds || defects.length === 0) return []

    const { minX, maxX } = coordinateBounds
    const binCount = 20
    const binWidth = (maxX - minX) / binCount
    const bins: BinData[] = []

    for (let i = 0; i < binCount; i++) {
      const binStart = minX + i * binWidth
      const binCenter = binStart + binWidth / 2
      const binEnd = binStart + binWidth

      const count = defects.filter(
        d => d.coord_x >= binStart && d.coord_x < binEnd
      ).length

      bins.push({ position: binCenter, count })
    }

    return bins
  }, [defects, coordinateBounds])

  // Calculate box plot statistics
  const boxStats = useMemo(() => {
    if (binData.length === 0) return null

    const counts = binData.map(d => d.count).sort((a, b) => a - b)
    const n = counts.length

    const min = counts[0]
    const max = counts[n - 1]
    const q1 = d3.quantile(counts, 0.25) || 0
    const median = d3.quantile(counts, 0.5) || 0
    const q3 = d3.quantile(counts, 0.75) || 0
    const iqr = q3 - q1

    // Calculate whiskers
    const whiskerBottom = Math.max(min, q1 - 1.5 * iqr)
    const whiskerTop = Math.min(max, q3 + 1.5 * iqr)

    // Find outliers
    const outliers = counts.filter(c => c < whiskerBottom || c > whiskerTop)

    return {
      min,
      q1,
      median,
      q3,
      max,
      iqr,
      whiskerBottom,
      whiskerTop,
      outliers,
    }
  }, [binData])

  useEffect(() => {
    if (!boxPlotRef.current || !boxStats) return

    // Clear previous chart
    d3.select(boxPlotRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = { top: 10, right: 5, bottom: 10, left: 5 }
    const width = boxPlotRef.current.clientWidth - margin.left - margin.right
    const height = boxPlotRef.current.clientHeight - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(boxPlotRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Use provided yDomain or calculate from data
    const domain = yDomain || [boxStats.whiskerBottom, boxStats.whiskerTop]
    const yScale = d3.scaleLinear().domain(domain).range([height, 0])

    // Box plot parameters
    const boxWidth = Math.max(10, width * 0.6)
    const boxX = (width - boxWidth) / 2

    // Draw whiskers
    const whiskerLine = g
      .append("line")
      .attr("x1", width / 2)
      .attr("x2", width / 2)
      .attr("y1", yScale(boxStats.whiskerBottom))
      .attr("y2", yScale(boxStats.whiskerTop))
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")

    // Whisker caps
    g.append("line")
      .attr("x1", boxX)
      .attr("x2", boxX + boxWidth)
      .attr("y1", yScale(boxStats.whiskerBottom))
      .attr("y2", yScale(boxStats.whiskerBottom))
      .attr("stroke", "#000")
      .attr("stroke-width", 2)

    g.append("line")
      .attr("x1", boxX)
      .attr("x2", boxX + boxWidth)
      .attr("y1", yScale(boxStats.whiskerTop))
      .attr("y2", yScale(boxStats.whiskerTop))
      .attr("stroke", "#000")
      .attr("stroke-width", 2)

    // Draw box
    const box = g
      .append("rect")
      .attr("x", boxX)
      .attr("y", yScale(boxStats.q3))
      .attr("width", boxWidth)
      .attr("height", yScale(boxStats.q1) - yScale(boxStats.q3))
      .attr("fill", "#69b3a2")
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")

    // Draw median line
    const medianLine = g
      .append("line")
      .attr("x1", boxX)
      .attr("x2", boxX + boxWidth)
      .attr("y1", yScale(boxStats.median))
      .attr("y2", yScale(boxStats.median))
      .attr("stroke", "#000")
      .attr("stroke-width", 3)
      .style("cursor", "pointer")

    // Draw outliers
    const outlierData = boxStats.outliers.map((value, index) => ({
      value,
      x: boxX + boxWidth / 2 + (Math.random() - 0.5) * boxWidth * 0.3,
      y: yScale(value),
    }))

    const outliers = g
      .selectAll(".outlier")
      .data(outlierData)
      .enter()
      .append("circle")
      .attr("class", "outlier")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 3)
      .attr("fill", "#ff6b6b")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")

    // Add interactions
    const handleMouseOver = (event: MouseEvent, type: BoxPlotTooltipProps["type"], value?: number) => {
      showTooltip(
        <BoxPlotTooltipContent
          type={type}
          value={value}
          stats={boxStats}
        />,
        event.pageX,
        event.pageY
      )
    }

    const handleMouseOut = () => {
      hideTooltip()
    }

    box.on("mouseover", (event) => handleMouseOver(event, "box"))
      .on("mouseout", handleMouseOut)

    medianLine.on("mouseover", (event) => handleMouseOver(event, "median", boxStats.median))
      .on("mouseout", handleMouseOut)

    whiskerLine.on("mouseover", (event) => handleMouseOver(event, "whisker"))
      .on("mouseout", handleMouseOut)

    outliers.on("mouseover", (event, d) => handleMouseOver(event, "outlier", d.value))
      .on("mouseout", handleMouseOut)

    // Add specification limits if provided
    if (usl !== null && yScale.domain()[0] <= usl && usl <= yScale.domain()[1]) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(usl))
        .attr("y2", yScale(usl))
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3")
    }

    if (lsl !== null && yScale.domain()[0] <= lsl && lsl <= yScale.domain()[1]) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(lsl))
        .attr("y2", yScale(lsl))
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3")
    }

  }, [boxStats, yDomain, usl, lsl])

  return (
    <div ref={containerRef} className="relative w-full h-full p-1">
      <svg ref={boxPlotRef} className="w-full h-full" />
    </div>
  )
}

export default DefectBoxPlot