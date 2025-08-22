-- Fix the ambiguous column reference in generate_sequential_invoice_id function
CREATE OR REPLACE FUNCTION public.generate_sequential_invoice_id(p_company_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_next_number INTEGER;
    v_new_invoice_id TEXT;
BEGIN
    -- Lock the counter row and get next number atomically
    UPDATE public.invoice_counters 
    SET next_number = public.invoice_counters.next_number + 1,
        updated_at = now()
    WHERE company_id = p_company_id
    RETURNING public.invoice_counters.next_number - 1 INTO v_next_number;
    
    -- If no counter exists, create one
    IF v_next_number IS NULL THEN
        INSERT INTO public.invoice_counters (company_id, next_number)
        VALUES (p_company_id, 2)
        ON CONFLICT (company_id) DO UPDATE SET next_number = invoice_counters.next_number + 1;
        v_next_number := 1;
    END IF;
    
    -- Format as INV-XXX (3 digits with leading zeros)
    v_new_invoice_id := 'INV-' || LPAD(v_next_number::TEXT, 3, '0');
    
    RETURN v_new_invoice_id;
END;
$$;