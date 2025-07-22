-- Fix pricing_client_overrides table constraints
-- Drop the existing unique constraint on client_id only
ALTER TABLE public.pricing_client_overrides DROP CONSTRAINT IF EXISTS pricing_client_overrides_client_id_key;

-- Create a unique index instead of a unique constraint for better handling of nulls
CREATE UNIQUE INDEX IF NOT EXISTS pricing_client_overrides_unique_combination 
ON public.pricing_client_overrides (
  client_id, 
  COALESCE(governorate_id::text, 'NULL'), 
  COALESCE(city_id::text, 'NULL'), 
  COALESCE(package_type, 'NULL')
);

-- Add a check constraint to ensure logical consistency (can't have both governorate and city)
ALTER TABLE public.pricing_client_overrides 
ADD CONSTRAINT pricing_client_overrides_location_logic 
CHECK (
  (governorate_id IS NULL AND city_id IS NULL) OR 
  (governorate_id IS NOT NULL AND city_id IS NULL) OR 
  (governorate_id IS NULL AND city_id IS NOT NULL)
);