-- Fix settlement ID generation to handle empty strings
CREATE OR REPLACE FUNCTION public.generate_settlement_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    next_number INTEGER;
    new_settlement_id TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    LOOP
        -- Get the next sequential number with proper locking
        SELECT COALESCE(MAX(CAST(SUBSTRING(settlement_id FROM 5) AS INTEGER)), 0) + 1
        INTO next_number
        FROM public.courier_settlements
        WHERE settlement_id IS NOT NULL 
        AND settlement_id != ''
        AND settlement_id ~ '^CST-[0-9]+$';
        
        -- Format as CST-XXX (3 digits with leading zeros)
        new_settlement_id := 'CST-' || LPAD(next_number::TEXT, 3, '0');
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM public.courier_settlements WHERE settlement_id = new_settlement_id) THEN
            RETURN new_settlement_id;
        END IF;
        
        -- Increment attempt counter and exit if too many attempts
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique settlement ID after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$;

-- Update trigger to handle empty strings
CREATE OR REPLACE FUNCTION public.set_settlement_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.settlement_id IS NULL OR NEW.settlement_id = '' THEN
        NEW.settlement_id := public.generate_settlement_id();
    END IF;
    RETURN NEW;
END;
$$;