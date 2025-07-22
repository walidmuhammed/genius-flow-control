-- Fix pricing_client_overrides table constraints
-- Drop the existing unique constraint on client_id only
ALTER TABLE public.pricing_client_overrides DROP CONSTRAINT IF EXISTS pricing_client_overrides_client_id_key;

-- Add a composite unique constraint to prevent true duplicates while allowing multiple overrides per client
ALTER TABLE public.pricing_client_overrides 
ADD CONSTRAINT pricing_client_overrides_unique_combination 
UNIQUE (client_id, COALESCE(governorate_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(city_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(package_type, ''));

-- Add a check constraint to ensure logical consistency (can't have both governorate and city)
ALTER TABLE public.pricing_client_overrides 
ADD CONSTRAINT pricing_client_overrides_location_logic 
CHECK (
  (governorate_id IS NULL AND city_id IS NULL) OR 
  (governorate_id IS NOT NULL AND city_id IS NULL) OR 
  (governorate_id IS NULL AND city_id IS NOT NULL)
);