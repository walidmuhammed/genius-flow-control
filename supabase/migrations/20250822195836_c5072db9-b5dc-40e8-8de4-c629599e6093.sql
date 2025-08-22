-- Fix security warnings by adding proper search_path to functions

-- Fix generate_sequential_invoice_id function
CREATE OR REPLACE FUNCTION public.generate_sequential_invoice_id(p_company_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    next_number INTEGER;
    new_invoice_id TEXT;
BEGIN
    -- Lock the counter row and get next number atomically
    UPDATE public.invoice_counters 
    SET next_number = next_number + 1,
        updated_at = now()
    WHERE company_id = p_company_id
    RETURNING next_number - 1 INTO next_number;
    
    -- If no counter exists, create one
    IF next_number IS NULL THEN
        INSERT INTO public.invoice_counters (company_id, next_number)
        VALUES (p_company_id, 2)
        ON CONFLICT (company_id) DO UPDATE SET next_number = invoice_counters.next_number + 1;
        next_number := 1;
    END IF;
    
    -- Format as INV-XXX (3 digits with leading zeros)
    new_invoice_id := 'INV-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN new_invoice_id;
END;
$$;

-- Fix set_sequential_invoice_id function
CREATE OR REPLACE FUNCTION public.set_sequential_invoice_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.invoice_id IS NULL THEN
        NEW.invoice_id := public.generate_sequential_invoice_id();
    END IF;
    RETURN NEW;
END;
$$;