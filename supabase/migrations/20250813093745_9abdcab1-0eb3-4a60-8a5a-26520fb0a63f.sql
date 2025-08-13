-- Fix RLS policies to allow service role and authenticated users to read client pricing
-- First, ensure service role can read all pricing tables
DROP POLICY IF EXISTS "service_role_read_client_defaults" ON pricing_client_defaults;
DROP POLICY IF EXISTS "service_role_read_client_package_extras" ON pricing_client_package_extras;
DROP POLICY IF EXISTS "service_role_read_client_zone_rules" ON pricing_client_zone_rules;
DROP POLICY IF EXISTS "authenticated_read_own_client_defaults" ON pricing_client_defaults;
DROP POLICY IF EXISTS "authenticated_read_own_client_package_extras" ON pricing_client_package_extras;
DROP POLICY IF EXISTS "authenticated_read_own_client_zone_rules" ON pricing_client_zone_rules;

-- Create service role policies
CREATE POLICY "service_role_read_client_defaults" 
ON pricing_client_defaults FOR SELECT 
TO service_role USING (true);

CREATE POLICY "service_role_read_client_package_extras" 
ON pricing_client_package_extras FOR SELECT 
TO service_role USING (true);

CREATE POLICY "service_role_read_client_zone_rules" 
ON pricing_client_zone_rules FOR SELECT 
TO service_role USING (true);

-- Create authenticated user policies
CREATE POLICY "authenticated_read_own_client_defaults" 
ON pricing_client_defaults FOR SELECT 
TO authenticated USING (client_id = auth.uid());

CREATE POLICY "authenticated_read_own_client_package_extras" 
ON pricing_client_package_extras FOR SELECT 
TO authenticated USING (client_id = auth.uid());

CREATE POLICY "authenticated_read_own_client_zone_rules" 
ON pricing_client_zone_rules FOR SELECT 
TO authenticated USING (client_id = auth.uid());