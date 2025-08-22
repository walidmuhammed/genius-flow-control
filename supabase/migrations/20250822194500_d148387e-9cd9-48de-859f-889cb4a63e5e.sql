-- Phase 1: Add 'paid' status to orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('New', 'Assigned', 'In Progress', 'Successful', 'Unsuccessful', 'On Hold', 'paid'));

-- Phase 2: Fix Invoice ID Generation - Update function to use INV-XXX format
CREATE OR REPLACE FUNCTION public.generate_invoice_id()
RETURNS text
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
    next_number INTEGER;
    new_invoice_id TEXT;
BEGIN
    -- Get the next sequential number for INV- format
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_id FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_id IS NOT NULL AND invoice_id ~ '^INV-[0-9]+$';
    
    -- Format as INV-XXX (3 digits with leading zeros)
    SELECT 'INV-' || LPAD(next_number::TEXT, 3, '0') INTO new_invoice_id;
    
    RETURN new_invoice_id;
END;
$function$;