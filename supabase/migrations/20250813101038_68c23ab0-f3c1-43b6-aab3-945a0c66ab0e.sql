-- Drop the existing global phone uniqueness constraint
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_phone_key;

-- Ensure created_by is NOT NULL (it should already be, but let's be explicit)
ALTER TABLE public.customers ALTER COLUMN created_by SET NOT NULL;

-- Create a new composite unique constraint for phone uniqueness per client
ALTER TABLE public.customers ADD CONSTRAINT customers_created_by_phone_key UNIQUE (created_by, phone);