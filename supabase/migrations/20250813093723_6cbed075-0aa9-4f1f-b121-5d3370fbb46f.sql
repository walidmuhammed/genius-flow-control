-- Fix RLS policies to allow service role and authenticated users to read client pricing
-- First, ensure service role can read all pricing tables
CREATE POLICY IF NOT EXISTS "service_role_read_client_defaults" 
ON pricing_client_defaults FOR SELECT 
TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "service_role_read_client_package_extras" 
ON pricing_client_package_extras FOR SELECT 
TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "service_role_read_client_zone_rules" 
ON pricing_client_zone_rules FOR SELECT 
TO service_role USING (true);

-- Allow authenticated users to read their own client pricing
CREATE POLICY IF NOT EXISTS "authenticated_read_own_client_defaults" 
ON pricing_client_defaults FOR SELECT 
TO authenticated USING (client_id = auth.uid());

CREATE POLICY IF NOT EXISTS "authenticated_read_own_client_package_extras" 
ON pricing_client_package_extras FOR SELECT 
TO authenticated USING (client_id = auth.uid());

CREATE POLICY IF NOT EXISTS "authenticated_read_own_client_zone_rules" 
ON pricing_client_zone_rules FOR SELECT 
TO authenticated USING (client_id = auth.uid());