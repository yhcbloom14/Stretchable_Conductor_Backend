"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { DefectData, DefectBatch, DefectType, DefectSeverity } from "@/lib/types/Defect"
import { getDefectBatches, getDefectData } from "@/lib/data/defects"
import { useAppSelector } from "@/lib/store/hooks"
import { profileSlice } from "@/lib/store/slices/profileSlice"

interface DefectContextType {
  defects: DefectData[]
  batches: DefectBatch[]
  currentBatch: DefectBatch | null
  isLoading: boolean
  error: string | null
  selectedDefectTypes: DefectType[]
  visualizationType: "scatter" | "heatmap" | "stats" | "overview"
  zoomRange: {
    x: [number, number] | null
    y: [number, number] | null
  }
  binSize: { x: number; y: number }
  coordinateBounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  } | null
  
  // Actions
  setSelectedDefectTypes: (types: DefectType[]) => void
  toggleDefectType: (type: DefectType) => void
  selectAllDefectTypes: () => void
  deselectAllDefectTypes: () => void
  setVisualizationType: (type: "scatter" | "heatmap" | "stats" | "overview") => void
  setZoomRange: (range: { x: [number, number] | null; y: [number, number] | null }) => void
  setBinSize: (size: { x: number; y: number }) => void
  setCurrentBatch: (batch: DefectBatch | null) => void
  resetZoom: () => void
}

const DefectContext = createContext<DefectContextType | undefined>(undefined)

// Mock data for development
const mockBatches: DefectBatch[] = [
  {
    id: "1",
    batch_name: "Production Batch A",
    product_name: "Leafy Material",
    batch_number: "A001",
    scan_date: "2023-12-01T10:00:00Z",
    metadata: {},
    defect_count: 25,
    quality_score: 85.2,
    created_at: "2023-12-01T10:00:00Z",
    updated_at: "2023-12-01T10:00:00Z",
    organization_id: "org1"
  }
]

const mockDefects: DefectData[] = [
  {
    id: "1",
    batch_id: "1",
    coord_x: 150.5,
    coord_y: 200.3,
    defect_type: DefectType.SURFACE_CRACK,
    confidence: 0.85,
    severity: DefectSeverity.MEDIUM,
    label: "Surface crack detected",
    created_at: "2023-12-01T10:00:00Z",
    updated_at: "2023-12-01T10:00:00Z",
    organization_id: "org1"
  },
  {
    id: "2",
    batch_id: "1",
    coord_x: 300.2,
    coord_y: 150.8,
    defect_type: DefectType.BUBBLE,
    confidence: 0.92,
    severity: DefectSeverity.LOW,
    label: "Small bubble",
    created_at: "2023-12-01T10:00:00Z",
    updated_at: "2023-12-01T10:00:00Z",
    organization_id: "org1"
  }
]

