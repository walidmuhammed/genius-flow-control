-- Create comprehensive pricing system tables
-- First, create the simplified zone pricing table (governorate-level only)
CREATE TABLE IF NOT EXISTS public.pricing_zone (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate_id UUID NOT NULL UNIQUE,
  fee_usd DECIMAL(10,2) DEFAULT 0,
  fee_lbp BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (governorate_id) REFERENCES public.governorates(id) ON DELETE CASCADE
);

-- Create global package extras table  
CREATE TABLE IF NOT EXISTS public.pricing_package_extras_global (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_type VARCHAR(32) NOT NULL CHECK (package_type IN ('Parcel','Document','Bulky')),
  extra_usd DECIMAL(10,2) DEFAULT 0,
  extra_lbp BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(package_type)
);

-- Create order price snapshot table for immutable pricing history
CREATE TABLE IF NOT EXISTS public.order_price_snapshot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE,
  client_id UUID,
  governorate_id UUID,
  city_id UUID,
  package_type VARCHAR(32),
  base_fee_usd DECIMAL(10,2) DEFAULT 0,
  extra_fee_usd DECIMAL(10,2) DEFAULT 0,
  total_fee_usd DECIMAL(10,2) DEFAULT 0,
  base_fee_lbp BIGINT DEFAULT 0,
  extra_fee_lbp BIGINT DEFAULT 0,
  total_fee_lbp BIGINT DEFAULT 0,
  pricing_source VARCHAR(64) CHECK (pricing_source IN ('client_specific','zone','global')),
  rule_details JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- Enable RLS on new tables
ALTER TABLE public.pricing_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_package_extras_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_price_snapshot ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pricing_zone
CREATE POLICY "pricing_zone_admin_all" ON public.pricing_zone 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "pricing_zone_read_authenticated" ON public.pricing_zone 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create RLS policies for pricing_package_extras_global
CREATE POLICY "pricing_package_extras_global_admin_all" ON public.pricing_package_extras_global 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "pricing_package_extras_global_read_authenticated" ON public.pricing_package_extras_global 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create RLS policies for order_price_snapshot
CREATE POLICY "order_price_snapshot_admin_all" ON public.order_price_snapshot 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "order_price_snapshot_read_own" ON public.order_price_snapshot 
FOR SELECT USING (client_id = auth.uid() OR is_admin());

-- Create update triggers for updated_at timestamps
CREATE TRIGGER update_pricing_zone_updated_at
BEFORE UPDATE ON public.pricing_zone
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_pricing_package_extras_global_updated_at
BEFORE UPDATE ON public.pricing_package_extras_global
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Create comprehensive pricing calculation function
CREATE OR REPLACE FUNCTION public.calculate_comprehensive_delivery_fee(
  p_client_id UUID DEFAULT NULL::uuid,
  p_governorate_id UUID DEFAULT NULL::uuid,
  p_city_id UUID DEFAULT NULL::uuid,
  p_package_type TEXT DEFAULT NULL::text
) RETURNS TABLE(
  base_fee_usd DECIMAL(10,2),
  base_fee_lbp BIGINT,
  extra_fee_usd DECIMAL(10,2),
  extra_fee_lbp BIGINT,
  total_fee_usd DECIMAL(10,2),
  total_fee_lbp BIGINT,
  pricing_source TEXT,
  rule_details JSONB
) LANGUAGE plpgsql STABLE SET search_path TO 'public' AS $$
DECLARE
  base_usd DECIMAL(10,2) := 0;
  base_lbp BIGINT := 0;
  extra_usd DECIMAL(10,2) := 0;
  extra_lbp BIGINT := 0;
  source_type TEXT := 'global';
  rule_info JSONB := '{}';
  normalized_package TEXT;
