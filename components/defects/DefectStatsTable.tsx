"use client"

import React, { useMemo, useState } from "react"
import { useDefects } from "./DefectVisualizationProvider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface DefectStatsTableProps {
  lcl: number | null
  average: number | null
  std: number | null
  ucl: number | null
  onUslChange: (value: number | null) => void
  onLslChange: (value: number | null) => void
}

interface CapabilityStats {
  estimate: number
  lowerCI: number
  upperCI: number
}

const DefectStatsTable: React.FC<DefectStatsTableProps> = ({
  lcl,
  average,
  std,
  ucl,
  onUslChange,
  onLslChange,
}) => {
  const { defects } = useDefects()
  const [uslInput, setUslInput] = useState<string>("")
  const [lslInput, setLslInput] = useState<string>("")

  // Calculate basic statistics
  const basicStats = useMemo(() => {
    if (defects.length === 0) return null

    const distances = defects.map(d => 
      Math.sqrt(d.coord_x * d.coord_x + d.coord_y * d.coord_y)
    )

    const count = distances.length
    const mean = distances.reduce((sum, d) => sum + d, 0) / count
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / (count - 1)
    const stdDev = Math.sqrt(variance)
    const min = Math.min(...distances)
    const max = Math.max(...distances)

    return {
      count,
      mean,
      stdDev,
      min,
      max,
      variance,
    }
  }, [defects])

  // Calculate capability statistics (simplified)
  const capabilityStats = useMemo((): {
    cp: CapabilityStats | null
    cpk: CapabilityStats | null
    pp: CapabilityStats | null
    ppk: CapabilityStats | null
  } => {
    if (!basicStats || !uslInput || !lslInput) {
      return { cp: null, cpk: null, pp: null, ppk: null }
    }

    const usl = parseFloat(uslInput)
    const lsl = parseFloat(lslInput)
    
    if (isNaN(usl) || isNaN(lsl)) {
      return { cp: null, cpk: null, pp: null, ppk: null }
    }

    const { mean, stdDev, count } = basicStats
    
    // Calculate Cp (Process Capability)
    const cp = (usl - lsl) / (6 * stdDev)
    
    // Calculate Cpk (Process Capability Index)
    const cpu = (usl - mean) / (3 * stdDev)
    const cpl = (mean - lsl) / (3 * stdDev)
    const cpk = Math.min(cpu, cpl)
    
    // For confidence intervals, use simplified approximation
    const confidenceLevel = 0.95
    const alpha = 1 - confidenceLevel
    const zAlpha = 1.96 // For 95% confidence
    const standardError = Math.sqrt(1 / (2 * (count - 1)))
    
    return {
      cp: {
        estimate: cp,
        lowerCI: cp - zAlpha * standardError,
        upperCI: cp + zAlpha * standardError,
      },
      cpk: {
        estimate: cpk,
        lowerCI: cpk - zAlpha * standardError,
        upperCI: cpk + zAlpha * standardError,
      },
      pp: {
        estimate: cp, // Simplified: assuming same as Cp
        lowerCI: cp - zAlpha * standardError,
        upperCI: cp + zAlpha * standardError,
      },
      ppk: {
        estimate: cpk, // Simplified: assuming same as Cpk
        lowerCI: cpk - zAlpha * standardError,
        upperCI: cpk + zAlpha * standardError,
      },
    }
  }, [basicStats, uslInput, lslInput])

  const handleUslChange = (value: string) => {
    setUslInput(value)
    const numValue = parseFloat(value)
    onUslChange(isNaN(numValue) ? null : numValue)
  }

  const handleLslChange = (value: string) => {
    setLslInput(value)
    const numValue = parseFloat(value)
    onLslChange(isNaN(numValue) ? null : numValue)
  }

  if (!basicStats) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            No defect data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-2 h-full overflow-auto">
        <div className="text-[10px] font-medium mb-1">Statistical Analysis</div>
        
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {/* Left Column - Basic Statistics */}
          <div className="space-y-0.5">
            <div className="font-medium text-gray-700 text-[10px]">Basic Statistics</div>
            
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[9px]">Count:</span>
                <span className="font-mono text-[9px]">{basicStats.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px]">Mean:</span>
                <span className="font-mono text-[9px]">{basicStats.mean.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px]">Std Dev:</span>
                <span className="font-mono text-[9px]">{basicStats.stdDev.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px]">Min:</span>
                <span className="font-mono text-[9px]">{basicStats.min.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px]">Max:</span>
                <span className="font-mono text-[9px]">{basicStats.max.toFixed(2)}</span>
              </div>
            </div>

            {/* Control Limits */}
            <div className="font-medium text-gray-700 text-[10px] mt-1">Control Limits</div>
            <div className="space-y-0.5">
              {average !== null && (
                <div className="flex justify-between">
                  <span className="text-[9px]">Average:</span>
                  <span className="font-mono text-[9px]">{average.toFixed(2)}</span>
                </div>
              )}
              {ucl !== null && (
                <div className="flex justify-between">
                  <span className="text-[9px]">UCL:</span>
                  <span className="font-mono text-[9px]">{ucl.toFixed(2)}</span>
                </div>
              )}
              {lcl !== null && (
                <div className="flex justify-between">
                  <span className="text-[9px]">LCL:</span>
                  <span className="font-mono text-[9px]">{lcl.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Specification Limits & Capability */}
          <div className="space-y-0.5">
            <div className="font-medium text-gray-700 text-[10px]">Specification Limits</div>
            
            {/* USL Input */}
            <div className="space-y-0.5">
              <Label htmlFor="usl-input" className="text-[9px]">USL:</Label>
              <Input
                id="usl-input"
                type="number"
                step="0.001"
                value={uslInput}
                onChange={(e) => handleUslChange(e.target.value)}
                className="h-5 text-[9px] px-1.5 py-0.5"
                placeholder="Enter USL"
              />
            </div>

            {/* LSL Input */}
            <div className="space-y-0.5">
              <Label htmlFor="lsl-input" className="text-[9px]">LSL:</Label>
              <Input
                id="lsl-input"
                type="number"
                step="0.001"
                value={lslInput}
                onChange={(e) => handleLslChange(e.target.value)}
                className="h-5 text-[9px] px-1.5 py-0.5"
                placeholder="Enter LSL"
              />
            </div>

            {/* Capability Statistics */}
            {(capabilityStats.cp || capabilityStats.cpk) && (
              <div className="mt-1">
                <div className="font-medium text-gray-700 text-[10px]">Capability</div>
                <div className="space-y-0.5">
                  {capabilityStats.cp && (
                    <div className="flex justify-between">
                      <span className="text-[9px]">Cp:</span>
                      <span className="font-mono text-[9px]">{capabilityStats.cp.estimate.toFixed(2)}</span>
                    </div>
                  )}
                  {capabilityStats.cpk && (
                    <div className="flex justify-between">
                      <span className="text-[9px]">Cpk:</span>
                      <span className="font-mono text-[9px]">{capabilityStats.cpk.estimate.toFixed(2)}</span>
                    </div>
                  )}
                  {capabilityStats.pp && (
                    <div className="flex justify-between">
                      <span className="text-[9px]">Pp:</span>
                      <span className="font-mono text-[9px]">{capabilityStats.pp.estimate.toFixed(2)}</span>
                    </div>
                  )}
                  {capabilityStats.ppk && (
                    <div className="flex justify-between">
                      <span className="text-[9px]">Ppk:</span>
                      <span className="font-mono text-[9px]">{capabilityStats.ppk.estimate.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Capability Interpretation */}
        {capabilityStats.cpk && (
          <div className="mt-1 p-1 bg-gray-50 rounded text-[9px]">
            <div className="font-medium text-[9px]">Interpretation:</div>
            <div className="text-gray-600 text-[9px]">
              {capabilityStats.cpk.estimate >= 1.33 && "Process is capable"}
              {capabilityStats.cpk.estimate >= 1.00 && capabilityStats.cpk.estimate < 1.33 && "Process marginally capable"}
              {capabilityStats.cpk.estimate < 1.00 && "Process not capable"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DefectStatsTable