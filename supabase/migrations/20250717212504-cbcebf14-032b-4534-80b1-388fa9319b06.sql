-- Fix case sensitivity in package type matching in calculate_delivery_fee function
CREATE OR REPLACE FUNCTION public.calculate_delivery_fee(p_client_id uuid, p_governorate_id uuid DEFAULT NULL::uuid, p_city_id uuid DEFAULT NULL::uuid, p_package_type text DEFAULT NULL::text)
RETURNS TABLE(fee_usd numeric, fee_lbp numeric, rule_type text)
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  result_fee_usd DECIMAL;
  result_fee_lbp DECIMAL;
  result_rule_type TEXT;
  normalized_package_type TEXT;
BEGIN
  -- Normalize package type to handle case insensitivity
  IF p_package_type IS NOT NULL THEN
    normalized_package_type := INITCAP(p_package_type); -- Converts to Title Case
  END IF;

  -- Priority 1: Package + Zone + Client specific rule
  IF normalized_package_type IS NOT NULL AND (p_governorate_id IS NOT NULL OR p_city_id IS NOT NULL) AND p_client_id IS NOT NULL THEN
    SELECT ppt.fee_usd, ppt.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_package_types ppt
    WHERE INITCAP(ppt.package_type) = normalized_package_type
      AND ppt.client_id = p_client_id
      AND (ppt.governorate_id = p_governorate_id OR ppt.city_id = p_city_id)
      AND ppt.is_active = true
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'package_zone_client';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 2: Package + Zone rule (global)
  IF normalized_package_type IS NOT NULL AND (p_governorate_id IS NOT NULL OR p_city_id IS NOT NULL) THEN
    SELECT ppt.fee_usd, ppt.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_package_types ppt
    WHERE INITCAP(ppt.package_type) = normalized_package_type
      AND ppt.client_id IS NULL
      AND (ppt.governorate_id = p_governorate_id OR ppt.city_id = p_city_id)
      AND ppt.is_active = true
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'package_zone';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 3: Zone + Client rule
  IF (p_governorate_id IS NOT NULL OR p_city_id IS NOT NULL) AND p_client_id IS NOT NULL THEN
    SELECT pzr.fee_usd, pzr.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_zone_rules pzr
    WHERE pzr.client_id = p_client_id
      AND (pzr.governorate_id = p_governorate_id OR pzr.city_id = p_city_id)
      AND pzr.is_active = true
      AND (
        pzr.package_type IS NULL 
        OR INITCAP(pzr.package_type) = normalized_package_type
      )
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'zone_client';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 4: Zone rule (global)
  IF p_governorate_id IS NOT NULL OR p_city_id IS NOT NULL THEN
    SELECT pzr.fee_usd, pzr.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_zone_rules pzr
    WHERE pzr.client_id IS NULL
      AND (pzr.governorate_id = p_governorate_id OR pzr.city_id = p_city_id)
      AND pzr.is_active = true
      AND (
        pzr.package_type IS NULL 
        OR INITCAP(pzr.package_type) = normalized_package_type
      )
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'zone';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 5: Client-specific override
  IF p_client_id IS NOT NULL THEN
    SELECT pco.fee_usd, pco.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_client_overrides pco
    WHERE pco.client_id = p_client_id
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'client';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 6: Package type rule (global)
  IF normalized_package_type IS NOT NULL THEN
    SELECT ppt.fee_usd, ppt.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_package_types ppt
    WHERE INITCAP(ppt.package_type) = normalized_package_type
      AND ppt.client_id IS NULL
      AND ppt.governorate_id IS NULL
      AND ppt.city_id IS NULL
      AND ppt.is_active = true
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'package';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 7: Global default
  SELECT pg.default_fee_usd, pg.default_fee_lbp INTO result_fee_usd, result_fee_lbp
  FROM public.pricing_global pg
  ORDER BY pg.updated_at DESC
  LIMIT 1;
  
  result_rule_type := 'global';
  RETURN QUERY SELECT COALESCE(result_fee_usd, 0), COALESCE(result_fee_lbp, 0), result_rule_type;
END;
$function$;