BEGIN
  -- Normalize package type
  IF p_package_type IS NOT NULL THEN
    normalized_package := INITCAP(p_package_type);
  END IF;

  -- Step 1: Determine base fee (client-specific > zone > global)
  
  -- Try client-specific zone override first
  IF p_client_id IS NOT NULL AND p_governorate_id IS NOT NULL THEN
    SELECT pczr.fee_usd, pczr.fee_lbp 
    INTO base_usd, base_lbp
    FROM public.pricing_client_zone_rules pczr
    WHERE pczr.client_id = p_client_id
      AND p_governorate_id = ANY(pczr.governorate_ids)
    LIMIT 1;
    
    IF FOUND THEN
      source_type := 'client_specific';
      rule_info := jsonb_build_object('type', 'client_zone_override', 'client_id', p_client_id, 'governorate_id', p_governorate_id);
    END IF;
  END IF;

  -- Try client-specific default if no zone override found
  IF NOT FOUND AND p_client_id IS NOT NULL THEN
    SELECT pcd.default_fee_usd, pcd.default_fee_lbp
    INTO base_usd, base_lbp
    FROM public.pricing_client_defaults pcd
    WHERE pcd.client_id = p_client_id
    LIMIT 1;
    
    IF FOUND THEN
      source_type := 'client_specific';
      rule_info := jsonb_build_object('type', 'client_default', 'client_id', p_client_id);
    END IF;
  END IF;

  -- Try zone pricing if no client-specific pricing found
  IF NOT FOUND AND p_governorate_id IS NOT NULL THEN
    SELECT pz.fee_usd, pz.fee_lbp
    INTO base_usd, base_lbp
    FROM public.pricing_zone pz
    WHERE pz.governorate_id = p_governorate_id
    LIMIT 1;
    
    IF FOUND THEN
      source_type := 'zone';
      rule_info := jsonb_build_object('type', 'zone_pricing', 'governorate_id', p_governorate_id);
    END IF;
  END IF;

  -- Fall back to global pricing
  IF NOT FOUND THEN
    SELECT pg.default_fee_usd, pg.default_fee_lbp
    INTO base_usd, base_lbp
    FROM public.pricing_global pg
    ORDER BY pg.updated_at DESC
    LIMIT 1;
    
    source_type := 'global';
    rule_info := jsonb_build_object('type', 'global_default');
  END IF;

  -- Step 2: Add package type extras
  IF normalized_package IS NOT NULL THEN
    -- Try client-specific package extra first
    IF p_client_id IS NOT NULL THEN
      SELECT pcpe.extra_fee_usd, pcpe.extra_fee_lbp
      INTO extra_usd, extra_lbp
      FROM public.pricing_client_package_extras pcpe
      WHERE pcpe.client_id = p_client_id
        AND INITCAP(pcpe.package_type) = normalized_package
      LIMIT 1;
      
      IF FOUND THEN
        rule_info := rule_info || jsonb_build_object('package_extra_type', 'client_specific', 'package_type', normalized_package);
      END IF;
    END IF;

    -- Fall back to global package extra if no client-specific extra found
    IF NOT FOUND THEN
      SELECT ppeg.extra_usd, ppeg.extra_lbp
      INTO extra_usd, extra_lbp
      FROM public.pricing_package_extras_global ppeg
      WHERE ppeg.package_type = normalized_package
      LIMIT 1;
      
      IF FOUND THEN
        rule_info := rule_info || jsonb_build_object('package_extra_type', 'global', 'package_type', normalized_package);
      END IF;
    END IF;
  END IF;

  -- Return calculated fees
  RETURN QUERY SELECT 
    COALESCE(base_usd, 0)::DECIMAL(10,2) as base_fee_usd,
    COALESCE(base_lbp, 0)::BIGINT as base_fee_lbp,
    COALESCE(extra_usd, 0)::DECIMAL(10,2) as extra_fee_usd,
    COALESCE(extra_lbp, 0)::BIGINT as extra_fee_lbp,
    (COALESCE(base_usd, 0) + COALESCE(extra_usd, 0))::DECIMAL(10,2) as total_fee_usd,
    (COALESCE(base_lbp, 0) + COALESCE(extra_lbp, 0))::BIGINT as total_fee_lbp,
    source_type as pricing_source,
    rule_info as rule_details;
END;
$$;

-- Insert default global package extras if they don't exist
INSERT INTO public.pricing_package_extras_global (package_type, extra_usd, extra_lbp)
VALUES 
  ('Parcel', 0, 0),
  ('Document', 1, 30000),
  ('Bulky', 3, 90000)
ON CONFLICT (package_type) DO NOTHING;