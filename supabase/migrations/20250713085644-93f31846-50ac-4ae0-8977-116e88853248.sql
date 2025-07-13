-- Fix the pickup ID generation function to remove FOR UPDATE with aggregates
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
        -- Get the next sequential number without FOR UPDATE (which can't be used with aggregates)
        SELECT COALESCE(MAX(CAST(SUBSTRING(pickup_id FROM 5) AS INTEGER)), 0) + 1
        INTO next_number
        FROM public.pickups
        WHERE pickup_id IS NOT NULL AND pickup_id ~ '^PIC-[0-9]+$';
        
        -- Format as PIC-XX (2 digits with leading zeros)
        new_pickup_id := 'PIC-' || LPAD(next_number::TEXT, 2, '0');
        
        -- Try to insert a dummy record to test uniqueness (using INSERT conflict detection)
        BEGIN
            -- Use advisory lock to prevent race conditions
            PERFORM pg_advisory_lock(12345);
            
            -- Double-check uniqueness after getting the lock
            IF NOT EXISTS (SELECT 1 FROM public.pickups WHERE pickup_id = new_pickup_id) THEN
                PERFORM pg_advisory_unlock(12345);
                RETURN new_pickup_id;
            END IF;
            
            PERFORM pg_advisory_unlock(12345);
        EXCEPTION WHEN OTHERS THEN
            PERFORM pg_advisory_unlock(12345);
        END;
        
        -- Increment attempt counter and exit if too many attempts
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique pickup ID after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$function$;