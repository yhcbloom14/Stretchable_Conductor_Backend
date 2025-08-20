-- Defect Detection Module Tables Migration
-- This migration creates tables for the defect detection module

-- Create enum types for defect module
CREATE TYPE "DefectType" AS ENUM (
  'SURFACE_CRACK',
  'BUBBLE',
  'CONTAMINATION', 
  'DISCOLORATION',
  'DEFORMATION',
  'HOLE',
  'SCRATCH',
  'TEAR',
  'WRINKLE',
  'INCLUSION',
  'MISSING_MATERIAL',
  'EDGE_DEFECT',
  'OTHER'
);

CREATE TYPE "DefectSeverity" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- Create defect_batches table
CREATE TABLE "defect_batches" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "batch_name" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "batch_number" TEXT NOT NULL,
  "scan_date" TIMESTAMPTZ NOT NULL,
  "image_url" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "defect_count" INTEGER DEFAULT 0,
  "quality_score" DECIMAL DEFAULT 0,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create defect_data table
CREATE TABLE "defect_data" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "coord_x" DECIMAL NOT NULL,
  "coord_y" DECIMAL NOT NULL,
  "defect_type" "DefectType" NOT NULL,
  "confidence" DECIMAL NOT NULL,
  "severity" "DefectSeverity" NOT NULL,
  "label" TEXT,
  "properties" JSONB,
  "batch_id" TEXT NOT NULL REFERENCES "defect_batches"("id") ON DELETE CASCADE,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX "defect_batches_organization_id_idx" ON "defect_batches"("organization_id");
CREATE INDEX "defect_batches_user_id_idx" ON "defect_batches"("user_id");
CREATE INDEX "defect_batches_scan_date_idx" ON "defect_batches"("scan_date");
CREATE INDEX "defect_batches_product_name_idx" ON "defect_batches"("product_name");
CREATE INDEX "defect_batches_batch_number_idx" ON "defect_batches"("batch_number");

CREATE INDEX "defect_data_batch_id_idx" ON "defect_data"("batch_id");
CREATE INDEX "defect_data_organization_id_idx" ON "defect_data"("organization_id");
CREATE INDEX "defect_data_defect_type_idx" ON "defect_data"("defect_type");
CREATE INDEX "defect_data_severity_idx" ON "defect_data"("severity");
CREATE INDEX "defect_data_confidence_idx" ON "defect_data"("confidence");

-- Create triggers for updated_at columns
CREATE TRIGGER update_defect_batches_updated_at BEFORE UPDATE ON "defect_batches"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_defect_data_updated_at BEFORE UPDATE ON "defect_data"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update defect count and quality score
CREATE OR REPLACE FUNCTION update_batch_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update defect count and recalculate quality score
  UPDATE "defect_batches" 
  SET 
    "defect_count" = (
      SELECT COUNT(*) 
      FROM "defect_data" 
      WHERE "batch_id" = COALESCE(NEW.batch_id, OLD.batch_id)
    ),
    "quality_score" = (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 100.0
          ELSE GREATEST(0, 100.0 - (
            COUNT(*) * 5 + 
            SUM(CASE 
              WHEN severity = 'CRITICAL' THEN 25
              WHEN severity = 'HIGH' THEN 15  
              WHEN severity = 'MEDIUM' THEN 8
              WHEN severity = 'LOW' THEN 3
              ELSE 0
            END)
          ))
        END
      FROM "defect_data" 
      WHERE "batch_id" = COALESCE(NEW.batch_id, OLD.batch_id)
    )
  WHERE "id" = COALESCE(NEW.batch_id, OLD.batch_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers to automatically update batch statistics
CREATE TRIGGER update_batch_stats_on_insert AFTER INSERT ON "defect_data"
  FOR EACH ROW EXECUTE FUNCTION update_batch_statistics();

CREATE TRIGGER update_batch_stats_on_update AFTER UPDATE ON "defect_data"  
  FOR EACH ROW EXECUTE FUNCTION update_batch_statistics();

CREATE TRIGGER update_batch_stats_on_delete AFTER DELETE ON "defect_data"
  FOR EACH ROW EXECUTE FUNCTION update_batch_statistics();

-- Insert some sample defect batches for testing
INSERT INTO "defect_batches" (
  "batch_name", 
  "product_name", 
  "batch_number", 
  "scan_date", 
  "organization_id", 
  "user_id",
  "metadata"
) VALUES
  (
    'Sample Batch 1', 
    'Nanocomposite Sheet A', 
    'NCB-001', 
    NOW() - INTERVAL '7 days',
    (SELECT id FROM organizations LIMIT 1),
    (SELECT id FROM users LIMIT 1), 
    '{"temperature": 25, "humidity": 45, "operator": "test_user"}'
  ),
  (
    'Sample Batch 2', 
    'Nanocomposite Sheet B', 
    'NCB-002', 
    NOW() - INTERVAL '3 days',
    (SELECT id FROM organizations LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    '{"temperature": 23, "humidity": 50, "operator": "test_user"}'
  )
ON CONFLICT DO NOTHING;

-- Insert some sample defect data for testing
INSERT INTO "defect_data" (
  "coord_x", 
  "coord_y", 
  "defect_type", 
  "confidence", 
  "severity", 
  "batch_id", 
  "organization_id",
  "label"
) VALUES
  (
    125.5, 
    78.2, 
    'SURFACE_CRACK', 
    0.95, 
    'HIGH',
    (SELECT id FROM defect_batches WHERE batch_number = 'NCB-001' LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    'Crack detected in upper region'
  ),
  (
    200.1, 
    150.7, 
    'BUBBLE', 
    0.88, 
    'MEDIUM',
    (SELECT id FROM defect_batches WHERE batch_number = 'NCB-001' LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    'Air bubble formation'
  ),
  (
    75.0, 
    95.3, 
    'CONTAMINATION', 
    0.92, 
    'LOW',
    (SELECT id FROM defect_batches WHERE batch_number = 'NCB-002' LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    'Foreign particle detected'
  )
ON CONFLICT DO NOTHING;