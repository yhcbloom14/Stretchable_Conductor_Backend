import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { DefectType, DefectSeverity } from '@/lib/types/Defect'

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

    const { data: defects, error } = await supabase
      .from('defect_data')
      .select('defect_type, severity, confidence')
      .eq('batch_id', id)

    if (error) {
      console.error('Error fetching defect statistics:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const defectData = defects || []
    
    // Calculate statistics
    const totalDefects = defectData.length
    const highSeverityDefects = defectData.filter(d => 
      d.severity === DefectSeverity.HIGH || d.severity === DefectSeverity.CRITICAL
    ).length

    const averageConfidence = defectData.length > 0 
      ? defectData.reduce((sum, d) => sum + d.confidence, 0) / defectData.length 
      : 0

    // Group by defect type
    const defectTypeDistribution = defectData.reduce((acc, defect) => {
      acc[defect.defect_type] = (acc[defect.defect_type] || 0) + 1
      return acc
    }, {} as Record<DefectType, number>)

    // Group by severity
    const severityDistribution = defectData.reduce((acc, defect) => {
      acc[defect.severity] = (acc[defect.severity] || 0) + 1
      return acc
    }, {} as Record<DefectSeverity, number>)

    return NextResponse.json({
      totalDefects,
      highSeverityDefects,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      defectTypeDistribution,
      severityDistribution
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}