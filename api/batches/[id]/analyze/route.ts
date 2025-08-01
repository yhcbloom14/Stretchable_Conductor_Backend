import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { DefectAnalysisResult, DefectCluster } from '@/lib/types/Defect'

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

    // Fetch defects for analysis
    const { data: defects, error } = await supabase
      .from('defect_data')
      .select('*')
      .eq('batch_id', id)

    if (error) {
      console.error('Error fetching defects for analysis:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Perform analysis (simplified version - in production, this would be more complex)
    const analysis: DefectAnalysisResult = {
      batch_id: id,
      analyzed_at: new Date(),
      total_defects: defects?.length || 0,
      risk_score: calculateRiskScore(defects || []),
      recommendations: generateRecommendations(defects || []),
      patterns: detectPatterns(defects || []),
      metadata: {
        analysis_version: '1.0',
        confidence_threshold: 0.7
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateRiskScore(defects: any[]): number {
  if (defects.length === 0) return 0
  
  // Simple risk calculation based on severity and count
  const severityWeights = {
    'LOW': 1,
    'MEDIUM': 2,
    'HIGH': 3,
    'CRITICAL': 4
  }
  
  const totalScore = defects.reduce((sum, defect) => {
    return sum + (severityWeights[defect.severity as keyof typeof severityWeights] || 1)
  }, 0)
  
  // Normalize to 0-100 scale
  return Math.min(100, (totalScore / defects.length) * 25)
}

function generateRecommendations(defects: any[]): string[] {
  const recommendations: string[] = []
  
  // Count defects by type
  const typeCount = defects.reduce((acc, defect) => {
    acc[defect.defect_type] = (acc[defect.defect_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Generate recommendations based on defect patterns
  Object.entries(typeCount).forEach(([type, count]) => {
    if (count > 10) {
      recommendations.push(`High occurrence of ${type} defects (${count} found). Consider reviewing production parameters.`)
    }
  })
  
  // Check for critical defects
  const criticalCount = defects.filter(d => d.severity === 'CRITICAL').length
  if (criticalCount > 0) {
    recommendations.push(`${criticalCount} critical defects detected. Immediate action recommended.`)
  }
  
  return recommendations
}

function detectPatterns(defects: any[]): Array<{ type: string; description: string; confidence: number }> {
  const patterns: Array<{ type: string; description: string; confidence: number }> = []
  
  // Simple spatial clustering detection
  if (defects.length > 5) {
    // Check for clustering in coordinates
    const xCoords = defects.map(d => d.coord_x)
    const yCoords = defects.map(d => d.coord_y)
    
    const xVariance = calculateVariance(xCoords)
    const yVariance = calculateVariance(yCoords)
    
    if (xVariance < 100 || yVariance < 100) {
      patterns.push({
        type: 'spatial_clustering',
        description: 'Defects appear to be clustered in specific regions',
        confidence: 0.8
      })
    }
  }
  
  // Detect type dominance
  const typeCount = defects.reduce((acc, defect) => {
    acc[defect.defect_type] = (acc[defect.defect_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const dominantType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]
  if (dominantType && dominantType[1] > defects.length * 0.5) {
    patterns.push({
      type: 'type_dominance',
      description: `${dominantType[0]} defects represent more than 50% of all defects`,
      confidence: 0.9
    })
  }
  
  return patterns
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
  return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length
}