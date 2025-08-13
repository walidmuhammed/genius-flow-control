-- Update the comprehensive pricing function to properly prioritize client defaults when zone is null
CREATE OR REPLACE FUNCTION public.calculate_comprehensive_delivery_fee(
  p_client_id uuid DEFAULT NULL::uuid, 
  p_governorate_id uuid DEFAULT NULL::uuid, 
  p_city_id uuid DEFAULT NULL::uuid, 
  p_package_type text DEFAULT NULL::text
)
RETURNS TABLE(
  base_fee_usd numeric, 
  base_fee_lbp bigint, 
  extra_fee_usd numeric, 
  extra_fee_lbp bigint, 
  total_fee_usd numeric, 
  total_fee_lbp bigint, 
  pricing_source text, 
  rule_details jsonb
)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
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

  -- Step 1: Determine base fee
  -- PRIORITY 1: Client-specific zone override (only if governorate provided)
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

  -- PRIORITY 2: Client-specific default pricing (applies regardless of zone)
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

  -- PRIORITY 3: Zone pricing (only if no client pricing and governorate provided)
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

  -- PRIORITY 4: Global default (fallback)
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
$function$;