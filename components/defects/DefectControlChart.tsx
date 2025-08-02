"use client"

import { useRef, useEffect, useMemo } from "react"
import * as d3 from "d3"
import { useDefects } from "./DefectVisualizationProvider"
import { useStatsTooltip } from "./StatsTooltipContext"

// Line chart tooltip content
interface LineChartTooltipProps {
  x: number
  count: number
  ucl: number
  lcl: number
  usl: number | null
  lsl: number | null
}

// Component props interface
interface DefectControlChartProps {
  usl: number | null
  lsl: number | null
  onControlLimitsChange?: (
    limits: {
      lcl: number
      average: number
      std: number
      ucl: number
    } | null
  ) => void
  onYDomainChange?: (domain: [number, number] | null) => void
  compact?: boolean
}

const LineChartTooltipContent: React.FC<LineChartTooltipProps> = ({
  x,
  count,
  ucl,
  lcl,
  usl,
  lsl,
}) => {
  return (
    <>
      <div className="font-bold mb-1">Control Chart Point</div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">X Position:</span>
        <span>{x.toFixed(1)}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Count:</span>
        <span>{count}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">UCL:</span>
        <span>{ucl.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">LCL:</span>
        <span>{lcl.toFixed(2)}</span>
      </div>
      {usl !== null && (
        <div className="flex justify-between mb-1">
          <span className="font-medium mr-2">USL:</span>
          <span>{usl.toFixed(2)}</span>
        </div>
      )}
      {lsl !== null && (
        <div className="flex justify-between">
          <span className="font-medium mr-2">LSL:</span>
          <span>{lsl.toFixed(2)}</span>
        </div>
      )}
    </>
  )
}

const DefectControlChart: React.FC<DefectControlChartProps> = ({
  usl,
  lsl,
  onControlLimitsChange,
  onYDomainChange,
  compact = false,
}) => {
  const { defects, coordinateBounds } = useDefects()
  const controlChartRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { showTooltip, hideTooltip } = useStatsTooltip()

  // Create bins based on X coordinate and calculate defect counts
  const controlData = useMemo(() => {
    if (!coordinateBounds || defects.length === 0) return []

    const { minX, maxX } = coordinateBounds
    const binCount = 20
    const binWidth = (maxX - minX) / binCount
    const bins: { x: number; count: number }[] = []

    for (let i = 0; i < binCount; i++) {
      const binStart = minX + i * binWidth
      const binCenter = binStart + binWidth / 2
      const binEnd = binStart + binWidth

      const count = defects.filter(
        d => d.coord_x >= binStart && d.coord_x < binEnd
      ).length

      bins.push({ x: binCenter, count })
    }

    return bins
  }, [defects, coordinateBounds])

  // Calculate control limits
  const controlLimits = useMemo(() => {
    if (controlData.length === 0) return null

    const counts = controlData.map(d => d.count)
    const average = d3.mean(counts) || 0
    const std = d3.deviation(counts) || 1

    const lcl = Math.max(0, average - 3 * std) // Can't have negative defect counts
    const ucl = average + 3 * std

    return { lcl, average, std, ucl }
  }, [controlData])

  // Notify parent of control limits changes
  useEffect(() => {
    if (onControlLimitsChange) {
      onControlLimitsChange(controlLimits)
    }
  }, [controlLimits, onControlLimitsChange])

  // Calculate Y domain and notify parent
  const yDomain = useMemo(() => {
    if (!controlLimits) return null
    const margin = controlLimits.std * 0.5
    return [
      Math.max(0, controlLimits.lcl - margin),
      controlLimits.ucl + margin
    ] as [number, number]
  }, [controlLimits])

  useEffect(() => {
    if (onYDomainChange) {
      onYDomainChange(yDomain)
    }
  }, [yDomain, onYDomainChange])

  useEffect(() => {
    if (!controlChartRef.current || controlData.length === 0 || !controlLimits) return

    // Clear previous chart
    d3.select(controlChartRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = compact 
      ? { top: 10, right: 10, bottom: 10, left: 35 }
      : { top: 10, right: 10, bottom: 35, left: 35 }
    const width = controlChartRef.current.clientWidth - margin.left - margin.right
    const height = controlChartRef.current.clientHeight - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(controlChartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(controlData, d => d.x) as [number, number])
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain(yDomain || [0, controlLimits.ucl + controlLimits.std])
      .range([height, 0])

    // Create axes
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis.ticks(5))
      .selectAll("text")
      .style("font-size", "9px")

    g.append("g")
      .call(yAxis.ticks(5))
      .selectAll("text")
      .style("font-size", "9px")

    // Add axis labels
    if (!compact) {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${-25},${height / 2}) rotate(-90)`)
        .style("font-size", "9px")
        .text("Count")

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width / 2},${height + 28})`)
        .style("font-size", "9px")
        .text("X Coordinate")
    }

    // Draw control limits
    const centerLine = g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(controlLimits.average))
      .attr("y2", yScale(controlLimits.average))
      .attr("stroke", "#00aa00")
      .attr("stroke-width", 2)

    const uclLine = g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(controlLimits.ucl))
      .attr("y2", yScale(controlLimits.ucl))
      .attr("stroke", "#ff0000")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    const lclLine = g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(controlLimits.lcl))
      .attr("y2", yScale(controlLimits.lcl))
      .attr("stroke", "#ff0000")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    // Add control limit labels
    if (!compact) {
      g.append("text")
        .attr("x", width - 3)
        .attr("y", yScale(controlLimits.ucl) - 3)
        .attr("text-anchor", "end")
        .style("font-size", "8px")
        .style("fill", "#ff0000")
        .text("UCL")

      g.append("text")
        .attr("x", width - 3)
        .attr("y", yScale(controlLimits.average) - 3)
        .attr("text-anchor", "end")
        .style("font-size", "8px")
        .style("fill", "#00aa00")
        .text("CL")

      g.append("text")
        .attr("x", width - 3)
        .attr("y", yScale(controlLimits.lcl) + 10)
        .attr("text-anchor", "end")
        .style("font-size", "8px")
        .style("fill", "#ff0000")
        .text("LCL")
    }

    // Draw data line
    const line = d3.line<{ x: number; count: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX)

    g.append("path")
      .datum(controlData)
      .attr("fill", "none")
      .attr("stroke", "#1f77b4")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Draw data points
    const points = g
      .selectAll(".point")
      .data(controlData)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.count))
      .attr("r", 4)
      .attr("fill", d => {
        // Color points based on control limits
        if (d.count > controlLimits.ucl || d.count < controlLimits.lcl) {
          return "#ff0000" // Out of control
        }
        return "#1f77b4" // In control
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")

    // Add interaction to points
    points
      .on("mouseover", (event, d) => {
        showTooltip(
          <LineChartTooltipContent
            x={d.x}
            count={d.count}
            ucl={controlLimits.ucl}
            lcl={controlLimits.lcl}
            usl={usl}
            lsl={lsl}
          />,
          event.pageX,
          event.pageY
        )

        d3.select(event.currentTarget)
          .attr("r", 6)
          .attr("stroke-width", 3)
      })
      .on("mouseout", (event) => {
        hideTooltip()
        d3.select(event.currentTarget)
          .attr("r", 4)
          .attr("stroke-width", 2)
      })

  }, [controlData, controlLimits, yDomain, usl, lsl, compact])

  return (
    <div ref={containerRef} className="relative w-full h-full p-2">
      {!compact && (
        <div className="text-xs font-medium text-center mb-1">
          Control Chart
        </div>
      )}
      <div className="relative" style={{ height: compact ? '100%' : 'calc(100% - 20px)' }}>
        <svg ref={controlChartRef} className="w-full h-full" />
      </div>
    </div>
  )
}

export default DefectControlChart