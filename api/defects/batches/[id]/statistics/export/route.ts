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

    // Get batch info
    const { data: batch, error: batchError } = await supabase
      .from('defect_batches')
      .select('*')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Get statistics
    const statsResponse = await fetch(`${request.nextUrl.origin}/api/defects/batches/${id}/statistics`)
    const statistics = await statsResponse.json()

    switch (format) {
      case 'csv': {
        // Create CSV content
        const csvRows = [
          'Batch Statistics Report',
          '',
          `Batch Name,${batch.batch_name}`,
          `Product Name,${batch.product_name}`,
          `Batch Number,${batch.batch_number}`,
          `Scan Date,${batch.scan_date}`,
          `Quality Score,${batch.quality_score}`,
          '',
          'Summary Statistics',
          `Total Defects,${statistics.totalDefects}`,
          `High Severity Defects,${statistics.highSeverityDefects}`,
          `Average Confidence,${statistics.averageConfidence}`,
          '',
          'Defect Type Distribution',
          'Type,Count'
        ]
        
        Object.entries(statistics.defectTypeDistribution).forEach(([type, count]) => {
          csvRows.push(`${type},${count}`)
        })
        
        csvRows.push('')
        csvRows.push('Severity Distribution')
        csvRows.push('Severity,Count')
        
        Object.entries(statistics.severityDistribution).forEach(([severity, count]) => {
          csvRows.push(`${severity},${count}`)
        })
        
        const csv = csvRows.join('\n')
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${batch.batch_name}-statistics.csv"`
          }
        })
      }
      
      case 'pdf': {
        // For PDF export, we would typically use a library like puppeteer or jsPDF
        // For now, return a simple text representation
        const report = `
DEFECT BATCH STATISTICS REPORT
==============================

Batch Information:
- Batch Name: ${batch.batch_name}
- Product Name: ${batch.product_name}
- Batch Number: ${batch.batch_number}
- Scan Date: ${new Date(batch.scan_date).toLocaleDateString()}
- Quality Score: ${batch.quality_score}%

Summary Statistics:
- Total Defects: ${statistics.totalDefects}
- High Severity Defects: ${statistics.highSeverityDefects}
- Average Confidence: ${statistics.averageConfidence}

Defect Type Distribution:
${Object.entries(statistics.defectTypeDistribution)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

Severity Distribution:
${Object.entries(statistics.severityDistribution)
  .map(([severity, count]) => `- ${severity}: ${count}`)
  .join('\n')}

Generated on: ${new Date().toLocaleString()}
        `.trim()
        
        return new NextResponse(report, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${batch.batch_name}-statistics.txt"`
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