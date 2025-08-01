-- Literature Module Tables Migration
-- This migration creates tables for the literature analysis module

-- Create enum types for literature module
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');
CREATE TYPE "PropertyCategory" AS ENUM (
  'MECHANICAL',
  'THERMAL', 
  'ELECTRICAL',
  'OPTICAL',
  'CHEMICAL',
  'PHYSICAL'
);

-- Create organizations table (if not exists)
CREATE TABLE IF NOT EXISTS "organizations" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "domain" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (if not exists) 
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" DEFAULT 'EDITOR',
  "last_sign_in_at" TIMESTAMPTZ,
  "organization_id" TEXT REFERENCES "organizations"("id"),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create papers table
CREATE TABLE "papers" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "authors" TEXT[] NOT NULL,
  "abstract" TEXT NOT NULL,
  "doi" TEXT,
  "journal" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "url" TEXT,
  "pdf_url" TEXT,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create samples table
CREATE TABLE "samples" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sample_name" TEXT NOT NULL,
  "composition" JSONB NOT NULL,
  "processing_conditions" JSONB NOT NULL,
  "properties" JSONB NOT NULL,
  "paper_id" TEXT NOT NULL REFERENCES "papers"("id") ON DELETE CASCADE,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create properties table
CREATE TABLE "properties" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "unit" TEXT NOT NULL,
  "category" "PropertyCategory" NOT NULL,
  "min_value" DECIMAL,
  "max_value" DECIMAL,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create extractions table
CREATE TABLE "extractions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "extracted_data" JSONB NOT NULL,
  "confidence_score" DECIMAL NOT NULL,
  "extraction_method" TEXT NOT NULL,
  "validated" BOOLEAN DEFAULT FALSE,
  "paper_id" TEXT NOT NULL REFERENCES "papers"("id") ON DELETE CASCADE,
  "sample_id" TEXT REFERENCES "samples"("id") ON DELETE CASCADE,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX "papers_organization_id_idx" ON "papers"("organization_id");
CREATE INDEX "papers_user_id_idx" ON "papers"("user_id");
CREATE INDEX "papers_year_idx" ON "papers"("year");
CREATE INDEX "papers_journal_idx" ON "papers"("journal");

CREATE INDEX "samples_paper_id_idx" ON "samples"("paper_id");
CREATE INDEX "samples_organization_id_idx" ON "samples"("organization_id");

CREATE INDEX "extractions_paper_id_idx" ON "extractions"("paper_id");
CREATE INDEX "extractions_sample_id_idx" ON "extractions"("sample_id");
CREATE INDEX "extractions_organization_id_idx" ON "extractions"("organization_id");
CREATE INDEX "extractions_user_id_idx" ON "extractions"("user_id");

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON "papers"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_samples_updated_at BEFORE UPDATE ON "samples"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON "properties"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extractions_updated_at BEFORE UPDATE ON "extractions"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default properties for common material properties
INSERT INTO "properties" ("name", "description", "unit", "category", "min_value", "max_value") VALUES
  ('Tensile Strength', 'Maximum stress that a material can withstand while being stretched', 'MPa', 'MECHANICAL', 0, 10000),
  ('Elastic Modulus', 'Measure of stiffness of a material', 'GPa', 'MECHANICAL', 0, 1000),
  ('Density', 'Mass per unit volume of a material', 'g/cm³', 'PHYSICAL', 0, 30),
  ('Glass Transition Temperature', 'Temperature at which polymer transitions from hard glassy state to soft rubbery state', '°C', 'THERMAL', -200, 500),
  ('Melting Point', 'Temperature at which material changes from solid to liquid', '°C', 'THERMAL', 0, 3000),
  ('Electrical Conductivity', 'Ability of material to conduct electric current', 'S/m', 'ELECTRICAL', 0, 100000000),
  ('Thermal Conductivity', 'Ability of material to conduct heat', 'W/m·K', 'THERMAL', 0, 500),
  ('Refractive Index', 'Measure of how much light bends when entering material', '', 'OPTICAL', 1, 4),
  ('Hardness', 'Resistance to deformation, indentation or scratching', 'HV', 'MECHANICAL', 0, 10000),
  ('Impact Strength', 'Ability to absorb energy during fracture', 'J/m', 'MECHANICAL', 0, 1000)
ON CONFLICT (name) DO NOTHING;