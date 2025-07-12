-- Fix pickup ID format to use 2-digit padding (PIC-01, PIC-02, etc.)
CREATE OR REPLACE FUNCTION public.generate_pickup_id()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
    next_number INTEGER;
    new_pickup_id TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(pickup_id FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.pickups
    WHERE pickup_id IS NOT NULL AND pickup_id ~ '^PIC-[0-9]+$';
    
    -- Format as PIC-XX (2 digits with leading zeros)
    SELECT 'PIC-' || LPAD(next_number::TEXT, 2, '0') INTO new_pickup_id;
    
    RETURN new_pickup_id;
END;
$function$;

-- Update existing pickup IDs to use 2-digit format
WITH numbered_pickups AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM public.pickups
    WHERE pickup_id IS NOT NULL
)
UPDATE public.pickups 
SET pickup_id = 'PIC-' || LPAD(numbered_pickups.rn::TEXT, 2, '0')
FROM numbered_pickups
WHERE public.pickups.id = numbered_pickups.id;