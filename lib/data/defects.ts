import { DefectBatch, DefectData, DefectType, DefectSeverity } from '@/lib/types/Defect'
import { defectAPI } from '@/lib/api/defects'

// Defect Batches API
export async function getDefectBatches(organizationId: string): Promise<DefectBatch[]> {
  try {
    return await defectAPI.getBatches()
  } catch (error) {
    console.error('Error fetching defect batches:', error)
    throw new Error(`Failed to fetch defect batches`)
  }
}

export async function getDefectBatch(id: string): Promise<DefectBatch | null> {
  try {
    return await defectAPI.getBatch(id)
  } catch (error) {
    console.error('Error fetching defect batch:', error)
    return null
  }
}

export async function createDefectBatch(batch: Omit<DefectBatch, 'id' | 'created_at' | 'updated_at' | 'defect_count' | 'quality_score'>): Promise<DefectBatch> {
  try {
    return await defectAPI.createBatch(batch)
  } catch (error) {
    console.error('Error creating defect batch:', error)
    throw new Error(`Failed to create defect batch`)
  }
}

export async function updateDefectBatch(id: string, updates: Partial<DefectBatch>): Promise<DefectBatch> {
  try {
    return await defectAPI.updateBatch(id, updates)
  } catch (error) {
    console.error('Error updating defect batch:', error)
    throw new Error(`Failed to update defect batch`)
  }
}

export async function deleteDefectBatch(id: string): Promise<void> {
  try {
    await defectAPI.deleteBatch(id)
  } catch (error) {
    console.error('Error deleting defect batch:', error)
    throw new Error(`Failed to delete defect batch`)
  }
}

// Defect Data API
export async function getDefectData(organizationId: string, batchId?: string): Promise<DefectData[]> {
  try {
    if (batchId) {
      return await defectAPI.getDefectsForBatch(batchId)
    }
    // For now, we need to get all batches and then get defects for each
    // This is not optimal but maintains compatibility
    const batches = await defectAPI.getBatches()
    const allDefects: DefectData[] = []
    for (const batch of batches) {
      const defects = await defectAPI.getDefectsForBatch(batch.id)
      allDefects.push(...defects)
    }
    return allDefects
  } catch (error) {
    console.error('Error fetching defect data:', error)
    throw new Error(`Failed to fetch defect data`)
  }
}

export async function getDefect(id: string): Promise<DefectData | null> {
  try {
    return await defectAPI.getDefectData(id)
  } catch (error) {
    console.error('Error fetching defect:', error)
    return null
  }
}

export async function createDefectData(defect: Omit<DefectData, 'id' | 'created_at' | 'updated_at'>): Promise<DefectData> {
  try {
    const defects = await defectAPI.createDefectData([defect])
    return defects[0]
  } catch (error) {
    console.error('Error creating defect data:', error)
    throw new Error(`Failed to create defect data`)
  }
}

export async function createBulkDefectData(defects: Omit<DefectData, 'id' | 'created_at' | 'updated_at'>[]): Promise<DefectData[]> {
  try {
    return await defectAPI.createDefectData(defects)
  } catch (error) {
    console.error('Error creating bulk defect data:', error)
    throw new Error(`Failed to create bulk defect data`)
  }
}

export async function updateDefectData(id: string, updates: Partial<DefectData>): Promise<DefectData> {
  try {
    return await defectAPI.updateDefectData(id, updates)
  } catch (error) {
    console.error('Error updating defect data:', error)
    throw new Error(`Failed to update defect data`)
  }
}

export async function deleteDefectData(id: string): Promise<void> {
  try {
    await defectAPI.deleteDefectData(id)
  } catch (error) {
    console.error('Error deleting defect data:', error)
    throw new Error(`Failed to delete defect data`)
  }
}

// Analytics and Statistics API
export async function getDefectStatistics(organizationId: string, batchId?: string) {
  try {
    if (batchId) {
      return await defectAPI.getBatchStatistics(batchId)
    }
    
    // For organization-wide statistics, we need to aggregate from all batches
    const batches = await defectAPI.getBatches()
    let allDefects: any[] = []
    
    for (const batch of batches) {
      const defects = await defectAPI.getDefectsForBatch(batch.id)
      allDefects = allDefects.concat(defects)
    }
    
    // Calculate statistics
    const totalDefects = allDefects.length
    const highSeverityDefects = allDefects.filter(d => 
      d.severity === DefectSeverity.HIGH || d.severity === DefectSeverity.CRITICAL
    ).length

    const averageConfidence = allDefects.length > 0 
      ? allDefects.reduce((sum, d) => sum + d.confidence, 0) / allDefects.length 
      : 0

    // Group by defect type
    const defectTypeDistribution = allDefects.reduce((acc, defect) => {
      acc[defect.defect_type] = (acc[defect.defect_type] || 0) + 1
      return acc
    }, {} as Record<DefectType, number>)

    // Group by severity
    const severityDistribution = allDefects.reduce((acc, defect) => {
      acc[defect.severity] = (acc[defect.severity] || 0) + 1
      return acc
    }, {} as Record<DefectSeverity, number>)

    return {
      totalDefects,
      highSeverityDefects,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      defectTypeDistribution,
      severityDistribution
    }
  } catch (error) {
    console.error('Error fetching defect statistics:', error)
    throw new Error(`Failed to fetch defect statistics`)
  }
}

