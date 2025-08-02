"use client"

import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { DefectData, DefectBatch } from "@/lib/types/Defect"

interface DefectVisualizationContextType {
  defects: DefectData[]
  currentBatch: DefectBatch | null
  isLoading: boolean
  coordinateBounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  } | null
}

const DefectVisualizationContext = createContext<DefectVisualizationContextType | undefined>(undefined)

interface DefectVisualizationProviderProps {
  children: ReactNode
  defects: DefectData[]
  currentBatch: DefectBatch | null
  isLoading?: boolean
}

export const DefectVisualizationProvider: React.FC<DefectVisualizationProviderProps> = ({
  children,
  defects,
  currentBatch,
  isLoading = false,
}) => {
  // Calculate coordinate bounds from provided defects
  const coordinateBounds = defects.length > 0 ? {
    minX: Math.min(...defects.map(d => d.coord_x)),
    maxX: Math.max(...defects.map(d => d.coord_x)),
    minY: Math.min(...defects.map(d => d.coord_y)),
    maxY: Math.max(...defects.map(d => d.coord_y))
  } : null

  return (
    <DefectVisualizationContext.Provider
      value={{
        defects,
        currentBatch,
        isLoading,
        coordinateBounds,
      }}
    >
      {children}
    </DefectVisualizationContext.Provider>
  )
}

export const useDefects = (): DefectVisualizationContextType => {
  const context = useContext(DefectVisualizationContext)
  if (context === undefined) {
    throw new Error("useDefects must be used within a DefectVisualizationProvider")
  }
  return context
}