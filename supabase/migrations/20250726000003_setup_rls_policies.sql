-- Row Level Security (RLS) Policies Migration
-- This migration sets up comprehensive RLS policies for multi-tenant organization isolation

-- Enable RLS on all tables
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "papers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "samples" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "extractions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "defect_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "defect_data" ENABLE ROW LEVEL SECURITY;

-- Create helper function to get current user's organization
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM users 
    WHERE id = user_id AND organization_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
-- Users can only see their own organization
CREATE POLICY "Users can view own organization" ON "organizations"
  FOR SELECT USING (
    id = get_user_organization_id(auth.uid()::text)
  );

CREATE POLICY "Admins can update own organization" ON "organizations"
  FOR UPDATE USING (
    id = get_user_organization_id(auth.uid()::text) AND
    (SELECT role FROM users WHERE id = auth.uid()::text) = 'ADMIN'
  );

-- Users policies
-- Users can view users in their organization
CREATE POLICY "Users can view org members" ON "users"
  FOR SELECT USING (
    organization_id = get_user_organization_id(auth.uid()::text) OR
    id = auth.uid()::text
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON "users"
  FOR UPDATE USING (id = auth.uid()::text);

-- Admins can manage users in their organization
CREATE POLICY "Admins can manage org users" ON "users"
  FOR ALL USING (
    organization_id = get_user_organization_id(auth.uid()::text) AND
    (SELECT role FROM users WHERE id = auth.uid()::text) = 'ADMIN'
  );





-- Properties policies (global read access, admin write)
-- All authenticated users can view properties
CREATE POLICY "Authenticated users can view properties" ON "properties"
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage properties
CREATE POLICY "Admins can manage properties" ON "properties"
  FOR ALL USING (
    (SELECT role FROM users WHERE id = auth.uid()::text) = 'ADMIN'
  );



-- Defect Batches policies
-- Users can view defect batches in their organization
CREATE POLICY "Users can view org defect batches" ON "defect_batches"
  FOR SELECT USING (
    organization_id = get_user_organization_id(auth.uid()::text)
  );

-- Users can create defect batches in their organization
CREATE POLICY "Users can create defect batches" ON "defect_batches"
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id(auth.uid()::text) AND
    user_id = auth.uid()::text
  );

-- Users can update their own batches or admins can update any in org
CREATE POLICY "Users can update own defect batches" ON "defect_batches"
  FOR UPDATE USING (
    organization_id = get_user_organization_id(auth.uid()::text) AND
    (user_id = auth.uid()::text OR 
     (SELECT role FROM users WHERE id = auth.uid()::text) = 'ADMIN')
  );

-- Users can delete their own batches or admins can delete any in org
CREATE POLICY "Users can delete own defect batches" ON "defect_batches"
  FOR DELETE USING (
    organization_id = get_user_organization_id(auth.uid()::text) AND
    (user_id = auth.uid()::text OR 
     (SELECT role FROM users WHERE id = auth.uid()::text) = 'ADMIN')
  );

-- Defect Data policies
-- Users can view defect data in their organization
CREATE POLICY "Users can view org defect data" ON "defect_data"
  FOR SELECT USING (
    organization_id = get_user_organization_id(auth.uid()::text)
  );

-- Users can create defect data in their organization
CREATE POLICY "Users can create defect data" ON "defect_data"
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id(auth.uid()::text)
  );

-- Users can update defect data in their organization
CREATE POLICY "Users can update org defect data" ON "defect_data"
  FOR UPDATE USING (
    organization_id = get_user_organization_id(auth.uid()::text)
  );

-- Users can delete defect data in their organization  
CREATE POLICY "Users can delete org defect data" ON "defect_data"
  FOR DELETE USING (
    organization_id = get_user_organization_id(auth.uid()::text)
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;