export const DefectProvider = ({ children }: { children: ReactNode }) => {
  const [defects, setDefects] = useState<DefectData[]>([])
  const [batches, setBatches] = useState<DefectBatch[]>([])
  const [currentBatch, setCurrentBatch] = useState<DefectBatch | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const organizationId = useAppSelector(profileSlice.selectors.selectOrgId)
  
  const [selectedDefectTypes, setSelectedDefectTypes] = useState<DefectType[]>(
    Object.values(DefectType)
  )
  const [visualizationType, setVisualizationType] = useState<
    "scatter" | "heatmap" | "stats" | "overview"
  >("overview")
  
  const [coordinateBounds, setCoordinateBounds] = useState<{
    minX: number
    maxX: number
    minY: number
    maxY: number
  } | null>(null)
  
  const [zoomRange, setZoomRange] = useState<{
    x: [number, number] | null
    y: [number, number] | null
  }>({
    x: null,
    y: null,
  })
  
  const [binSize, setBinSize] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  })

  // Load real data from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!organizationId) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Load defect batches
        const batchesData = await getDefectBatches(organizationId)
        setBatches(batchesData)
        
        // Set the first batch as current, or use mock data if no batches exist
        if (batchesData.length > 0) {
          const firstBatch = batchesData[0]
          setCurrentBatch(firstBatch)
          
          // Load defects for the first batch
          const defectsData = await getDefectData(organizationId, firstBatch.id)
          setDefects(defectsData)
          
          // Calculate coordinate bounds if we have defects
          if (defectsData.length > 0) {
            const bounds = {
              minX: Math.min(...defectsData.map(d => d.coord_x)),
              maxX: Math.max(...defectsData.map(d => d.coord_x)),
              minY: Math.min(...defectsData.map(d => d.coord_y)),
              maxY: Math.max(...defectsData.map(d => d.coord_y))
            }
            setCoordinateBounds(bounds)
            setZoomRange({
              x: [bounds.minX, bounds.maxX],
              y: [bounds.minY, bounds.maxY]
            })
          }
        } else {
          // Fall back to mock data if no real data exists
          setBatches(mockBatches)
          setCurrentBatch(mockBatches[0])
          setDefects(mockDefects)
          
          if (mockDefects.length > 0) {
            const bounds = {
              minX: Math.min(...mockDefects.map(d => d.coord_x)),
              maxX: Math.max(...mockDefects.map(d => d.coord_x)),
              minY: Math.min(...mockDefects.map(d => d.coord_y)),
              maxY: Math.max(...mockDefects.map(d => d.coord_y))
            }
            setCoordinateBounds(bounds)
            setZoomRange({
              x: [0, bounds.maxX],
              y: [0, bounds.maxY]
            })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load defect data")
        console.error('Error loading defect data:', err)
        
        // Fall back to mock data on error
        setBatches(mockBatches)
        setCurrentBatch(mockBatches[0])
        setDefects(mockDefects)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [organizationId])

  const toggleDefectType = (type: DefectType) => {
    setSelectedDefectTypes(prev =>
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const selectAllDefectTypes = () => {
    setSelectedDefectTypes(Object.values(DefectType))
  }

  const deselectAllDefectTypes = () => {
    setSelectedDefectTypes([])
  }

  const resetZoom = () => {
    if (coordinateBounds) {
      setZoomRange({
        x: [0, coordinateBounds.maxX],
        y: [0, coordinateBounds.maxY]
      })
    } else {
      setZoomRange({
        x: null,
        y: null
      })
    }
  }

  const handleSetCurrentBatch = async (batch: DefectBatch | null) => {
    setCurrentBatch(batch)
    if (batch && organizationId) {
      try {
        setIsLoading(true)
        const defectsData = await getDefectData(organizationId, batch.id)
        setDefects(defectsData)
        
        // Update coordinate bounds for the new batch
        if (defectsData.length > 0) {
          const bounds = {
            minX: Math.min(...defectsData.map(d => d.coord_x)),
            maxX: Math.max(...defectsData.map(d => d.coord_x)),
            minY: Math.min(...defectsData.map(d => d.coord_y)),
            maxY: Math.max(...defectsData.map(d => d.coord_y))
          }
          setCoordinateBounds(bounds)
          setZoomRange({
            x: [bounds.minX, bounds.maxX],
            y: [bounds.minY, bounds.maxY]
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load defects for batch")
        console.error('Error loading batch defects:', err)
      } finally {
        setIsLoading(false)
      }
    } else {
      setDefects([])
    }
  }

  return (
    <DefectContext.Provider
      value={{
        defects,
        batches,
        currentBatch,
        isLoading,
        error,
        selectedDefectTypes,
        visualizationType,
        zoomRange,
        binSize,
        coordinateBounds,
        setSelectedDefectTypes,
        toggleDefectType,
        selectAllDefectTypes,
        deselectAllDefectTypes,
        setVisualizationType,
        setZoomRange,
        setBinSize,
        setCurrentBatch: handleSetCurrentBatch,
        resetZoom,
      }}
    >
      {children}
    </DefectContext.Provider>
  )
}

export const useDefects = (): DefectContextType => {
  const context = useContext(DefectContext)
  if (context === undefined) {
    throw new Error("useDefects must be used within a DefectProvider")
  }
  return context
}