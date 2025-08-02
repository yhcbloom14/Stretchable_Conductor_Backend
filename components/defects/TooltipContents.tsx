import type { DefectData } from "@/lib/types/Defect";
import { useDefects } from "./DefectVisualizationProvider";

// Color mapping for defect types (adapted from LeafyDefectDetection)
const defectColorMap: Record<string, string> = {
  "SURFACE_CRACK": "#1f77b4",
  "BUBBLE": "#aec7e8", 
  "CONTAMINATION": "#e377c2",
  "DELAMINATION": "#ff7f0e",
  "WRINKLE": "#ffbb78",
  "HOLE": "#2ca02c",
  "SCRATCH": "#98df8a",
  "STAIN": "#d62728",
  "OTHER": "#c7c7c7",
  "UNKNOWN": "#c7c7c7"
};

// ScatterPlot tooltip content
export interface ScatterTooltipProps {
  defect: DefectData | null;
}

export const ScatterTooltipContent: React.FC<ScatterTooltipProps> = ({
  defect,
}) => {
  const { currentBatch } = useDefects();

  if (!defect) return null;

  const color = defectColorMap[defect.defect_type] || defectColorMap["UNKNOWN"];

  return (
    <>
      <div className="font-bold mb-1 flex items-center justify-between">
        <span>{defect.defect_type.replace(/_/g, " ")}</span>
        <div
          className="w-3 h-3 rounded-sm ml-2"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Position:</span>
        <span>
          ({defect.coord_x.toFixed(2)}, {defect.coord_y.toFixed(2)})
        </span>
      </div>

      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Confidence:</span>
        <span>{(defect.confidence * 100).toFixed(1)}%</span>
      </div>

      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Severity:</span>
        <span>{defect.severity}</span>
      </div>

      {defect.label && (
        <div className="flex justify-between mb-1">
          <span className="font-medium mr-2">Label:</span>
          <span>{defect.label}</span>
        </div>
      )}

      {/* Display properties from dumps data */}
      {defect.properties && (
        <>
          {defect.properties.缺陷名稱 && (
            <div className="flex justify-between mb-1">
              <span className="font-medium mr-2">缺陷名稱:</span>
              <span>{defect.properties.缺陷名稱}</span>
            </div>
          )}

          {defect.properties.組 && (
            <div className="flex justify-between mb-1">
              <span className="font-medium mr-2">組:</span>
              <span>{defect.properties.組}</span>
            </div>
          )}

          {defect.properties.判定回路 && (
            <div className="flex justify-between mb-1">
              <span className="font-medium mr-2">判定回路:</span>
              <span>{defect.properties.判定回路}</span>
            </div>
          )}

          {defect.properties.外接宽度 !== undefined && (
            <div className="flex justify-between mb-1">
              <span className="font-medium mr-2">外接宽度:</span>
              <span>{defect.properties.外接宽度}</span>
            </div>
          )}

          {defect.properties.外接长度 !== undefined && (
            <div className="flex justify-between mb-1">
              <span className="font-medium mr-2">外接长度:</span>
              <span>{defect.properties.外接长度}</span>
            </div>
          )}

          {defect.properties.img_path && (
            <>
              <div className="flex justify-between mb-1">
                <span className="font-medium mr-2">Image:</span>
                <span className="truncate max-w-32">{defect.properties.img_path}</span>
              </div>

              <div className="mt-2">
                <img
                  src={`/dumps/${currentBatch?.id}/${defect.properties.img_path}`}
                  alt={`Defect ${defect.label}`}
                  className="max-w-full h-auto"
                  style={{ maxHeight: "120px" }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/150?text=Image+Not+Found";
                  }}
                />
              </div>
            </>
          )}

          {defect.properties.labels && defect.properties.labels.length > 1 && (
            <div className="mb-1">
              <div className="font-medium">All possible types:</div>
              <div className="grid grid-cols-2 gap-1">
                {defect.properties.labels.map((label: string, index: number) => (
                  <div key={index} className="truncate">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

// HeatMap tooltip content
export interface HeatmapTooltipProps {
  x: number;
  y: number;
  count: number;
  defects: DefectData[];
}

export const HeatmapTooltipContent: React.FC<HeatmapTooltipProps> = ({
  x,
  y,
  count,
  defects,
}) => {
  const { currentBatch } = useDefects();

  // Find the top defect types (max 4)
  const typeCounts: Record<string, number> = {};
  defects.forEach((d) => {
    const type = d.defect_type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Get up to 4 example images
  const exampleDefects = defects.slice(0, 4);

  return (
    <>
      <div className="font-bold mb-1">Region Details</div>

      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Position:</span>
        <span>
          ({x.toFixed(2)}, {y.toFixed(2)})
        </span>
      </div>

      <div className="flex justify-between mb-1">
        <span className="font-medium mr-2">Total Defects:</span>
        <span>
          {count}
          {count === 0 && <span className="ml-1 text-gray-500">(None)</span>}
        </span>
      </div>

      {topTypes.length > 0 && (
        <div className="mb-1">
          <div className="font-medium mb-1">Top Defect Types:</div>
          {topTypes.map(([type, count], index) => (
            <div key={index} className="flex justify-between">
              <span className="mr-2">{type.replace(/_/g, " ")}:</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      )}

      {count === 0 && (
        <div className="text-xs text-gray-700 mb-1">
          This is a defect-free region.
        </div>
      )}

      {exampleDefects.length > 0 && (
        <div>
          <div className="font-medium mb-1">Example Images:</div>
          <div className="grid grid-cols-2 gap-1">
            {exampleDefects.map((defect, index) => (
              <div key={index} className="flex flex-col items-center">
                {defect.properties?.img_path && (
                  <>
                    <img
                      src={`/dumps/${currentBatch?.id}/${defect.properties.img_path}`}
                      alt={`Defect ${defect.label}`}
                      className="w-full h-auto"
                      style={{ maxHeight: "60px" }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/150?text=Not+Found";
                      }}
                    />
                    <span className="text-xs truncate w-full text-center">
                      {defect.defect_type.replace(/_/g, " ")}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};