import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { DefectData } from '@/lib/types/Defect'

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

    const body = await request.json()
    
    // Handle both single and bulk creation
    const defectsData = Array.isArray(body) ? body : [body]
    
    // Add organization_id to each defect
    const defectsWithOrg = defectsData.map(defect => ({
      ...defect,
      organization_id: profile.organization_id
    }))

    const { data, error } = await supabase
      .from('defect_data')
      .insert(defectsWithOrg)
      .select()

    if (error) {
      console.error('Error creating defect data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return single object if single defect was created, array otherwise
    return NextResponse.json(Array.isArray(body) ? data : data?.[0])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}