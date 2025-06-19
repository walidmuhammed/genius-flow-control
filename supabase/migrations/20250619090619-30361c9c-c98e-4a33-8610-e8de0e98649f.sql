
-- Add new columns to the tickets table to support entity linking and better organization
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS linked_entity_type TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS linked_entity_id UUID;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS issue_description TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT;

-- Create a function to generate sequential ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
    next_number INTEGER;
    new_ticket_number TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.tickets
    WHERE ticket_number IS NOT NULL AND ticket_number ~ '^TIC-[0-9]+$';
    
    -- Format as TIC-XXX (3 digits with leading zeros)
    SELECT 'TIC-' || LPAD(next_number::TEXT, 3, '0') INTO new_ticket_number;
    
    RETURN new_ticket_number;
END;
$function$;

-- Create trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS set_ticket_number_trigger ON public.tickets;
CREATE TRIGGER set_ticket_number_trigger
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_ticket_number();

-- Update existing tickets to have ticket numbers if they don't have them
DO $$
DECLARE
    ticket_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR ticket_record IN 
        SELECT id FROM public.tickets 
        WHERE ticket_number IS NULL 
        ORDER BY created_at
    LOOP
        UPDATE public.tickets 
        SET ticket_number = 'TIC-' || LPAD(counter::TEXT, 3, '0')
        WHERE id = ticket_record.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Update ticket status values to match the new system
UPDATE public.tickets SET status = 'New' WHERE status = 'open';
UPDATE public.tickets SET status = 'Processing' WHERE status = 'in_progress';
UPDATE public.tickets SET status = 'Resolved' WHERE status = 'resolved' OR status = 'closed';
