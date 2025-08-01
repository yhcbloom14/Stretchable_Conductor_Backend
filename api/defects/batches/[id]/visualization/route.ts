import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { DefectVisualizationSettings } from '@/lib/types/Defect'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings: DefectVisualizationSettings = await request.json()

    // Fetch defects for the batch
    const { data: defects, error } = await supabase
      .from('defect_data')
      .select('*')
      .eq('batch_id', id)

    if (error) {
      console.error('Error fetching defects for visualization:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const defectData = defects || []
    
    // Calculate bounds
    const bounds = defectData.length > 0 ? {
      min_x: Math.min(...defectData.map(d => d.coord_x)),
      max_x: Math.max(...defectData.map(d => d.coord_x)),
      min_y: Math.min(...defectData.map(d => d.coord_y)),
      max_y: Math.max(...defectData.map(d => d.coord_y))
    } : {
      min_x: 0,
      max_x: 100,
      min_y: 0,
      max_y: 100
    }

    // Get statistics
    const { data: statisticsResp } = await fetch(`${request.nextUrl.origin}/api/defects/batches/${id}/statistics`).then(r => r.json())

    return NextResponse.json({
      defects: defectData,
      bounds,
      statistics: statisticsResp || {
        totalDefects: defectData.length,
        highSeverityDefects: 0,
        averageConfidence: 0,
        defectTypeDistribution: {},
        severityDistribution: {}
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}