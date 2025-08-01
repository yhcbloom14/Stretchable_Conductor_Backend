import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { DefectCluster } from '@/lib/types/Defect'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const minClusterSize = parseInt(request.nextUrl.searchParams.get('min_cluster_size') || '5')
    const maxDistance = parseFloat(request.nextUrl.searchParams.get('max_distance') || '50')

    // Fetch defects for clustering
    const { data: defects, error } = await supabase
      .from('defect_data')
      .select('*')
      .eq('batch_id', id)

    if (error) {
      console.error('Error fetching defects for clustering:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const defectData = defects || []
    
    // Simple clustering algorithm (DBSCAN-like)
    const clusters: DefectCluster[] = []
    const visited = new Set<string>()
    
    for (const defect of defectData) {
      if (visited.has(defect.id)) continue
      
      // Find neighbors within maxDistance
      const neighbors = defectData.filter(d => {
        if (d.id === defect.id) return false
        const distance = Math.sqrt(
          Math.pow(d.coord_x - defect.coord_x, 2) + 
          Math.pow(d.coord_y - defect.coord_y, 2)
        )
        return distance <= maxDistance
      })
      
      if (neighbors.length >= minClusterSize - 1) {
        // Create a cluster
        const clusterDefects = [defect, ...neighbors]
        clusterDefects.forEach(d => visited.add(d.id))
        
        // Calculate cluster center
        const centerX = clusterDefects.reduce((sum, d) => sum + d.coord_x, 0) / clusterDefects.length
        const centerY = clusterDefects.reduce((sum, d) => sum + d.coord_y, 0) / clusterDefects.length
        
        // Calculate severity score
        const severityWeights = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 }
        const avgSeverity = clusterDefects.reduce((sum, d) => 
          sum + (severityWeights[d.severity as keyof typeof severityWeights] || 1), 0
        ) / clusterDefects.length
        
        clusters.push({
          id: `cluster_${clusters.length + 1}`,
          batch_id: id,
          center_x: centerX,
          center_y: centerY,
          defect_count: clusterDefects.length,
          defect_ids: clusterDefects.map(d => d.id),
          severity_score: avgSeverity,
          confidence: 0.8, // Simple confidence score
          metadata: {
            algorithm: 'simple_dbscan',
            parameters: { minClusterSize, maxDistance }
          }
        })
      }
    }

    return NextResponse.json(clusters)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}