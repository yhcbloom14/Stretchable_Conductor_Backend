"use client"

import { useRef, useEffect, useMemo } from "react"
import * as d3 from "d3"
import { useDefects } from "./DefectVisualizationProvider"
import { useStatsTooltip } from "./StatsTooltipContext"

// Histogram tooltip content
interface HistogramTooltipProps {
  binStart: number
  binEnd: number
  count: number
}

// Gaussian tooltip content
interface GaussianTooltipProps {
  value: number
  probability: number
  average: number
  std: number
}

// Component props interface
interface DefectHistogramProps {
  usl: number | null
  lsl: number | null
}

const HistogramTooltipContent: React.FC<HistogramTooltipProps> = ({
  binStart,
  binEnd,
  count,
}) => {
  return (
    <>
      <div className="font-bold mb-1">Histogram Bin</div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Range:</span>
        <span>{binStart.toFixed(1)} - {binEnd.toFixed(1)}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium mr-2">Count:</span>
        <span>{count}</span>
      </div>
    </>
  )
}

const GaussianTooltipContent: React.FC<GaussianTooltipProps> = ({
  value,
  probability,
  average,
  std,
}) => {
  return (
    <>
      <div className="font-bold mb-1">Normal Distribution</div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">X:</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Density:</span>
        <span>{probability.toFixed(4)}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Mean:</span>
        <span>{average.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium mr-2">Std Dev:</span>
        <span>{std.toFixed(2)}</span>
      </div>
    </>
  )
}

const DefectHistogram: React.FC<DefectHistogramProps> = ({ usl, lsl }) => {
  const { defects } = useDefects()
  const histogramRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { showTooltip, hideTooltip } = useStatsTooltip()

  // Calculate position data for histogram
  const positionData = useMemo(() => {
    return defects.map(d => Math.sqrt(d.coord_x * d.coord_x + d.coord_y * d.coord_y))
  }, [defects])

  // Calculate statistics
  const stats = useMemo(() => {
    if (positionData.length === 0) return null

    const mean = d3.mean(positionData) || 0
    const std = d3.deviation(positionData) || 1
    const min = d3.min(positionData) || 0
    const max = d3.max(positionData) || 1

    return { mean, std, min, max }
  }, [positionData])

  useEffect(() => {
    if (!histogramRef.current || positionData.length === 0 || !stats) return

    // Clear previous chart
    d3.select(histogramRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = { top: 10, right: 10, bottom: 35, left: 35 }
    const width = histogramRef.current.clientWidth - margin.left - margin.right
    const height = histogramRef.current.clientHeight - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(histogramRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create histogram
    const xScale = d3
      .scaleLinear()
      .domain([stats.min, stats.max])
      .range([0, width])

    const histogram = d3
      .histogram()
      .value(d => d)
      .domain(xScale.domain() as [number, number])
      .thresholds(xScale.ticks(20))

    const bins = histogram(positionData)
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
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
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-25},${height / 2}) rotate(-90)`)
      .style("font-size", "9px")
      .text("Frequency")

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2},${height + 28})`)
      .style("font-size", "9px")
      .text("Distance")

    // Draw histogram bars
    const bars = g
      .selectAll(".bar")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x0 || 0))
      .attr("width", d => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1))
      .attr("y", d => yScale(d.length))
      .attr("height", d => height - yScale(d.length))
      .attr("fill", "#69b3a2")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")

    // Add interaction to bars
    bars
      .on("mouseover", (event, d) => {
        showTooltip(
          <HistogramTooltipContent
            binStart={d.x0 || 0}
            binEnd={d.x1 || 0}
            count={d.length}
          />,
          event.pageX,
          event.pageY
        )

        d3.select(event.currentTarget).attr("opacity", 0.7)
      })
      .on("mouseout", (event) => {
        hideTooltip()
        d3.select(event.currentTarget).attr("opacity", 1)
      })

    // Draw normal distribution overlay
    const normalLine = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveBasis)

    const normalData: [number, number][] = []
    const xValues = xScale.ticks(100)
    const scaleFactor = (d3.max(bins, d => d.length) || 1) * 0.8

    xValues.forEach(x => {
      const z = (x - stats.mean) / stats.std
      const probability = (1 / (stats.std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z)
      const scaledProbability = probability * scaleFactor * (stats.max - stats.min) / 20
      normalData.push([x, scaledProbability])
    })

    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 2)
      .attr("d", normalLine)

    // Add specification limits if provided
    if (usl !== null) {
      g.append("line")
        .attr("x1", xScale(usl))
        .attr("x2", xScale(usl))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")

      g.append("text")
        .attr("x", xScale(usl))
        .attr("y", -2)
        .attr("text-anchor", "middle")
        .style("font-size", "8px")
        .style("fill", "#ff0000")
        .text("USL")
    }

    if (lsl !== null) {
      g.append("line")
        .attr("x1", xScale(lsl))
        .attr("x2", xScale(lsl))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")

      g.append("text")
        .attr("x", xScale(lsl))
        .attr("y", -2)
        .attr("text-anchor", "middle")
        .style("font-size", "8px")
        .style("fill", "#ff0000")
        .text("LSL")
    }

  }, [positionData, stats, usl, lsl])

  return (
    <div ref={containerRef} className="relative w-full h-full p-2">
      <div className="text-xs font-medium text-center mb-1">
        Distance Distribution
      </div>
      <div className="relative" style={{ height: 'calc(100% - 20px)' }}>
        <svg ref={histogramRef} className="w-full h-full" />
      </div>
    </div>
  )
}

export default DefectHistogram