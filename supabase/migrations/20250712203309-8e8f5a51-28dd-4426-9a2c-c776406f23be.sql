-- Fix missing foreign key relationship between pickups and profiles
ALTER TABLE public.pickups 
ADD CONSTRAINT pickups_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure pickup_id is truly unique and sequential
CREATE UNIQUE INDEX IF NOT EXISTS pickups_pickup_id_unique ON public.pickups(pickup_id);

-- Update the generate_pickup_id function to be more robust
CREATE OR REPLACE FUNCTION public.generate_pickup_id()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
    next_number INTEGER;
    new_pickup_id TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    LOOP
        -- Get the next sequential number with proper locking
        SELECT COALESCE(MAX(CAST(SUBSTRING(pickup_id FROM 5) AS INTEGER)), 0) + 1
        INTO next_number
        FROM public.pickups
        WHERE pickup_id IS NOT NULL AND pickup_id ~ '^PIC-[0-9]+$'
        FOR UPDATE;
        
        -- Format as PIC-XX (2 digits with leading zeros)
        new_pickup_id := 'PIC-' || LPAD(next_number::TEXT, 2, '0');
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM public.pickups WHERE pickup_id = new_pickup_id) THEN
            RETURN new_pickup_id;
        END IF;
        
        -- Increment attempt counter and exit if too many attempts
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique pickup ID after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$function$;