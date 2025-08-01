// Defect detection module API client and utilities

import { 
  DefectData, 
  DefectBatch, 
  DefectType, 
  DefectSeverity,
  DefectStatistics,
  DefectVisualizationSettings,
  DefectAnalysisResult,
  DefectCluster
} from '@/lib/types/Defect'

export class DefectAPI {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  // Batches
  async getBatches(): Promise<DefectBatch[]> {
    try {
      // First try to get batch list from dumps directory
      const batchListResponse = await fetch('/dumps/batch_list.json')
      if (batchListResponse.ok) {
        const batchNames = await batchListResponse.json()
        if (Array.isArray(batchNames)) {
          // Convert batch names to DefectBatch objects
          const batches: DefectBatch[] = []
          
          for (const batchName of batchNames) {
            try {
              // Try to get metadata for each batch
              const metaResponse = await fetch(`/dumps/${batchName}/defects.meta.json`)
              let batchInfo: any = {}
              
              if (metaResponse.ok) {
                const metadata = await metaResponse.json()
                batchInfo = metadata.batch_info || {}
              }
              
              // Get defects count
              const defectsResponse = await fetch(`/dumps/${batchName}/defects.json`)
              let defectCount = 0
              if (defectsResponse.ok) {
                const defects = await defectsResponse.json()
                defectCount = Array.isArray(defects) ? defects.length : 0
              }
              
              // Parse batch name (assuming format: ProductName-BatchNumber)
              const dashIndex = batchName.indexOf('-')
              const productName = dashIndex > 0 ? batchName.substring(0, dashIndex) : 'Unknown Product'
              const batchNumber = dashIndex > 0 ? batchName.substring(dashIndex + 1) : batchName
              
              batches.push({
                id: batchName,
                batch_name: batchInfo.batchNo || batchName,
                product_name: batchInfo.productName || productName,
                batch_number: batchInfo.batchNo || batchNumber,
                scan_date: batchInfo.inspectionStartTime || new Date().toISOString(),
                metadata: batchInfo,
                defect_count: defectCount,
                quality_score: this.calculateQualityScore(defectCount),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                organization_id: 'dumps',
                user_id: 'system'
              })
            } catch (error) {
              console.warn(`Failed to load metadata for batch ${batchName}:`, error)
              // Create basic batch info even if metadata fails
              const dashIndex = batchName.indexOf('-')
              const productName = dashIndex > 0 ? batchName.substring(0, dashIndex) : 'Unknown Product'
              const batchNumber = dashIndex > 0 ? batchName.substring(dashIndex + 1) : batchName
              
              batches.push({
                id: batchName,
                batch_name: batchName,
                product_name: productName,
                batch_number: batchNumber,
                scan_date: new Date().toISOString(),
                metadata: {},
                defect_count: 0,
                quality_score: 100,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                organization_id: 'dumps',
                user_id: 'system'
              })
            }
          }
          
          return batches
        }
      }
    } catch (error) {
      console.warn('Failed to fetch from dumps directory, falling back to API:', error)
    }
    
    // Fallback to original API approach
    const response = await fetch(`${this.baseUrl}/defects/batches`)
    if (!response.ok) {
      throw new Error(`Failed to fetch batches: ${response.statusText}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  }
  
  private calculateQualityScore(defectCount: number): number {
    // Simple quality score calculation - could be made more sophisticated
    if (defectCount === 0) return 100
    if (defectCount < 10) return 90
    if (defectCount < 25) return 80
    if (defectCount < 50) return 70
    if (defectCount < 100) return 60
    return 50
  }

  async getBatch(id: string): Promise<DefectBatch> {
    try {
      // First try to get batch from dumps directory
      const metaResponse = await fetch(`/dumps/${id}/defects.meta.json`)
      if (metaResponse.ok) {
        const metadata = await metaResponse.json()
        const batchInfo = metadata.batch_info || {}
        
        // Get defects count
        const defectsResponse = await fetch(`/dumps/${id}/defects.json`)
        let defectCount = 0
        if (defectsResponse.ok) {
          const defects = await defectsResponse.json()
          defectCount = Array.isArray(defects) ? defects.length : 0
        }
        
        // Parse batch name
        const dashIndex = id.indexOf('-')
        const productName = dashIndex > 0 ? id.substring(0, dashIndex) : 'Unknown Product'
        const batchNumber = dashIndex > 0 ? id.substring(dashIndex + 1) : id
        
        return {
          id: id,
          batch_name: batchInfo.batchNo || id,
          product_name: batchInfo.productName || productName,
          batch_number: batchInfo.batchNo || batchNumber,
          scan_date: batchInfo.inspectionStartTime || new Date().toISOString(),
          metadata: batchInfo,
          defect_count: defectCount,
          quality_score: this.calculateQualityScore(defectCount),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          organization_id: 'dumps',
          user_id: 'system'
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch batch from dumps for ${id}, falling back to API:`, error)
    }
    
    // Fallback to original API approach
    const response = await fetch(`${this.baseUrl}/defects/batches/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch batch: ${response.statusText}`)
    }
    return response.json()
  }

  async createBatch(batch: Omit<DefectBatch, 'id' | 'created_at' | 'updated_at' | 'defect_count' | 'quality_score'>): Promise<DefectBatch> {
    const response = await fetch(`${this.baseUrl}/defects/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch)
    })
    if (!response.ok) {
      throw new Error(`Failed to create batch: ${response.statusText}`)
    }
    return response.json()
  }

  async updateBatch(id: string, updates: Partial<DefectBatch>): Promise<DefectBatch> {
    const response = await fetch(`${this.baseUrl}/defects/batches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) {
      throw new Error(`Failed to update batch: ${response.statusText}`)
    }
    return response.json()
  }

  async deleteBatch(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/defects/batches/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`Failed to delete batch: ${response.statusText}`)
    }
  }

  // Defect Data
  async getDefectsForBatch(batchId: string): Promise<DefectData[]> {
    try {
      // First try to get defects from dumps directory
      const defectsResponse = await fetch(`/dumps/${batchId}/defects.json`)
      if (defectsResponse.ok) {
        const defects = await defectsResponse.json()
        if (Array.isArray(defects)) {
          // Convert the dump format to DefectData format
          return defects.map((defect: any, index: number) => ({
            id: `${batchId}_${index}`,
            batch_id: batchId,
            coord_x: defect.coord_x || 0,
            coord_y: defect.coord_y || 0,
            defect_type: this.mapDefectType(defect.label || 'UNKNOWN'),
            confidence: defect.label_probs?.[0] || (defect.HighConfidence ? 0.9 : 0.5),
            severity: this.mapSeverity(defect['等級'] || defect.severity || 2),
            label: this.mapDefectType(defect.label) || defect['缺陷名稱'] || 'Unknown defect',
            properties: {
              img_path: defect.img_path,
              labels: defect.labels,
              label_probs: defect.label_probs,
              HighConfidence: defect.HighConfidence,
              Group: defect['組'],
              Circuit: defect['判定回路'],
              Width: defect['外接宽度'],
              Length: defect['外接长度'],
              ...defect.properties
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization_id: 'dumps'
          }))
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch defects from dumps for batch ${batchId}, falling back to API:`, error)
    }
    
    // Fallback to original API approach
    const response = await fetch(`${this.baseUrl}/defects/batches/${batchId}/defects`)
    if (!response.ok) {
      throw new Error(`Failed to fetch defects: ${response.statusText}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  }
  
  private mapDefectType(type: string): string {
    // Map different defect type formats to our enum, including Chinese labels
    const typeMap: Record<string, string> = {
      // English mappings (matching DefectType enum values)
      // 'surface_crack': 'surface_crack',
      // 'bubble': 'bubble',
      // 'contamination': 'contamination',
      // 'delamination': 'delamination',
      // 'wrinkle': 'wrinkle',
      // 'hole': 'hole',
      // 'scratch': 'scratch',
      // 'stain': 'other',
      // Chinese mappings based on the data
      'A-空氣陷入': 'bubble',
      'B-下流膠': 'deformation',
      'C-膠渣': 'contamination',
      'D-滾輪白點': 'spots',
      'E-烘箱氣泡': 'bubble',
      'F-PET不良': 'surface_defect',
      'G-油滴': 'oil',
      'H-毛屑': 'contamination',
      'I-色差': 'discoloration',
      'J-刮傷': 'scratch',
      'K-印痕': 'indent',
      'L-斑馬紋': 'wrinkle',
      'M-常規顆粒': 'contamination',
      'Uncertain': 'other',
    }
    
    // First try exact match
    if (typeMap[type]) {
      return typeMap[type]
    }
    
    // Then try lowercase match
    const lowerType = type.toLowerCase()
    if (typeMap[lowerType]) {
      return typeMap[lowerType]
    }
    
    // Finally try normalized match
    const normalizedType = lowerType.replace(/[^a-z\u4e00-\u9fff]/g, '_')
    return typeMap[normalizedType] || 'contamination' // Default to contamination for particle defects
  }
  
  private mapSeverity(severity: string | number): string {
    // Handle numeric severity levels (from the data: 等級 field)
    if (typeof severity === 'number') {
      if (severity <= 1) return 'LOW'
      if (severity <= 2) return 'MEDIUM'
      if (severity <= 3) return 'HIGH'
      return 'CRITICAL'
    }
    
    // Map different severity formats
    const severityMap: Record<string, string> = {
      'low': 'LOW',
      'medium': 'MEDIUM', 
      'high': 'HIGH',
      'critical': 'CRITICAL',
      '1': 'LOW',
      '2': 'MEDIUM',
      '3': 'HIGH',
      '4': 'CRITICAL'
    }
    
    return severityMap[severity.toString().toLowerCase()] || 'MEDIUM'
  }

  // private mapDefectAttributes(attribute: string): string {
  //   const attributeMap: Record<string, string> = {
  //     '組': 'Group',
  //     '判定回路': 'Circuit',
  //     '外接宽度': 'Width',
  //     '外接长度': 'Length',
  //   }

  //   return attributeMap[attribute.toString()] || 'Attribute'
  // }

  async getDefectData(id: string): Promise<DefectData> {
    const response = await fetch(`${this.baseUrl}/defects/data/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch defect: ${response.statusText}`)
    }
    return response.json()
  }

  async createDefectData(defects: Omit<DefectData, 'id' | 'created_at' | 'updated_at'>[]): Promise<DefectData[]> {
    const response = await fetch(`${this.baseUrl}/defects/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defects)
    })
    if (!response.ok) {
      throw new Error(`Failed to create defects: ${response.statusText}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  }

  async updateDefectData(id: string, updates: Partial<DefectData>): Promise<DefectData> {
    const response = await fetch(`${this.baseUrl}/defects/data/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) {
      throw new Error(`Failed to update defect: ${response.statusText}`)
    }
    return response.json()
  }

  async deleteDefectData(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/defects/data/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`Failed to delete defect: ${response.statusText}`)
    }
  }

  // File Upload
  async uploadDefectData(batchId: string, file: File): Promise<DefectData[]> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('batchId', batchId)

    const response = await fetch(`${this.baseUrl}/defects/upload`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      throw new Error(`Failed to upload defects: ${response.statusText}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  }

  // Statistics and Analysis
  async getBatchStatistics(batchId: string): Promise<DefectStatistics> {
    const response = await fetch(`${this.baseUrl}/defects/batches/${batchId}/statistics`)
    if (!response.ok) {
      throw new Error(`Failed to get statistics: ${response.statusText}`)
    }
    return response.json()
  }

  async analyzeBatch(batchId: string): Promise<DefectAnalysisResult> {
    const response = await fetch(`${this.baseUrl}/defects/batches/${batchId}/analyze`, {
      method: 'POST'
    })
    return response.json()
  }

  async findDefectClusters(batchId: string, options?: {
    min_cluster_size?: number
    max_distance?: number
  }): Promise<DefectCluster[]> {
    const queryParams = options ? '?' + new URLSearchParams(
      Object.entries(options).map(([k, v]) => [k, v.toString()])
    ).toString() : ''
    
    const response = await fetch(`${this.baseUrl}/defects/batches/${batchId}/clusters${queryParams}`)
    return response.json()
  }

  // Visualization helpers
  async getVisualizationData(batchId: string, settings?: DefectVisualizationSettings): Promise<{
    defects: DefectData[]
    bounds: { min_x: number; max_x: number; min_y: number; max_y: number }
    statistics: DefectStatistics
  }> {
    const response = await fetch(`${this.baseUrl}/defects/batches/${batchId}/visualization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings || {})
    })
    return response.json()
  }

  // Export functions
  async exportBatchData(batchId: string, format: 'csv' | 'json' | 'excel'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/defects/batches/${batchId}/export?format=${format}`)
    return response.blob()
  }

  async exportStatistics(batchId: string, format: 'pdf' | 'csv'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/defects/batches/${batchId}/statistics/export?format=${format}`)
    return response.blob()
  }
}

// Utility functions for defect analysis
export const defectUtils = {
  calculateDefectDensity: (defects: DefectData[], area: number): number => {
    return defects.length / area
  },

  groupDefectsByType: (defects: DefectData[]): Record<DefectType, DefectData[]> => {
    return defects.reduce((acc, defect) => {
      if (!acc[defect.defect_type]) {
        acc[defect.defect_type] = []
      }
      acc[defect.defect_type].push(defect)
      return acc
    }, {} as Record<DefectType, DefectData[]>)
  },

  filterDefectsByConfidence: (defects: DefectData[], minConfidence: number): DefectData[] => {
    return defects.filter(defect => defect.confidence >= minConfidence)
  },

  calculateAverageConfidence: (defects: DefectData[]): number => {
    if (defects.length === 0) return 0
    return defects.reduce((sum, defect) => sum + defect.confidence, 0) / defects.length
  },

  getSeverityScore: (severity: DefectSeverity): number => {
    const scores = {
      [DefectSeverity.LOW]: 1,
      [DefectSeverity.MEDIUM]: 2,
      [DefectSeverity.HIGH]: 3,
      [DefectSeverity.CRITICAL]: 4
    }
    return scores[severity]
  },

  calculateQualityScore: (defects: DefectData[]): number => {
    if (defects.length === 0) return 100
    
    const totalSeverity = defects.reduce((sum, defect) => 
      sum + defectUtils.getSeverityScore(defect.severity), 0
    )
    const maxPossibleSeverity = defects.length * 4 // Critical = 4
    
    return Math.max(0, 100 - (totalSeverity / maxPossibleSeverity) * 100)
  }
}

// Create singleton instance
export const defectAPI = new DefectAPI()