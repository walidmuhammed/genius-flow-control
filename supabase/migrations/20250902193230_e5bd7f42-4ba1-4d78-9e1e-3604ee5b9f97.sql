-- Fix search_path for all existing functions that don't have it set
-- This addresses the WARN 1: Function Search Path Mutable security issue

-- List and fix functions that might not have search_path set
CREATE OR REPLACE FUNCTION public.set_customer_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_pricing_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.pricing_change_logs (
    action,
    pricing_type,
    entity_id,
    old_values,
    new_values,
    changed_by
  ) VALUES (
    TG_OP,
    TG_ARGV[0], -- pricing_type passed as argument
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.log_customer_change(p_customer_id uuid, p_field_name text, p_old_value text, p_new_value text, p_change_reason text DEFAULT 'user_edit'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.customer_history (
    customer_id,
    field_name,
    old_value,
    new_value,
    changed_by,
    change_reason
  )
  VALUES (
    p_customer_id,
    p_field_name,
    p_old_value,
    p_new_value,
    auth.uid(),
    p_change_reason
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_client_pricing_configuration(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Ensure only admins can execute this logic
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can delete client pricing configurations';
  END IF;

  -- Remove new structured client-specific pricing first
  DELETE FROM public.pricing_client_package_extras WHERE client_id = p_client_id;
  DELETE FROM public.pricing_client_zone_rules WHERE client_id = p_client_id;
  DELETE FROM public.pricing_client_defaults WHERE client_id = p_client_id;

  -- Clean up legacy and mixed tables for full backward-compatibility
  DELETE FROM public.pricing_client_overrides WHERE client_id = p_client_id;
  DELETE FROM public.pricing_package_types WHERE client_id = p_client_id;
  DELETE FROM public.pricing_zone_rules WHERE client_id = p_client_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(user_id uuid, user_type text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id, user_type FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.create_client_payout_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_collected_usd NUMERIC := 0;
  v_collected_lbp NUMERIC := 0;
  v_delivery_usd NUMERIC := 0;
  v_delivery_lbp NUMERIC := 0;
  v_net_payout_usd NUMERIC := 0;
  v_net_payout_lbp NUMERIC := 0;
BEGIN
  -- Only create payout entry when status changes to Successful or Unsuccessful
  IF NEW.status IN ('Successful', 'Unsuccessful') AND (OLD.status IS NULL OR OLD.status NOT IN ('Successful', 'Unsuccessful')) THEN
    
    -- Get amounts with proper null handling
    v_collected_usd := COALESCE(NEW.collected_amount_usd, 0);
    v_collected_lbp := COALESCE(NEW.collected_amount_lbp, 0);
    v_delivery_usd := COALESCE(NEW.delivery_fees_usd, 0);
    v_delivery_lbp := COALESCE(NEW.delivery_fees_lbp, 0);
    
    -- Calculate net payout based on order status
    IF NEW.status = 'Successful' THEN
      -- For successful orders: net payout = collected amount - delivery fee
      v_net_payout_usd := v_collected_usd - v_delivery_usd;
      v_net_payout_lbp := v_collected_lbp - v_delivery_lbp;
    ELSIF NEW.status = 'Unsuccessful' THEN
      -- For unsuccessful orders: net payout = collected amount (partial payment) - delivery fee
      -- This results in negative amounts when no collection, or less negative when partial payment
      v_net_payout_usd := v_collected_usd - v_delivery_usd;
      v_net_payout_lbp := v_collected_lbp - v_delivery_lbp;
    END IF;
    
    INSERT INTO public.client_payouts (
      order_id,
      client_id,
      collected_amount_usd,
      collected_amount_lbp,
      delivery_fee_usd,
      delivery_fee_lbp,
      net_payout_usd,
      net_payout_lbp,
      payout_status,
      created_by
    ) VALUES (
      NEW.id,
      NEW.client_id,
      v_collected_usd,
      v_collected_lbp,
      v_delivery_usd,
      v_delivery_lbp,
      v_net_payout_usd,
      v_net_payout_lbp,
      'Pending',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_comprehensive_delivery_fee(p_client_id uuid DEFAULT NULL::uuid, p_governorate_id uuid DEFAULT NULL::uuid, p_city_id uuid DEFAULT NULL::uuid, p_package_type text DEFAULT NULL::text)
RETURNS TABLE(base_fee_usd numeric, base_fee_lbp bigint, extra_fee_usd numeric, extra_fee_lbp bigint, total_fee_usd numeric, total_fee_lbp bigint, pricing_source text, rule_details jsonb)
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
AS $$
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
$$;