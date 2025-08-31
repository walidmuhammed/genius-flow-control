-- Create courier settlements table first
CREATE TABLE public.courier_settlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_id TEXT NOT NULL UNIQUE,
  courier_id UUID NOT NULL REFERENCES public.couriers(id),
  total_collected_usd NUMERIC DEFAULT 0,
  total_collected_lbp NUMERIC DEFAULT 0,
  total_courier_fees_usd NUMERIC DEFAULT 0,
  total_courier_fees_lbp NUMERIC DEFAULT 0,
  balance_usd NUMERIC DEFAULT 0,
  balance_lbp NUMERIC DEFAULT 0,
  direction TEXT NOT NULL CHECK (direction IN ('courier_to_admin', 'admin_to_courier')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Paid')),
  payment_method TEXT CHECK (payment_method IN ('Cash Handover', 'Bank Transfer', 'Wallet Adjustment')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add courier fee fields to orders table
ALTER TABLE public.orders 
ADD COLUMN courier_fee_usd NUMERIC DEFAULT 0,
ADD COLUMN courier_fee_lbp NUMERIC DEFAULT 0,
ADD COLUMN courier_settlement_id UUID REFERENCES public.courier_settlements(id),
ADD COLUMN courier_settlement_status TEXT DEFAULT 'None' CHECK (courier_settlement_status IN ('None', 'Pending', 'Settled')),
ADD COLUMN cash_handover_status TEXT DEFAULT 'None' CHECK (cash_handover_status IN ('None', 'Confirmed'));

-- Create courier pricing defaults table
CREATE TABLE public.courier_pricing_defaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_type TEXT NOT NULL CHECK (package_type IN ('parcel', 'document', 'bulky')),
  base_fee_usd NUMERIC DEFAULT 0,
  base_fee_lbp NUMERIC DEFAULT 0,
  governorate_id UUID REFERENCES public.governorates(id),
  vehicle_type TEXT CHECK (vehicle_type IN ('motorcycle', 'car', 'van')),
  vehicle_multiplier NUMERIC DEFAULT 1.0,
  after_hours_multiplier NUMERIC DEFAULT 1.5,
  remote_area_extra_usd NUMERIC DEFAULT 0,
  remote_area_extra_lbp NUMERIC DEFAULT 0,
  unsuccessful_fee_usd NUMERIC DEFAULT 0,
  unsuccessful_fee_lbp NUMERIC DEFAULT 0,
  return_fee_usd NUMERIC DEFAULT 0,
  return_fee_lbp NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courier pricing overrides table
CREATE TABLE public.courier_pricing_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id UUID NOT NULL REFERENCES public.couriers(id),
  package_type TEXT CHECK (package_type IN ('parcel', 'document', 'bulky')),
  base_fee_usd NUMERIC,
  base_fee_lbp NUMERIC,
  governorate_id UUID REFERENCES public.governorates(id),
  vehicle_multiplier NUMERIC,
  after_hours_multiplier NUMERIC,
  remote_area_extra_usd NUMERIC,
  remote_area_extra_lbp NUMERIC,
  unsuccessful_fee_usd NUMERIC,
  unsuccessful_fee_lbp NUMERIC,
  return_fee_usd NUMERIC,
  return_fee_lbp NUMERIC,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(courier_id, package_type, governorate_id, effective_date)
);

-- Create function to generate settlement IDs
CREATE OR REPLACE FUNCTION public.generate_settlement_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    next_number INTEGER;
    new_settlement_id TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(settlement_id FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.courier_settlements
    WHERE settlement_id IS NOT NULL AND settlement_id ~ '^CST-[0-9]+$';
    
    new_settlement_id := 'CST-' || LPAD(next_number::TEXT, 3, '0');
    RETURN new_settlement_id;
END;
$$;

-- Trigger to auto-generate settlement ID
CREATE OR REPLACE FUNCTION public.set_settlement_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.settlement_id IS NULL THEN
        NEW.settlement_id := public.generate_settlement_id();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_settlement_id_trigger
    BEFORE INSERT ON public.courier_settlements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_settlement_id();

-- Function to calculate courier fees
CREATE OR REPLACE FUNCTION public.calculate_courier_fee(
  p_courier_id UUID,
  p_package_type TEXT,
  p_governorate_id UUID DEFAULT NULL,
  p_order_status TEXT DEFAULT 'Successful'
)
RETURNS TABLE(fee_usd NUMERIC, fee_lbp NUMERIC)
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
AS $$
DECLARE
  base_usd NUMERIC := 0;
  base_lbp NUMERIC := 0;
  multiplier NUMERIC := 1.0;
BEGIN
  -- Try courier-specific override first
  SELECT 
    COALESCE(cpo.base_fee_usd, cpd.base_fee_usd, 2) as fee_usd,
    COALESCE(cpo.base_fee_lbp, cpd.base_fee_lbp, 75000) as fee_lbp,
    COALESCE(cpo.vehicle_multiplier, cpd.vehicle_multiplier, 1.0) as vehicle_mult
  INTO base_usd, base_lbp, multiplier
  FROM public.courier_pricing_defaults cpd
  LEFT JOIN public.courier_pricing_overrides cpo ON (
    cpo.courier_id = p_courier_id 
    AND cpo.package_type = p_package_type
    AND (cpo.governorate_id = p_governorate_id OR cpo.governorate_id IS NULL)
    AND cpo.is_active = true
  )
  WHERE cpd.package_type = p_package_type
    AND (cpd.governorate_id = p_governorate_id OR cpd.governorate_id IS NULL)
    AND cpd.is_active = true
  ORDER BY 
    CASE WHEN cpo.courier_id IS NOT NULL THEN 1 ELSE 2 END,
    CASE WHEN cpd.governorate_id IS NOT NULL THEN 1 ELSE 2 END
  LIMIT 1;

  -- If no pricing found, use global defaults
  IF base_usd = 0 AND base_lbp = 0 THEN
    base_usd := 2;
    base_lbp := 75000;
  END IF;

  -- Adjust for unsuccessful orders
  IF p_order_status IN ('Unsuccessful', 'Returned') THEN
    SELECT 
      COALESCE(cpo.unsuccessful_fee_usd, cpd.unsuccessful_fee_usd, base_usd * 0.5),
      COALESCE(cpo.unsuccessful_fee_lbp, cpd.unsuccessful_fee_lbp, base_lbp * 0.5)
    INTO base_usd, base_lbp
    FROM public.courier_pricing_defaults cpd
    LEFT JOIN public.courier_pricing_overrides cpo ON (
      cpo.courier_id = p_courier_id 
      AND cpo.package_type = p_package_type
    )
    WHERE cpd.package_type = p_package_type
    LIMIT 1;
  END IF;

  -- Apply multipliers
  base_usd := base_usd * multiplier;
  base_lbp := base_lbp * multiplier;

  RETURN QUERY SELECT base_usd, base_lbp;
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.courier_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_pricing_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_pricing_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courier_settlements
CREATE POLICY "Admins can manage all settlements" ON public.courier_settlements
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Couriers can view their settlements" ON public.courier_settlements
  FOR SELECT USING (courier_id = auth.uid());

-- RLS Policies for pricing tables
CREATE POLICY "Admins can manage pricing defaults" ON public.courier_pricing_defaults
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can view pricing defaults" ON public.courier_pricing_defaults
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage pricing overrides" ON public.courier_pricing_overrides
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Couriers can view their pricing overrides" ON public.courier_pricing_overrides
  FOR SELECT USING (courier_id = auth.uid());

-- Insert default pricing data
INSERT INTO public.courier_pricing_defaults (package_type, base_fee_usd, base_fee_lbp, unsuccessful_fee_usd, unsuccessful_fee_lbp) VALUES
('parcel', 2.0, 75000, 1.0, 37500),
('document', 1.5, 55000, 0.75, 27500),
('bulky', 3.0, 110000, 1.5, 55000);

-- Update trigger for timestamps
CREATE TRIGGER update_courier_settlements_updated_at
    BEFORE UPDATE ON public.courier_settlements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_courier_pricing_defaults_updated_at
    BEFORE UPDATE ON public.courier_pricing_defaults
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_courier_pricing_overrides_updated_at
    BEFORE UPDATE ON public.courier_pricing_overrides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();