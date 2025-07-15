-- Create pricing configuration tables for TopSpeed admin pricing system

-- Global pricing settings
CREATE TABLE public.pricing_global (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  default_fee_usd DECIMAL(10,2) NOT NULL DEFAULT 4.00,
  default_fee_lbp DECIMAL(10,2) NOT NULL DEFAULT 150000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Client-specific pricing overrides
CREATE TABLE public.pricing_client_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fee_usd DECIMAL(10,2) NOT NULL,
  fee_lbp DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(client_id)
);

-- Zone-based pricing rules
CREATE TABLE public.pricing_zone_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate_id UUID REFERENCES public.governorates(id),
  city_id UUID REFERENCES public.cities(id),
  zone_name TEXT, -- For custom zone names
  fee_usd DECIMAL(10,2) NOT NULL,
  fee_lbp DECIMAL(10,2) NOT NULL,
  client_id UUID REFERENCES public.profiles(id), -- NULL means applies to all clients
  package_type TEXT CHECK (package_type IN ('Parcel', 'Document', 'Bulky')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Package type pricing rules
CREATE TABLE public.pricing_package_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_type TEXT NOT NULL CHECK (package_type IN ('Parcel', 'Document', 'Bulky')),
  fee_usd DECIMAL(10,2) NOT NULL,
  fee_lbp DECIMAL(10,2) NOT NULL,
  client_id UUID REFERENCES public.profiles(id), -- NULL means global rule
  governorate_id UUID REFERENCES public.governorates(id), -- NULL means applies to all zones
  city_id UUID REFERENCES public.cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Pricing change logs for audit trail
CREATE TABLE public.pricing_change_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
  pricing_type TEXT NOT NULL, -- 'global', 'client', 'zone', 'package'
  entity_id UUID, -- ID of the affected pricing rule
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all pricing tables
ALTER TABLE public.pricing_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_client_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_zone_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_package_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_change_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage pricing
CREATE POLICY "Only admins can manage global pricing"
ON public.pricing_global
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can manage client pricing overrides"
ON public.pricing_client_overrides
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can manage zone pricing rules"
ON public.pricing_zone_rules
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can manage package type pricing"
ON public.pricing_package_types
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can view pricing change logs"
ON public.pricing_change_logs
FOR SELECT
USING (is_admin());

CREATE POLICY "Only admins can create pricing change logs"
ON public.pricing_change_logs
FOR INSERT
WITH CHECK (is_admin());

-- Insert default global pricing
INSERT INTO public.pricing_global (default_fee_usd, default_fee_lbp) 
VALUES (4.00, 150000);

-- Create indexes for performance
CREATE INDEX idx_pricing_client_overrides_client_id ON public.pricing_client_overrides(client_id);
CREATE INDEX idx_pricing_zone_rules_governorate_id ON public.pricing_zone_rules(governorate_id);
CREATE INDEX idx_pricing_zone_rules_city_id ON public.pricing_zone_rules(city_id);
CREATE INDEX idx_pricing_zone_rules_client_id ON public.pricing_zone_rules(client_id);
CREATE INDEX idx_pricing_package_types_package_type ON public.pricing_package_types(package_type);
CREATE INDEX idx_pricing_package_types_client_id ON public.pricing_package_types(client_id);
CREATE INDEX idx_pricing_change_logs_created_at ON public.pricing_change_logs(created_at DESC);

-- Function to log pricing changes
CREATE OR REPLACE FUNCTION public.log_pricing_change()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER pricing_global_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pricing_global
  FOR EACH ROW EXECUTE FUNCTION public.log_pricing_change('global');

CREATE TRIGGER pricing_client_overrides_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pricing_client_overrides
  FOR EACH ROW EXECUTE FUNCTION public.log_pricing_change('client');

CREATE TRIGGER pricing_zone_rules_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pricing_zone_rules
  FOR EACH ROW EXECUTE FUNCTION public.log_pricing_change('zone');

CREATE TRIGGER pricing_package_types_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pricing_package_types
  FOR EACH ROW EXECUTE FUNCTION public.log_pricing_change('package');

-- Function to calculate delivery fee based on priority rules
CREATE OR REPLACE FUNCTION public.calculate_delivery_fee(
  p_client_id UUID,
  p_governorate_id UUID DEFAULT NULL,
  p_city_id UUID DEFAULT NULL,
  p_package_type TEXT DEFAULT NULL
)
RETURNS TABLE(fee_usd DECIMAL, fee_lbp DECIMAL, rule_type TEXT) 
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result_fee_usd DECIMAL;
  result_fee_lbp DECIMAL;
  result_rule_type TEXT;
BEGIN
  -- Priority 1: Package + Zone + Client specific rule
  IF p_package_type IS NOT NULL AND (p_governorate_id IS NOT NULL OR p_city_id IS NOT NULL) AND p_client_id IS NOT NULL THEN
    SELECT ppt.fee_usd, ppt.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_package_types ppt
    WHERE ppt.package_type = p_package_type
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
  IF p_package_type IS NOT NULL AND (p_governorate_id IS NOT NULL OR p_city_id IS NOT NULL) THEN
    SELECT ppt.fee_usd, ppt.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_package_types ppt
    WHERE ppt.package_type = p_package_type
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
  IF p_package_type IS NOT NULL THEN
    SELECT ppt.fee_usd, ppt.fee_lbp INTO result_fee_usd, result_fee_lbp
    FROM public.pricing_package_types ppt
    WHERE ppt.package_type = p_package_type
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
  RETURN QUERY SELECT result_fee_usd, result_fee_lbp, result_rule_type;
END;
$$;