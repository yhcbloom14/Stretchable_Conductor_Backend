#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script applies Supabase migrations and seeds the database with sample data
 * for testing the defect detection module.
 * 
 * Usage: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

async function runMigrations() {
  console.log('🚀 Starting database setup...\n')
  
  try {
    // Read and execute migration files
    const migrationsDir = path.join(__dirname, '../supabase/migrations')
    const migrationFiles = fs.readdirSync(migrationsDir).sort()
    
    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`📝 Applying migration: ${file}`)
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
        
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
        
        if (error) {
          console.warn(`⚠️  Migration ${file} may have already been applied: ${error.message}`)
        } else {
          console.log(`✅ Successfully applied: ${file}`)
        }
      }
    }
    
    console.log('\n🎯 Migrations completed!')
    
  } catch (error) {
    console.error('❌ Error applying migrations:', error.message)
    throw error
  }
}

async function seedSampleData() {
  console.log('\n🌱 Seeding sample data...\n')
  
  try {
    // Create a sample organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({ 
        id: 'org-sample',
        name: 'Sample Research Lab',
        domain: 'sample-lab.edu'
      })
      .select()
      .single()
    
    if (orgError && !orgError.message.includes('duplicate key')) {
      throw orgError
    }
    console.log('✅ Created sample organization')
    
    // Create a sample user
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        id: 'user-sample',
        email: 'researcher@sample-lab.edu',
        name: 'Dr. Sample Researcher',
        organization_id: 'org-sample',
        role: 'ADMIN'
      })
      .select()
      .single()
    
    if (userError && !userError.message.includes('duplicate key')) {
      throw userError
    }
    console.log('✅ Created sample user')
    

    

    
    // Create sample defect batches
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
        organization_id: 'org-sample'
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
        organization_id: 'org-sample'
      }
    ]
    
    for (const batch of sampleDefectBatches) {
      const { error } = await supabase
        .from('defect_batches')
        .upsert(batch)
      
      if (error && !error.message.includes('duplicate key')) {
        throw error
      }
    }
    console.log('✅ Created sample defect batches')
    
    // Create sample defect data
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
        organization_id: 'org-sample'
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
        organization_id: 'org-sample'
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
        organization_id: 'org-sample'
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
        organization_id: 'org-sample'
      }
    ]
    
    for (const defect of sampleDefects) {
      const { error } = await supabase
        .from('defect_data')
        .upsert(defect)
      
      if (error && !error.message.includes('duplicate key')) {
        throw error
      }
    }
    console.log('✅ Created sample defect data')
    
    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📊 Sample data summary:')
    console.log('   • 1 organization (Sample Research Lab)')
    console.log('   • 1 user (Dr. Sample Researcher)')
    console.log('   • 2 defect batches')
    console.log('   • 4 defect data points')
    console.log('\n🔗 You can now test the application with real data!')
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message)
    throw error
  }
}

async function main() {
  try {
    await runMigrations()
    await seedSampleData()
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}