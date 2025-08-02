"use client"

import { useRef, useEffect, useMemo } from "react"
import * as d3 from "d3"
import { useDefects } from "./DefectVisualizationProvider"
import type { DefectData } from "@/lib/types/Defect"
import { useStatsTooltip } from "./StatsTooltipContext"

// Color mapping for defect types (consistent with ScatterPlot)
const defectColorMap: Record<string, string> = {
  "contamination": "#ec4899",
  "discoloration": "#8b5cf6",
  "deformation": "#10b981",
  "indent": "#f59e0b",
  "oil": "#dc2626",
  "scratch": "#ef4444",
  "spots": "#ea580c",
  "surface_defect": "#7c3aed",
  "wrinkle": "#6b7280",
  "bubble": "#3b82f6",
  "other": "#374151"
}

// Bar chart tooltip content
interface BarChartTooltipProps {
  type: string
  count: number
  total: number
}

const BarChartTooltipContent: React.FC<BarChartTooltipProps> = ({
  type,
  count,
  total,
}) => {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : "0"

  return (
    <>
      <div className="font-bold mb-1 flex items-center justify-between">
        <span>{type.replace(/_/g, " ")}</span>
        {type !== "Total" && (
          <div
            className="w-3 h-3 rounded-sm ml-2"
            style={{ backgroundColor: defectColorMap[type] || defectColorMap["other"] }}
          />
        )}
      </div>
      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Count:</span>
        <span>{count}</span>
      </div>
      {type !== "Total" && (
        <div className="flex justify-between">
          <span className="font-medium mr-2">Percentage:</span>
          <span>{percentage}%</span>
        </div>
      )}
    </>
  )
}

const DefectBarChart = () => {
  const { defects } = useDefects()
  const barChartRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { showTooltip, hideTooltip } = useStatsTooltip()

  // Calculate defect counts by type
  const defectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    
    defects.forEach((defect) => {
      const type = defect.defect_type
      counts[type] = (counts[type] || 0) + 1
    })

    // Convert to array and sort by count (descending)
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [defects])

  const totalDefects = defects.length

  useEffect(() => {
    if (!barChartRef.current || defectCounts.length === 0) return

    // Clear previous chart
    d3.select(barChartRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = { top: 10, right: 10, bottom: 70, left: 40 }
    const width = barChartRef.current.clientWidth - margin.left - margin.right
    const height = barChartRef.current.clientHeight - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(barChartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(defectCounts.map(d => d.type))
      .range([0, width])
      .padding(0.1)

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(defectCounts, d => d.count) || 0])
      .range([height, 0])

    // Create axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d.replace(/_/g, " "))
    const yAxis = d3.axisLeft(yScale)

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "9px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .each(function(d) {
        const text = d3.select(this)
        const words = text.text().replace(/_/g, " ").split(" ")
        if (words.length > 1) {
          text.text(words.map(w => w.substring(0, 4)).join(" "))
        }
      })

    g.append("g").call(yAxis).selectAll("text").style("font-size", "10px")

    // Add axis labels
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-30},${height / 2}) rotate(-90)`)
      .style("font-size", "10px")
      .text("Count")

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2},${height + 55})`)
      .style("font-size", "10px")
      .text("Defect Type")

    // Create bars
    const bars = g
      .selectAll(".bar")
      .data(defectCounts)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.type) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", d => yScale(d.count))
      .attr("height", d => height - yScale(d.count))
      .attr("fill", d => defectColorMap[d.type] || defectColorMap["other"])
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")

    // Add interaction
    bars
      .on("mouseover", (event, d) => {
        // Use page coordinates directly
        showTooltip(
          <BarChartTooltipContent
            type={d.type}
            count={d.count}
            total={totalDefects}
          />,
          event.pageX,
          event.pageY
        )

        // Highlight bar
        d3.select(event.currentTarget)
          .attr("stroke-width", 2)
          .attr("opacity", 0.8)
      })
      .on("mouseout", (event) => {
        hideTooltip()

        // Reset bar appearance
        d3.select(event.currentTarget)
          .attr("stroke-width", 1)
          .attr("opacity", 1)
      })

    // Add count labels on bars
    g.selectAll(".bar-label")
      .data(defectCounts)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => (xScale(d.type) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 3)
      .attr("text-anchor", "middle")
      .style("font-size", "8px")
      .style("font-weight", "bold")
      .text(d => d.count)

  }, [defectCounts, totalDefects])

  return (
    <div ref={containerRef} className="relative w-full h-full p-2">
      <div className="text-xs font-medium text-center mb-1">
        Defect Count by Type
      </div>
      <div className="relative" style={{ height: 'calc(100% - 20px)' }}>
        <svg ref={barChartRef} className="w-full h-full" />
      </div>
    </div>
  )
}

export default DefectBarChart