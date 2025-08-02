"use client"

import ScatterPlot from "./ScatterPlot"
import HeatMap from "./HeatMap"
import { DefectData, DefectType } from "@/lib/types/Defect"

interface ZoomRange {
  x: [number, number] | null
  y: [number, number] | null
}

interface VisualizationSettings {
  showLabels: boolean
  showConfidence: boolean
  minConfidence: number
  zoomLevel: number
  selectedTypes: DefectType[]
  selectedSeverities: any[]
  visualizationType: "scatter" | "heatmap"
  binSize: { x: number; y: number }
}

interface DefectVisualizationContentProps {
  settings: VisualizationSettings
  zoomRange: ZoomRange
  filteredDefects: DefectData[]
  defects: DefectData[]
  handleZoomChange: (range: ZoomRange) => void
  handleVisualizationChange: (type: "scatter" | "heatmap") => void
}

const DefectVisualizationContent: React.FC<DefectVisualizationContentProps> = ({
  settings,
  zoomRange,
  filteredDefects,
  defects,
  handleZoomChange,
  handleVisualizationChange,
}) => {
  return (
    <div className="relative border rounded-lg bg-gray-50 overflow-hidden" style={{ height: '600px' }}>
      {settings.visualizationType === "scatter" ? (
        <ScatterPlot
          selectedDefectTypes={settings.selectedTypes}
          zoomRange={zoomRange}
          binSize={settings.binSize}
        />
      ) : (
        <HeatMap
          selectedDefectTypes={settings.selectedTypes}
          zoomRange={zoomRange}
          binSize={settings.binSize}
          onZoomChange={handleZoomChange}
          onVisualizationChange={handleVisualizationChange}
        />
      )}
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium">
          {filteredDefects.length} defects displayed
        </div>
        {defects.length !== filteredDefects.length && (
          <div className="text-xs text-muted-foreground">
            {defects.length - filteredDefects.length} filtered out
          </div>
        )}
      </div>
    </div>
  )
}

export default DefectVisualizationContent