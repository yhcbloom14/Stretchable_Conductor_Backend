import type { DefectData } from "@/lib/types/Defect";

// Interface for bin bounds
export interface BinBounds {
  start: number;
  end: number;
  center: number;
}

// Calculate consistent bin boundaries for given domains and bin size
export function calculateBinBounds(
  xDomain: [number, number],
  yDomain: [number, number],
  binSize: { x: number; y: number }
): {
  xBins: BinBounds[];
  yBins: BinBounds[];
} {
  const [xMin, xMax] = xDomain;
  const [yMin, yMax] = yDomain;

  // Validate inputs
  if (
    !isFinite(xMin) ||
    !isFinite(xMax) ||
    !isFinite(yMin) ||
    !isFinite(yMax)
  ) {
    return { xBins: [], yBins: [] };
  }

  if (
    !isFinite(binSize.x) ||
    !isFinite(binSize.y) ||
    binSize.x <= 0 ||
    binSize.y <= 0
  ) {
    return { xBins: [], yBins: [] };
  }

  if (xMax <= xMin || yMax <= yMin) {
    return { xBins: [], yBins: [] };
  }

  // Calculate X bins
  const numXBins = Math.ceil((xMax - xMin) / binSize.x);
  const xBins: BinBounds[] = [];
  for (let i = 0; i < numXBins; i++) {
    const start = xMin + i * binSize.x;
    const end = start + binSize.x;
    const center = start + binSize.x / 2;
    xBins.push({ start, end, center });
  }

  // Calculate Y bins
  const numYBins = Math.ceil((yMax - yMin) / binSize.y);
  const yBins: BinBounds[] = [];
  for (let i = 0; i < numYBins; i++) {
    const start = yMin + i * binSize.y;
    const end = start + binSize.y;
    const center = start + binSize.y / 2;
    yBins.push({ start, end, center });
  }

  return { xBins, yBins };
}

// Calculate grid line positions for scatter plot
export function calculateGridLines(
  xDomain: [number, number],
  yDomain: [number, number],
  binSize: { x: number; y: number }
): {
  xLines: number[];
  yLines: number[];
} {
  const { xBins, yBins } = calculateBinBounds(xDomain, yDomain, binSize);

  // Grid lines should be at bin boundaries
  const xLines: number[] = [];
  const yLines: number[] = [];

  // Add lines at bin starts, and final line at the end of last bin
  xBins.forEach((bin) => xLines.push(bin.start));
  if (xBins.length > 0) {
    xLines.push(xBins[xBins.length - 1].end); // Add final boundary
  }

  yBins.forEach((bin) => yLines.push(bin.start));
  if (yBins.length > 0) {
    yLines.push(yBins[yBins.length - 1].end); // Add final boundary
  }

  // Filter to only include lines within the domain
  const filteredXLines = xLines.filter(
    (x) => x >= xDomain[0] && x <= xDomain[1]
  );
  const filteredYLines = yLines.filter(
    (y) => y >= yDomain[0] && y <= yDomain[1]
  );

  return {
    xLines: filteredXLines,
    yLines: filteredYLines,
  };
}

// Updated heatmap data generation using consistent binning
export function generateHeatmapData(
  defects: DefectData[],
  selectedTypes: string[],
  xDomain: [number, number],
  yDomain: [number, number],
  binSize: { x: number; y: number }
): {
  x: number;
  y: number;
  value: number;
  bounds: { xStart: number; xEnd: number; yStart: number; yEnd: number };
}[] {
  // Filter defects based on selected types
  const filteredDefects = defects.filter(
    (d) =>
      selectedTypes.length === 0 ||
      selectedTypes.includes(d.defect_type)
  );

  const { xBins, yBins } = calculateBinBounds(xDomain, yDomain, binSize);

  // Initialize heatmap grid
  const grid: number[][] = Array(yBins.length)
    .fill(0)
    .map(() => Array(xBins.length).fill(0));

  // Populate grid
  filteredDefects.forEach((defect) => {
    if (
      defect.coord_x >= xDomain[0] &&
      defect.coord_x <= xDomain[1] &&
      defect.coord_y >= yDomain[0] &&
      defect.coord_y <= yDomain[1]
    ) {
      // Find which bin this defect belongs to
      const xBinIndex = xBins.findIndex(
        (bin) => defect.coord_x >= bin.start && defect.coord_x < bin.end
      );
      const yBinIndex = yBins.findIndex(
        (bin) => defect.coord_y >= bin.start && defect.coord_y < bin.end
      );

      // Handle edge case where defect is exactly at the maximum boundary
      const finalXBinIndex = xBinIndex >= 0 ? xBinIndex : xBins.length - 1;
      const finalYBinIndex = yBinIndex >= 0 ? yBinIndex : yBins.length - 1;

      if (
        finalXBinIndex >= 0 &&
        finalXBinIndex < xBins.length &&
        finalYBinIndex >= 0 &&
        finalYBinIndex < yBins.length
      ) {
        grid[finalYBinIndex][finalXBinIndex]++;
      }
    }
  });

  // Convert grid to data points with bin boundary information
  const heatmapData: {
    x: number;
    y: number;
    value: number;
    bounds: { xStart: number; xEnd: number; yStart: number; yEnd: number };
  }[] = [];

  for (let yIdx = 0; yIdx < yBins.length; yIdx++) {
    for (let xIdx = 0; xIdx < xBins.length; xIdx++) {
      heatmapData.push({
        x: xBins[xIdx].center,
        y: yBins[yIdx].center,
        value: grid[yIdx][xIdx],
        bounds: {
          xStart: xBins[xIdx].start,
          xEnd: xBins[xIdx].end,
          yStart: yBins[yIdx].start,
          yEnd: yBins[yIdx].end,
        },
      });
    }
  }

  return heatmapData;
}

// Get coordinate bounds from defects array
export function getCoordinateBounds(defects: DefectData[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (defects.length === 0) {
    return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 };
  }

  const xValues = defects.map((d) => d.coord_x);
  const yValues = defects.map((d) => d.coord_y);

  return {
    minX: Math.min(...xValues),
    maxX: Math.max(...xValues),
    minY: Math.min(...yValues),
    maxY: Math.max(...yValues),
  };
}