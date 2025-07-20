
-- Fix RLS policies for pricing tables to allow authenticated users to read pricing data
-- while keeping write operations restricted to admins only

-- Update pricing_global table policy
DROP POLICY IF EXISTS "Only admins can manage global pricing" ON public.pricing_global;

-- Create separate policies for read and write operations
CREATE POLICY "Authenticated users can view global pricing"
ON public.pricing_global
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage global pricing"
ON public.pricing_global
FOR INSERT, UPDATE, DELETE
USING (is_admin())
WITH CHECK (is_admin());

-- Update pricing_client_overrides table policy
DROP POLICY IF EXISTS "Only admins can manage client pricing overrides" ON public.pricing_client_overrides;

CREATE POLICY "Authenticated users can view client pricing overrides"
ON public.pricing_client_overrides
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage client pricing overrides"
ON public.pricing_client_overrides
FOR INSERT, UPDATE, DELETE
USING (is_admin())
WITH CHECK (is_admin());

-- Update pricing_zone_rules table policy
DROP POLICY IF EXISTS "Only admins can manage zone pricing rules" ON public.pricing_zone_rules;

CREATE POLICY "Authenticated users can view zone pricing rules"
ON public.pricing_zone_rules
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage zone pricing rules"
ON public.pricing_zone_rules
FOR INSERT, UPDATE, DELETE
USING (is_admin())
WITH CHECK (is_admin());

-- Update pricing_package_types table policy
DROP POLICY IF EXISTS "Only admins can manage package type pricing" ON public.pricing_package_types;

CREATE POLICY "Authenticated users can view package type pricing"
ON public.pricing_package_types
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage package type pricing"
ON public.pricing_package_types
FOR INSERT, UPDATE, DELETE
USING (is_admin())
WITH CHECK (is_admin());
