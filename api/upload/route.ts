import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { DefectData, DefectType, DefectSeverity } from '@/lib/types/Defect'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const batchId = formData.get('batchId') as string

    if (!file || !batchId) {
      return NextResponse.json({ error: 'Missing file or batch ID' }, { status: 400 })
    }

    // Parse the CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Expected headers: coord_x, coord_y, defect_type, confidence, severity, label, ...
    const defects: Omit<DefectData, 'id' | 'created_at' | 'updated_at'>[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const defectRow: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index]
        
        // Parse numeric fields
        if (['coord_x', 'coord_y', 'confidence'].includes(header)) {
          defectRow[header] = parseFloat(value)
        }
        // Keep enums as strings
        else if (['defect_type', 'severity'].includes(header)) {
          defectRow[header] = value
        }
        // Parse JSON properties
        else if (header === 'properties' && value) {
          try {
            defectRow[header] = JSON.parse(value)
          } catch {
            defectRow[header] = {}
          }
        }
        // Other fields as strings
        else {
          defectRow[header] = value
        }
      })
      
      // Add required fields
      defectRow.batch_id = batchId
      defectRow.organization_id = profile.organization_id
      
      // Validate required fields
      if (defectRow.coord_x !== undefined && 
          defectRow.coord_y !== undefined && 
          defectRow.defect_type && 
          defectRow.confidence !== undefined &&
          defectRow.severity) {
        defects.push(defectRow as Omit<DefectData, 'id' | 'created_at' | 'updated_at'>)
      }
    }

    if (defects.length === 0) {
      return NextResponse.json({ error: 'No valid defects found in file' }, { status: 400 })
    }

    // Insert defects
    const { data, error } = await supabase
      .from('defect_data')
      .insert(defects)
      .select()

    if (error) {
      console.error('Error inserting defects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update batch defect count and quality score
    const qualityScore = calculateQualityScore(defects)
    
    await supabase
      .from('defect_batches')
      .update({ 
        defect_count: defects.length,
        quality_score: qualityScore 
      })
      .eq('id', batchId)

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateQualityScore(defects: any[]): number {
  if (defects.length === 0) return 100
  
  const severityWeights = {
    'LOW': 1,
    'MEDIUM': 2,
    'HIGH': 3,
    'CRITICAL': 4
  }
  
  const totalSeverity = defects.reduce((sum, defect) => 
    sum + (severityWeights[defect.severity as keyof typeof severityWeights] || 1), 0
  )
  
  const maxPossibleSeverity = defects.length * 4 // All critical
  
  return Math.max(0, 100 - (totalSeverity / maxPossibleSeverity) * 100)
}