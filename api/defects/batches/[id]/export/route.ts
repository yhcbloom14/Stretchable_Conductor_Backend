import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'

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

    const format = request.nextUrl.searchParams.get('format') || 'csv'

    // Fetch batch and defects
    const { data: batch, error: batchError } = await supabase
      .from('defect_batches')
      .select('*')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const { data: defects, error: defectsError } = await supabase
      .from('defect_data')
      .select('*')
      .eq('batch_id', id)

    if (defectsError) {
      return NextResponse.json({ error: defectsError.message }, { status: 500 })
    }

    const defectData = defects || []

    switch (format) {
      case 'csv': {
        // Convert to CSV manually
        const headers = ['id', 'coord_x', 'coord_y', 'defect_type', 'severity', 'confidence', 'label', 'created_at']
        const csvRows = [headers.join(',')]
        
        for (const defect of defectData) {
          const row = headers.map(header => {
            const value = defect[header as keyof typeof defect]
            // Escape commas and quotes in string values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value ?? ''
          })
          csvRows.push(row.join(','))
        }
        
        const csv = csvRows.join('\n')
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${batch.batch_name}-defects.csv"`
          }
        })
      }
      
      case 'json': {
        const exportData = {
          batch,
          defects: defectData
        }
        
        return new NextResponse(JSON.stringify(exportData, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${batch.batch_name}-defects.json"`
          }
        })
      }
      
      case 'excel': {
        // For Excel export, we would typically use a library like exceljs
        // For now, return CSV with Excel mime type
        const headers = ['id', 'coord_x', 'coord_y', 'defect_type', 'severity', 'confidence', 'label', 'created_at']
        const csvRows = [headers.join(',')]
        
        for (const defect of defectData) {
          const row = headers.map(header => {
            const value = defect[header as keyof typeof defect]
            // Escape commas and quotes in string values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value ?? ''
          })
          csvRows.push(row.join(','))
        }
        
        const csv = csvRows.join('\n')
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'application/vnd.ms-excel',
            'Content-Disposition': `attachment; filename="${batch.batch_name}-defects.xls"`
          }
        })
      }
      
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}