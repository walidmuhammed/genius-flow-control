-- Add status field to invoices table
ALTER TABLE public.invoices 
ADD COLUMN status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Paid'));

-- Update invoice ID generation to use sequential format
CREATE OR REPLACE FUNCTION public.generate_invoice_id()
RETURNS text
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
    next_number INTEGER;
    new_invoice_id TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_id FROM 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_id IS NOT NULL AND invoice_id ~ '^#[0-9]+$';
    
    -- Format as #XXX (3 digits with leading zeros)
    SELECT '#' || LPAD(next_number::TEXT, 3, '0') INTO new_invoice_id;
    
    RETURN new_invoice_id;
END;
$function$;