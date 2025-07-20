-- Enhance client pricing overrides to support zone and package type specificity
ALTER TABLE public.pricing_client_overrides 
ADD COLUMN governorate_id UUID REFERENCES public.governorates(id),
ADD COLUMN city_id UUID REFERENCES public.cities(id),
ADD COLUMN package_type TEXT;

-- Add index for better query performance
CREATE INDEX idx_client_overrides_location ON public.pricing_client_overrides(client_id, governorate_id, city_id, package_type);

-- Update global pricing to allow 0 values for either currency
ALTER TABLE public.pricing_global 
ALTER COLUMN default_fee_usd SET DEFAULT 0,
ALTER COLUMN default_fee_lbp SET DEFAULT 0;