export async function getBatchQualityTrends(organizationId: string, days: number = 30) {
  try {
    const batches = await defectAPI.getBatches()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Filter batches by date range
    const filteredBatches = batches.filter(batch => {
      const batchDate = new Date(batch.scan_date)
      return batchDate >= startDate
    })
    
    // Sort by scan_date
    filteredBatches.sort((a, b) => 
      new Date(a.scan_date).getTime() - new Date(b.scan_date).getTime()
    )
    
    return filteredBatches.map(batch => ({
      scan_date: batch.scan_date,
      quality_score: batch.quality_score,
      defect_count: batch.defect_count,
      product_name: batch.product_name
    }))
  } catch (error) {
    console.error('Error fetching quality trends:', error)
    throw new Error(`Failed to fetch quality trends`)
  }
}

export async function getDefectHeatmapData(batchId: string) {
  try {
    const defects = await defectAPI.getDefectsForBatch(batchId)
    return defects.map(defect => ({
      coord_x: defect.coord_x,
      coord_y: defect.coord_y,
      defect_type: defect.defect_type,
      severity: defect.severity,
      confidence: defect.confidence
    }))
  } catch (error) {
    console.error('Error fetching defect heatmap data:', error)
    throw new Error(`Failed to fetch defect heatmap data`)
  }
}

// Search and filtering
export async function searchDefectBatches(organizationId: string, query: string): Promise<DefectBatch[]> {
  try {
    const batches = await defectAPI.getBatches()
    const lowerQuery = query.toLowerCase()
    
    // Filter batches based on search query
    const filtered = batches.filter(batch => 
      batch.batch_name?.toLowerCase().includes(lowerQuery) ||
      batch.product_name?.toLowerCase().includes(lowerQuery) ||
      batch.batch_number?.toLowerCase().includes(lowerQuery)
    )
    
    // Sort by scan_date descending
    filtered.sort((a, b) => 
      new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime()
    )
    
    return filtered
  } catch (error) {
    console.error('Error searching defect batches:', error)
    throw new Error(`Failed to search defect batches`)
  }
}

export async function filterDefectsByType(organizationId: string, defectType: DefectType): Promise<DefectData[]> {
  try {
    // Get all defects from all batches and filter by type
    const batches = await defectAPI.getBatches()
    let allDefects: DefectData[] = []
    
    for (const batch of batches) {
      const defects = await defectAPI.getDefectsForBatch(batch.id)
      const filtered = defects.filter(d => d.defect_type === defectType)
      allDefects = allDefects.concat(filtered)
    }
    
    // Sort by created_at descending
    allDefects.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    return allDefects
  } catch (error) {
    console.error('Error filtering defects by type:', error)
    throw new Error(`Failed to filter defects by type`)
  }
}

export async function filterDefectsBySeverity(organizationId: string, severity: DefectSeverity): Promise<DefectData[]> {
  try {
    // Get all defects from all batches and filter by severity
    const batches = await defectAPI.getBatches()
    let allDefects: DefectData[] = []
    
    for (const batch of batches) {
      const defects = await defectAPI.getDefectsForBatch(batch.id)
      const filtered = defects.filter(d => d.severity === severity)
      allDefects = allDefects.concat(filtered)
    }
    
    // Sort by created_at descending
    allDefects.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    return allDefects
  } catch (error) {
    console.error('Error filtering defects by severity:', error)
    throw new Error(`Failed to filter defects by severity`)
  }
}

// Batch processing and file upload support
export async function processDefectFile(
  organizationId: string, 
  userId: string,
  fileData: {
    batch_name: string
    product_name: string
    batch_number: string
    scan_date: string
    defects: Array<{
      coord_x: number
      coord_y: number
      defect_type: DefectType
      confidence: number
      severity: DefectSeverity
      label?: string
      properties?: Record<string, any>
    }>
    metadata?: Record<string, any>
  }
): Promise<{ batch: DefectBatch; defects: DefectData[] }> {
  // For file upload, we'll use the upload endpoint
  // First create the batch
  const batch = await createDefectBatch({
    batch_name: fileData.batch_name,
    product_name: fileData.product_name,
    batch_number: fileData.batch_number,
    scan_date: new Date(fileData.scan_date),
    metadata: fileData.metadata || {},
    organization_id: organizationId,
    user_id: userId
  })

  // Create defects in bulk
  const defectsToCreate = fileData.defects.map(defect => ({
    ...defect,
    batch_id: batch.id,
    organization_id: organizationId
  }))

  const defects = await createBulkDefectData(defectsToCreate)

  return { batch, defects }
}