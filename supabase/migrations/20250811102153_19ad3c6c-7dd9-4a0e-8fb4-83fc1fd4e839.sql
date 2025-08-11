-- Fix database function security by adding proper search_path configuration
-- This prevents SQL injection attacks through search_path manipulation

-- Update generate_pickup_id function
CREATE OR REPLACE FUNCTION public.generate_pickup_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
    next_number INTEGER;
    new_pickup_id TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    LOOP
        -- Get the next sequential number without FOR UPDATE (which can't be used with aggregates)
        SELECT COALESCE(MAX(CAST(SUBSTRING(pickup_id FROM 5) AS INTEGER)), 0) + 1
        INTO next_number
        FROM public.pickups
        WHERE pickup_id IS NOT NULL AND pickup_id ~ '^PIC-[0-9]+$';
        
        -- Format as PIC-XX (2 digits with leading zeros)
        new_pickup_id := 'PIC-' || LPAD(next_number::TEXT, 2, '0');
        
        -- Try to insert a dummy record to test uniqueness (using INSERT conflict detection)
        BEGIN
            -- Use advisory lock to prevent race conditions
            PERFORM pg_advisory_lock(12345);
            
            -- Double-check uniqueness after getting the lock
            IF NOT EXISTS (SELECT 1 FROM public.pickups WHERE pickup_id = new_pickup_id) THEN
                PERFORM pg_advisory_unlock(12345);
                RETURN new_pickup_id;
            END IF;
            
            PERFORM pg_advisory_unlock(12345);
        EXCEPTION WHEN OTHERS THEN
            PERFORM pg_advisory_unlock(12345);
        END;
        
        -- Increment attempt counter and exit if too many attempts
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique pickup ID after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$function$;

-- Update delete_client_pricing_configuration function
CREATE OR REPLACE FUNCTION public.delete_client_pricing_configuration(p_client_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update prevent_user_type_escalation function
CREATE OR REPLACE FUNCTION public.prevent_user_type_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Allow if admin is making the change
  IF public.is_current_user_admin() THEN
    RETURN NEW;
  END IF;
  
  -- For non-admins, prevent user_type changes
  IF OLD.user_type IS DISTINCT FROM NEW.user_type THEN
    -- Log the attempt
    PERFORM public.log_security_event(
      'privilege_escalation_attempt',
      NEW.id,
      jsonb_build_object(
        'attempted_role', NEW.user_type,
        'current_role', OLD.user_type,
        'user_id', auth.uid()
      )
    );
    
    RAISE EXCEPTION 'Access denied: Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update calculate_delivery_fee function
CREATE OR REPLACE FUNCTION public.calculate_delivery_fee(p_client_id uuid DEFAULT NULL::uuid, p_governorate_id uuid DEFAULT NULL::uuid, p_city_id uuid DEFAULT NULL::uuid, p_package_type text DEFAULT NULL::text)
 RETURNS TABLE(fee_usd numeric, fee_lbp numeric, rule_type text)
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
DECLARE
  result_fee_usd DECIMAL;
  result_fee_lbp DECIMAL;
  result_rule_type TEXT;
  normalized_package_type TEXT;
  client_default_fee_usd DECIMAL;
  client_default_fee_lbp DECIMAL;
  package_extra_found BOOLEAN := FALSE;
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
    -- First check if client has default pricing
    SELECT pcd.default_fee_usd, pcd.default_fee_lbp INTO client_default_fee_usd, client_default_fee_lbp
    FROM public.pricing_client_defaults pcd
    WHERE pcd.client_id = p_client_id
    LIMIT 1;
    
    -- If client has default pricing, check for package extras
    IF FOUND THEN
      -- Check if package extra exists for this package type
      SELECT 
        COALESCE(client_default_fee_usd, 0) + COALESCE(pcpe.extra_fee_usd, 0),
        COALESCE(client_default_fee_lbp, 0) + COALESCE(pcpe.extra_fee_lbp, 0),
        TRUE
      INTO result_fee_usd, result_fee_lbp, package_extra_found
      FROM public.pricing_client_package_extras pcpe
      WHERE pcpe.client_id = p_client_id
        AND INITCAP(pcpe.package_type) = normalized_package_type
      LIMIT 1;
      
      -- If package extra was found, return as client_package
      IF package_extra_found THEN
        result_rule_type := 'client_package';
        RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
        RETURN;
      END IF;
      
      -- No package extra found, but client has default pricing - continue to Priority 3
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

-- Update generate_reference_number function
CREATE OR REPLACE FUNCTION public.generate_reference_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
    random_string TEXT;
BEGIN
    SELECT 'REF-' || SUBSTRING(MD5(''||now()::text) FROM 1 FOR 5) INTO random_string;
    RETURN random_string;
END;
$function$;

-- Update generate_invoice_id function
CREATE OR REPLACE FUNCTION public.generate_invoice_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
    new_invoice_id TEXT;
    existing_count INTEGER;
BEGIN
    SELECT 'INV-' || LPAD(FLOOR(random() * 10000)::TEXT, 4, '0') INTO new_invoice_id;
    
    SELECT COUNT(*) INTO existing_count
    FROM public.invoices
    WHERE invoices.invoice_id = new_invoice_id;
    
    IF existing_count > 0 THEN
        RETURN public.generate_invoice_id();
    END IF;
    
    RETURN new_invoice_id;
END;
$function$;

-- Update set_pickup_id function
CREATE OR REPLACE FUNCTION public.set_pickup_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    IF NEW.pickup_id IS NULL THEN
        NEW.pickup_id := public.generate_pickup_id();
    END IF;
    RETURN NEW;
END;
$function$;

-- Update update_timestamp function
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update set_order_reference_number function
CREATE OR REPLACE FUNCTION public.set_order_reference_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    IF NEW.reference_number IS NULL THEN
        NEW.reference_number := public.generate_reference_number();
    END IF;
    RETURN NEW;
END;
$function$;

-- Update set_invoice_id function
CREATE OR REPLACE FUNCTION public.set_invoice_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    IF NEW.invoice_id IS NULL THEN
        NEW.invoice_id := public.generate_invoice_id();
    END IF;
    RETURN NEW;
END;
$function$;

-- Update generate_ticket_number function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
    next_number INTEGER;
    new_ticket_number TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.tickets
    WHERE ticket_number IS NOT NULL AND ticket_number ~ '^TIC-[0-9]+$';
    
    -- Format as TIC-XXX (3 digits with leading zeros)
    SELECT 'TIC-' || LPAD(next_number::TEXT, 3, '0') INTO new_ticket_number;
    
    RETURN new_ticket_number;
END;
$function$;

-- Update log_activity function
CREATE OR REPLACE FUNCTION public.log_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.activity_logs (entity_type, entity_id, action, details, performed_by)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            'created',
            jsonb_build_object('data', row_to_json(NEW)::jsonb),
            coalesce(current_setting('app.current_user', true), 'system')
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.activity_logs (entity_type, entity_id, action, details, performed_by)
        VALUES (
            TG_ARGV[0],
            NEW.id,
            'updated',
            jsonb_build_object('old', row_to_json(OLD)::jsonb, 'new', row_to_json(NEW)::jsonb),
            coalesce(current_setting('app.current_user', true), 'system')
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.activity_logs (entity_type, entity_id, action, details, performed_by)
        VALUES (
            TG_ARGV[0],
            OLD.id,
            'deleted',
            jsonb_build_object('data', row_to_json(OLD)::jsonb),
            coalesce(current_setting('app.current_user', true), 'system')
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$;

-- Update set_ticket_number function
CREATE OR REPLACE FUNCTION public.set_ticket_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$function$;

-- Update update_pickup_orders_count function
CREATE OR REPLACE FUNCTION public.update_pickup_orders_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pickups 
    SET orders_count = (
      SELECT COUNT(*) FROM public.pickup_orders WHERE pickup_id = NEW.pickup_id
    )
    WHERE id = NEW.pickup_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pickups 
    SET orders_count = (
      SELECT COUNT(*) FROM public.pickup_orders WHERE pickup_id = OLD.pickup_id
    )
    WHERE id = OLD.pickup_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update log_pricing_change function
CREATE OR REPLACE FUNCTION public.log_pricing_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update get_current_user_profile function
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
 RETURNS TABLE(user_id uuid, user_type text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT id, user_type FROM public.profiles WHERE id = auth.uid();
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, business_name, business_type, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'business_name',
    NEW.raw_user_meta_data ->> 'business_type',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'client')
  );
  
  -- If user type is courier, also create courier record
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'client') = 'courier' THEN
    INSERT INTO public.couriers (
      id,
      full_name,
      phone,
      email,
      status,
      vehicle_type
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.email,
      'active',
      'motorcycle'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$function$;

-- Update get_user_profile function
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
 RETURNS TABLE(id uuid, email text, full_name text, phone text, business_name text, business_type text, user_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    u.email,
    p.full_name,
    p.phone,
    p.business_name,
    p.business_type,
    p.user_type
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = user_id;
END;
$function$;

-- Update get_top_courier_today function
CREATE OR REPLACE FUNCTION public.get_top_courier_today(start_date timestamp with time zone, end_date timestamp with time zone)
 RETURNS TABLE(courier_name text, orders_count bigint)
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    orders.courier_name,
    COUNT(*) as orders_count
  FROM 
    public.orders
  WHERE 
    orders.status = 'Successful'
    AND orders.created_at >= start_date
    AND orders.created_at <= end_date
    AND orders.courier_name IS NOT NULL
  GROUP BY 
    orders.courier_name
  ORDER BY 
    orders_count DESC
  LIMIT 1;
END;
$function$;

-- Update is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$function$;

-- Update update_user_role function
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Only admins can update user roles
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can update user roles';
  END IF;
  
  -- Validate role value
  IF new_role NOT IN ('client', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: must be either client or admin';
  END IF;
  
  -- Update the user role
  UPDATE public.profiles 
  SET user_type = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the role change for security audit
  INSERT INTO public.activity_logs (entity_type, entity_id, action, details, performed_by)
  VALUES (
    'profiles',
    target_user_id,
    'role_changed',
    jsonb_build_object('new_role', new_role, 'changed_by', auth.uid()),
    auth.uid()::text
  );
  
  RETURN FOUND;
END;
$function$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, entity_id uuid, details jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.activity_logs (entity_type, entity_id, action, details, performed_by)
  VALUES (
    'security',
    COALESCE(entity_id, auth.uid()),
    event_type,
    details || jsonb_build_object('timestamp', now(), 'user_id', auth.uid()),
    COALESCE(auth.uid()::text, 'system')
  );
END;
$function$;

-- Update set_customer_created_by function
CREATE OR REPLACE FUNCTION public.set_customer_created_by()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;