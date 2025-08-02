"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { useDefects } from "./DefectVisualizationProvider";
import type { DefectData } from "@/lib/types/Defect";
import { calculateGridLines } from "@/lib/utils/defectVisualization";
import DynamicTooltip from "./DynamicTooltip";
import { ScatterTooltipContent } from "./TooltipContents";

// Color mapping for defect types
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
  "other": "#374151"
};

interface ScatterPlotProps {
  selectedDefectTypes: string[];
  zoomRange: {
    x: [number, number] | null;
    y: [number, number] | null;
  };
  binSize: { x: number; y: number };
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  selectedDefectTypes,
  zoomRange,
  binSize,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { defects, isLoading, coordinateBounds } = useDefects();
  const [hoveredDefect, setHoveredDefect] = useState<DefectData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isLoading || !defects.length || !svgRef.current || !coordinateBounds)
      return;

    // Clear any existing elements
    d3.select(svgRef.current).selectAll("*").remove();

    // Determine x and y ranges based on zoom or full data
    const { minX, maxX, minY, maxY } = coordinateBounds;
    const xDomain = zoomRange.x || [minX, maxX];
    const yDomain = zoomRange.y || [minY, maxY];

    // Filter defects based on selected types and current zoom range
    const filteredDefects = defects.filter((d) => {
      // Check if the defect is within the current zoom range
      const isInXRange = d.coord_x >= xDomain[0] && d.coord_x <= xDomain[1];
      const isInYRange = d.coord_y >= yDomain[0] && d.coord_y <= yDomain[1];
      return (
        selectedDefectTypes.includes(d.defect_type) && isInXRange && isInYRange
      );
    });

    // Set up dimensions
    const margin = { top: 50, right: 50, bottom: 40, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // Create the main group element
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add clip path to ensure points don't render outside the plot area
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "plot-area-clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // Create a group for the plot area with clipping
    const plotArea = g.append("g").attr("clip-path", "url(#plot-area-clip)");

    // Create scales
    const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);
    const yScale = d3.scaleLinear().domain(yDomain).range([height, 0]);

    // Add background grid to show bins
    const gridGroup = plotArea.append("g").attr("class", "grid");

    // Calculate grid lines using unified function
    const { xLines, yLines } = calculateGridLines(xDomain, yDomain, binSize);

    // Add vertical grid lines (x-direction)
    xLines.forEach((x) => {
      gridGroup
        .append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);
    });

    // Add horizontal grid lines (y-direction)
    yLines.forEach((y) => {
      gridGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(y))
        .attr("y2", yScale(y))
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);
    });

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "12px");
    g.append("g").call(yAxis).selectAll("text").style("font-size", "12px");

    // Add axis labels
    g.append("text")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${-margin.left + 15},${height / 2}) rotate(-90)`
      )
      .style("font-size", "12px")
      .text("Y Coordinate");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
      .style("font-size", "12px")
      .text("X Coordinate");

    // Add legend
    const legendItemWidth = 120;
    const legendItemHeight = 20;
    const legendItemsPerRow = Math.floor(width / legendItemWidth);
    const legendColors = selectedDefectTypes
      .filter(type => defectColorMap[type])
      .map((type) => ({
        type,
        color: defectColorMap[type],
      }));

    // Calculate total legend width and position it in center
    const svgWidth = width + margin.left + margin.right;
    // Calculate actual width needed for the legend
    const totalLegendWidth =
      Math.min(legendColors.length, legendItemsPerRow) * legendItemWidth;

    // TODO: Using Visualization page legend, but this can cause color mismatch.
    // Should add defectColorMap to types/Defect for consistency

    // const legend = svg
    //   .append("g")
    //   .attr("class", "legend")
    //   .attr("transform", `translate(${(svgWidth - totalLegendWidth) / 2},10)`);

    // const legendItems = legend
    //   .selectAll<SVGGElement, { type: string; color: string }>(".legend-item")
    //   .data(legendColors)
    //   .enter()
    //   .append("g")
    //   .attr("class", "legend-item")
    //   .attr("transform", (_, i) => {
    //     const row = Math.floor(i / legendItemsPerRow);
    //     const col = i % legendItemsPerRow;
    //     return `translate(${col * legendItemWidth},${row * legendItemHeight})`;
    //   });

    // legendItems
    //   .append("rect")
    //   .attr("width", 12)
    //   .attr("height", 12)
    //   .attr("fill", (d) => d.color);

    // legendItems
    //   .append("text")
    //   .attr("x", 16)
    //   .attr("y", 10)
    //   .style("font-size", "12px")
    //   .text((d) => d.type.replace(/_/g, " "));

    // Draw data points - using the plotArea with clipping
    const points = plotArea
      .selectAll<SVGRectElement, DefectData>(".defect-point")
      .data(filteredDefects)
      .enter()
      .append("rect")
      .attr("class", "defect-point")
      .attr("x", (d) => xScale(d.coord_x) - 7.5)
      .attr("y", (d) => yScale(d.coord_y) - 7.5)
      .attr("width", 15)
      .attr("height", 15)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr(
        "fill",
        (d) => defectColorMap[d.defect_type] || defectColorMap["other"]
      )
      .attr("fill-opacity", 0.7)
      .style("cursor", "pointer");

    // Add interaction
    points
      .on("mouseover", (event, d: DefectData) => {
        setHoveredDefect(d);
        // Use clientX/clientY instead of pageX/pageY for more precise positioning
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (svgRect) {
          setTooltipPosition({
            x: event.clientX - svgRect.left,
            y: event.clientY - svgRect.top,
          });
        } else {
          setTooltipPosition({ x: event.clientX, y: event.clientY });
        }

        // Highlight the point
        d3.select(event.currentTarget)
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", () => xScale(d.coord_x) - 10)
          .attr("y", () => yScale(d.coord_y) - 10);
      })
      .on("mouseout", (event) => {
        setHoveredDefect(null);

        // Restore point size
        d3.select(event.currentTarget)
          .attr("width", 15)
          .attr("height", 15)
          .attr("x", function () {
            const d = d3.select(this).datum() as DefectData;
            return xScale(d.coord_x) - 7.5;
          })
          .attr("y", function () {
            const d = d3.select(this).datum() as DefectData;
            return yScale(d.coord_y) - 7.5;
          });
      });
  }, [
    defects,
    isLoading,
    selectedDefectTypes,
    zoomRange,
    coordinateBounds,
    binSize,
  ]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      <DynamicTooltip
        x={tooltipPosition.x}
        y={tooltipPosition.y}
        visible={hoveredDefect !== null}
      >
        <ScatterTooltipContent defect={hoveredDefect} />
      </DynamicTooltip>
    </div>
  );
};

export default ScatterPlot;