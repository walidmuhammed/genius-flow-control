-- Fix RLS policies by dropping and recreating them properly
DROP POLICY IF EXISTS service_read_cp_default ON client_pricing_defaults;
DROP POLICY IF EXISTS service_read_cp_zone ON client_pricing_zone_rules;
DROP POLICY IF EXISTS service_read_cp_extra ON client_pricing_package_extras;

-- Create proper RLS policies for authenticated users and admin access
CREATE POLICY client_pricing_defaults_select_policy ON client_pricing_defaults 
FOR SELECT USING (true);

CREATE POLICY client_pricing_zone_rules_select_policy ON client_pricing_zone_rules 
FOR SELECT USING (true);

CREATE POLICY client_pricing_package_extras_select_policy ON client_pricing_package_extras 
FOR SELECT USING (true);

-- Only admins can manage client pricing
CREATE POLICY client_pricing_defaults_admin_policy ON client_pricing_defaults 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY client_pricing_zone_rules_admin_policy ON client_pricing_zone_rules 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY client_pricing_package_extras_admin_policy ON client_pricing_package_extras 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());