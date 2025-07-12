-- Update the pickup ID generation function to use sequential format
DROP FUNCTION IF EXISTS public.generate_pickup_id();

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
    
    -- Format as PIC-XXX (3 digits with leading zeros)
    SELECT 'PIC-' || LPAD(next_number::TEXT, 3, '0') INTO new_pickup_id;
    
    RETURN new_pickup_id;
END;
$function$;

-- Update existing pickup IDs to use the new sequential format using a CTE
WITH numbered_pickups AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.pickups
  WHERE pickup_id IS NULL OR pickup_id !~ '^PIC-[0-9]{3}$'
)
UPDATE public.pickups 
SET pickup_id = 'PIC-' || LPAD(numbered_pickups.row_num::TEXT, 3, '0')
FROM numbered_pickups
WHERE pickups.id = numbered_pickups.id;