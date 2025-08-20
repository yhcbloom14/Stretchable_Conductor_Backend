#!/usr/bin/env node

/**
 * Seed Sample Data Script
 * 
 * This script adds sample data to the existing Supabase database
 * for testing the defect detection module.
 * 
 * Usage: node scripts/seed-data.js
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedSampleData() {
  console.log('🌱 Seeding sample data...\n')
  
  try {
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('📋 Checking existing tables...')
      // Fallback - try to create data directly
    }
    
    // Create a sample organization (check existing first)
    console.log('👤 Creating sample organization...')
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', 'Sample Research Lab')
      .single()
    
    let orgId = 'org-sample'
    if (!existingOrg) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ 
          id: orgId,
          name: 'Sample Research Lab'
        })
        .select()
        .single()
      
      if (orgError) {
        console.log('Organization may already exist:', orgError.message)
      } else {
        console.log('✅ Created sample organization')
      }
    } else {
      orgId = existingOrg.id
      console.log('✅ Using existing organization')
    }
    
    // Create a sample user
    console.log('👤 Creating sample user...')
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'researcher@sample-lab.edu')
      .single()
    
    let userId = 'user-sample'
    if (!existingUser) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'researcher@sample-lab.edu',
          name: 'Dr. Sample Researcher',
          organization_id: orgId,
          role: 'ADMIN'
        })
        .select()
        .single()
      
      if (userError) {
        console.log('User may already exist:', userError.message)
      } else {
        console.log('✅ Created sample user')
      }
    } else {
      userId = existingUser.id
      console.log('✅ Using existing user')
    }
    

    

    
    // Create sample defect batches
    console.log('📦 Creating sample defect batches...')
    const sampleDefectBatches = [
      {
        id: 'batch-1',
        batch_name: 'Production Batch A-2024-001',
        product_name: 'Bio-composite Sheet',
        batch_number: 'A001',
        scan_date: new Date('2024-01-15').toISOString(),
        metadata: {
          'production_line': 'Line 1',
          'operator': 'John Smith',
          'material_lot': 'LOT-2024-A'
        },
        defect_count: 8,
        quality_score: 87.5,
        organization_id: orgId
      },
      {
        id: 'batch-2',
        batch_name: 'Production Batch B-2024-002',
        product_name: 'Reinforced Panel',
        batch_number: 'B002',
        scan_date: new Date('2024-01-20').toISOString(),
        metadata: {
          'production_line': 'Line 2',
          'operator': 'Sarah Jones',
          'material_lot': 'LOT-2024-B'
        },
        defect_count: 3,
        quality_score: 94.2,
        organization_id: orgId
      }
    ]
    
    for (const batch of sampleDefectBatches) {
      const { error } = await supabase
        .from('defect_batches')
        .upsert(batch, { onConflict: 'id' })
      
      if (error) {
        console.log(`Batch ${batch.id} error:`, error.message)
      }
    }
    console.log('✅ Created sample defect batches')
    
    // Create sample defect data
    console.log('🔍 Creating sample defect data...')
    const sampleDefects = [
      // Batch 1 defects
      {
        id: 'defect-1',
        batch_id: 'batch-1',
        coord_x: 150.5,
        coord_y: 200.3,
        defect_type: 'SURFACE_CRACK',
        confidence: 0.89,
        severity: 'MEDIUM',
        label: 'Surface crack detected in upper region',
        organization_id: orgId
      },
      {
        id: 'defect-2',
        batch_id: 'batch-1', 
        coord_x: 320.1,
        coord_y: 150.8,
        defect_type: 'BUBBLE',
        confidence: 0.92,
        severity: 'LOW',
        label: 'Small air bubble',
        organization_id: orgId
      },
      {
        id: 'defect-3',
        batch_id: 'batch-1',
        coord_x: 280.4,
        coord_y: 380.2,
        defect_type: 'CONTAMINATION',
        confidence: 0.76,
        severity: 'HIGH',
        label: 'Foreign material contamination',
        organization_id: orgId
      },
      // Batch 2 defects  
      {
        id: 'defect-4',
        batch_id: 'batch-2',
        coord_x: 420.3,
        coord_y: 120.5,
        defect_type: 'SCRATCH',
        confidence: 0.85,
        severity: 'LOW',
        label: 'Minor surface scratch',
        organization_id: orgId
      }
    ]
    
    for (const defect of sampleDefects) {
      const { error } = await supabase
        .from('defect_data')
        .upsert(defect, { onConflict: 'id' })
      
      if (error) {
        console.log(`Defect ${defect.id} error:`, error.message)
      }
    }
    console.log('✅ Created sample defect data')
    
    console.log('\n🎉 Sample data seeding completed!')
    console.log('\n📊 Sample data summary:')
    console.log('   • 1 organization (Sample Research Lab)')
    console.log('   • 1 user (Dr. Sample Researcher)')
    console.log('   • 2 defect batches')
    console.log('   • 4 defect data points')
    console.log('\n🔗 You can now test the application with real data!')
    console.log('\n💡 Note: If tables don\'t exist, you may need to apply migrations first.')
    console.log('   Check the Supabase dashboard and run the SQL migrations manually.')
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message)
    console.log('\n💡 This might be because the database tables haven\'t been created yet.')
    console.log('   Please apply the migrations in supabase/migrations/ manually via the Supabase dashboard.')
    throw error
  }
}

async function main() {
  try {
    await seedSampleData()
  } catch (error) {
    console.error('\n❌ Data seeding failed:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}