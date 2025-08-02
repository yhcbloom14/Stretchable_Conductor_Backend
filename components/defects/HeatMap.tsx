"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { useDefects } from "./DefectVisualizationProvider";
import type { DefectData } from "@/lib/types/Defect";
import { generateHeatmapData } from "@/lib/utils/defectVisualization";
import DynamicTooltip from "./DynamicTooltip";
import { HeatmapTooltipContent } from "./TooltipContents";

interface HeatMapProps {
  selectedDefectTypes: string[];
  zoomRange: {
    x: [number, number] | null;
    y: [number, number] | null;
  };
  binSize: { x: number; y: number };
  onZoomChange?: (range: { x: [number, number] | null; y: [number, number] | null }) => void;
  onVisualizationChange?: (type: "scatter" | "heatmap") => void;
}

const HeatMap: React.FC<HeatMapProps> = ({
  selectedDefectTypes,
  zoomRange,
  binSize,
  onZoomChange,
  onVisualizationChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { defects, isLoading, coordinateBounds } = useDefects();
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
    count: number;
    defects: DefectData[];
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate static heatmap data once when defects or selected types change
  const staticHeatmapData = useMemo(() => {
    if (!defects.length || !coordinateBounds) return [];

    // Use the same domain logic as ScatterPlot for consistency
    const { minX, maxX, minY, maxY } = coordinateBounds;
    const xDomain = zoomRange.x || [minX, maxX];
    const yDomain = zoomRange.y || [minY, maxY];

    // Use the zoom domain (same as ScatterPlot) for generating the heatmap
    return generateHeatmapData(
      defects,
      selectedDefectTypes,
      xDomain, // ← Use zoom domain, not full bounds
      yDomain, // ← Use zoom domain, not full bounds
      binSize
    );
  }, [defects, selectedDefectTypes, coordinateBounds, binSize, zoomRange]);

  // Calculate max value for color scaling once
  const maxValue = useMemo(() => {
    return d3.max(staticHeatmapData, (d) => d.value) || 1;
  }, [staticHeatmapData]);

  useEffect(() => {
    if (
      isLoading ||
      !defects.length ||
      !svgRef.current ||
      !coordinateBounds ||
      !staticHeatmapData.length
    )
      return;

    // Clear any existing elements
    d3.select(svgRef.current).selectAll("*").remove();

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

    // Add a clipping path for the plot area
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "plot-area-clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    // Create a group for the plot that respects the clipping path
    const plotArea = g.append("g").attr("clip-path", "url(#plot-area-clip)");

    // Determine x and y ranges based on zoom or full data
    const { minX, maxX, minY, maxY } = coordinateBounds;
    const xDomain = zoomRange.x || [minX, maxX];
    const yDomain = zoomRange.y || [minY, maxY];

    // Use the static binned heatmap data but only adjust the scales based on zoom

    // Create scales based on current zoom
    const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);
    const yScale = d3.scaleLinear().domain(yDomain).range([height, 0]);

    // Since we now generate heatmap data for the current zoom domain,
    // we can use all the staticHeatmapData
    const visibleCells = staticHeatmapData;

    // Calculate max value for visible cells only
    const visibleMaxValue = d3.max(visibleCells, (d) => d.value) || 1;

    // Inversed RdBu colormap (blue for 0, red for max)
    const colorScale = d3
      .scaleSequential()
      .domain([0, visibleMaxValue])
      .interpolator((t) => d3.interpolateReds(t)); // the red scale

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

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 15;
    const svgWidth = width + margin.left + margin.right;

    const legendGroup = svg
      .append("g")
      .attr("class", "color-legend")
      .attr("transform", `translate(${(svgWidth - legendWidth) / 2}, 15)`);

    // Create gradient
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    // Add colors to gradient - inverted RdBu
    const stops = [0, 0.25, 0.5, 0.75, 1];
    stops.forEach((stop) => {
      gradient
        .append("stop")
        .attr("offset", `${stop * 100}%`)
        .attr("stop-color", colorScale(visibleMaxValue * stop)) // Use stop directly instead of (1 - stop)
        .attr("stop-opacity", 1);
    });

    // Add gradient rect
    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#heatmap-gradient)");

    // Add legend labels
    legendGroup
      .append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 15)
      .style("font-size", "12px")
      .text("0");

    legendGroup
      .append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .text(`${visibleMaxValue}`);

    legendGroup
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Defect Count");

    // Draw heatmap cells
    const cells = plotArea
      .selectAll(".heatmap-cell")
      .data(visibleCells)
      .enter()
      .append("rect")
      .attr("class", "heatmap-cell")
      .attr("x", (d) => xScale(d.bounds.xStart))
      .attr("y", (d) => yScale(d.bounds.yEnd))
      .attr("width", (d) => xScale(d.bounds.xEnd) - xScale(d.bounds.xStart))
      .attr("height", (d) => yScale(d.bounds.yStart) - yScale(d.bounds.yEnd))
      .attr("fill", (d) => colorScale(d.value))
      .style("stroke", "#e0e0e0")
      .style("stroke-width", 0.5)
      .style("cursor", "pointer");

    // Add interaction to cells
    cells
      .on("mouseover", (event, d) => {
        // Find all defects in this cell (for cells with defects)
        const cellDefects = defects.filter((defect) => {
          if (!selectedDefectTypes.includes(defect.defect_type)) return false;

          const inXRange =
            defect.coord_x >= d.bounds.xStart && defect.coord_x < d.bounds.xEnd;
          const inYRange =
            defect.coord_y >= d.bounds.yStart && defect.coord_y < d.bounds.yEnd;
          return inXRange && inYRange;
        });

        setHoveredCell({
          x: d.x,
          y: d.y,
          count: d.value,
          defects: cellDefects,
        });

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

        // Highlight the cell
        d3.select(event.currentTarget)
          .style("stroke", "black")
          .style("stroke-width", 2);
      })
      .on("mouseout", (event) => {
        setHoveredCell(null);

        // Restore cell style
        d3.select(event.currentTarget)
          .style("stroke", "#e0e0e0")
          .style("stroke-width", 0.5);
      })
      .on("dblclick", (_event, d) => {
        if (!onZoomChange || !onVisualizationChange) return;
        
        // Add full cell size margin on each side for better context
        const xMargin = binSize.x;
        const yMargin = binSize.y;

        // Calculate initial zoom range with margins
        const initialXMin = d.bounds.xStart - xMargin;
        const initialXMax = d.bounds.xEnd + xMargin;
        const initialYMin = d.bounds.yStart - yMargin;
        const initialYMax = d.bounds.yEnd + yMargin;

        // Predict what the rounded values will be (same rounding logic as Toolbar)
        const roundDownToTen = (value: number): number =>
          Math.floor(value / 10) * 10;
        const roundUpToTen = (value: number): number =>
          Math.ceil(value / 10) * 10;

        const roundedXMin = roundDownToTen(initialXMin);
        const roundedXMax = roundUpToTen(initialXMax);
        const roundedYMin = roundDownToTen(initialYMin);
        const roundedYMax = roundUpToTen(initialYMax);

        // Calculate the center of the original cell
        const cellCenterX = (d.bounds.xStart + d.bounds.xEnd) / 2;
        const cellCenterY = (d.bounds.yStart + d.bounds.yEnd) / 2;

        // Calculate the center of the rounded range
        const roundedCenterX = (roundedXMin + roundedXMax) / 2;
        const roundedCenterY = (roundedYMin + roundedYMax) / 2;

        // Calculate offset needed to center the cell
        const offsetX = cellCenterX - roundedCenterX;
        const offsetY = cellCenterY - roundedCenterY;

        // Adjust the zoom range to compensate for rounding
        const adjustedXMin = initialXMin + offsetX;
        const adjustedXMax = initialXMax + offsetX;
        const adjustedYMin = initialYMin + offsetY;
        const adjustedYMax = initialYMax + offsetY;

        onZoomChange({
          x: [adjustedXMin, adjustedXMax],
          y: [adjustedYMin, adjustedYMax],
        });

        // Switch to scatter view
        onVisualizationChange("scatter");
      });
  }, [
    defects,
    isLoading,
    coordinateBounds,
    zoomRange,
    staticHeatmapData,
    maxValue,
    selectedDefectTypes,
    binSize,
    onZoomChange,
    onVisualizationChange,
  ]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      <DynamicTooltip
        x={tooltipPosition.x}
        y={tooltipPosition.y}
        visible={hoveredCell !== null}
      >
        {hoveredCell && (
          <HeatmapTooltipContent
            x={hoveredCell.x}
            y={hoveredCell.y}
            count={hoveredCell.count}
            defects={hoveredCell.defects}
          />
        )}
      </DynamicTooltip>
    </div>
  );
};

export default HeatMap;