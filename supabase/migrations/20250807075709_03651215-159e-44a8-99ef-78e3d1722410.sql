-- Update the calculate_delivery_fee function to use the correct client pricing tables
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

  -- Priority 1: Client-specific zone rules (pricing_client_zone_rules)
  IF p_governorate_id IS NOT NULL AND p_client_id IS NOT NULL THEN
    SELECT pczr.fee_usd, pczr.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_client_zone_rules pczr
    WHERE pczr.client_id = p_client_id
      AND p_governorate_id = ANY(pczr.governorate_ids)
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'client_zone';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 2: Client-specific package extras (pricing_client_package_extras)
  IF normalized_package_type IS NOT NULL AND p_client_id IS NOT NULL THEN
    -- Get client default fee first
    SELECT pcd.default_fee_usd, pcd.default_fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_client_defaults pcd
    WHERE pcd.client_id = p_client_id
    LIMIT 1;
    
    -- Add package extra if exists
    IF FOUND THEN
      SELECT 
        COALESCE(result_fee_usd, 0) + COALESCE(pcpe.extra_fee_usd, 0),
        COALESCE(result_fee_lbp, 0) + COALESCE(pcpe.extra_fee_lbp, 0)
      INTO result_fee_usd, result_fee_lbp
      FROM public.pricing_client_package_extras pcpe
      WHERE pcpe.client_id = p_client_id
        AND INITCAP(pcpe.package_type) = normalized_package_type
      LIMIT 1;
      
      result_rule_type := 'client_package';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 3: Client-specific default pricing (pricing_client_defaults)
  IF p_client_id IS NOT NULL THEN
    SELECT pcd.default_fee_usd, pcd.default_fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_client_defaults pcd
    WHERE pcd.client_id = p_client_id
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'client_default';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 4: Legacy client override (pricing_client_overrides) - for backward compatibility
  IF p_client_id IS NOT NULL THEN
    SELECT pco.fee_usd, pco.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_client_overrides pco
    WHERE pco.client_id = p_client_id
    LIMIT 1;
    
    IF FOUND THEN
      result_rule_type := 'client_legacy';
      RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
      RETURN;
    END IF;
  END IF;

  -- Priority 5: Global default
  SELECT pg.default_fee_usd, pg.default_fee_lbp INTO result_fee_usd, result_fee_lbp
  FROM public.pricing_global pg
  ORDER BY pg.updated_at DESC
  LIMIT 1;
  
  result_rule_type := 'global';
  RETURN QUERY SELECT COALESCE(result_fee_usd, 0), COALESCE(result_fee_lbp, 0), result_rule_type;
END;
$function$;