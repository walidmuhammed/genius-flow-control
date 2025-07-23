-- Add support for multiple governorates per client pricing rule
-- Add new table for client default pricing (separate from overrides)
CREATE TABLE IF NOT EXISTS public.pricing_client_defaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  default_fee_usd NUMERIC DEFAULT 0,
  default_fee_lbp NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add new table for client zone rules (multiple governorates per rule)
CREATE TABLE IF NOT EXISTS public.pricing_client_zone_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  governorate_ids UUID[] NOT NULL, -- Array of governorate IDs
  fee_usd NUMERIC DEFAULT 0,
  fee_lbp NUMERIC DEFAULT 0,
  rule_name TEXT, -- Optional name for the rule
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add new table for client package type extras
CREATE TABLE IF NOT EXISTS public.pricing_client_package_extras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  package_type TEXT NOT NULL CHECK (package_type IN ('Parcel', 'Document', 'Bulky')),
  extra_fee_usd NUMERIC DEFAULT 0,
  extra_fee_lbp NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(client_id, package_type)
);

-- Enable RLS on all new tables
ALTER TABLE public.pricing_client_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_client_zone_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_client_package_extras ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Only admins can manage client defaults" ON public.pricing_client_defaults
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Only admins can manage client zone rules" ON public.pricing_client_zone_rules
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Only admins can manage client package extras" ON public.pricing_client_package_extras
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pricing_client_defaults_client_id ON public.pricing_client_defaults(client_id);
CREATE INDEX IF NOT EXISTS idx_pricing_client_zone_rules_client_id ON public.pricing_client_zone_rules(client_id);
CREATE INDEX IF NOT EXISTS idx_pricing_client_zone_rules_governorates ON public.pricing_client_zone_rules USING GIN(governorate_ids);
CREATE INDEX IF NOT EXISTS idx_pricing_client_package_extras_client_id ON public.pricing_client_package_extras(client_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_pricing_client_defaults_updated_at
  BEFORE UPDATE ON public.pricing_client_defaults
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_pricing_client_zone_rules_updated_at
  BEFORE UPDATE ON public.pricing_client_zone_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_pricing_client_package_extras_updated_at
  BEFORE UPDATE ON public.pricing_client_package_extras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();