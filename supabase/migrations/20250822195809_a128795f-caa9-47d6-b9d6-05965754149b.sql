-- Phase 1: Database Structure Corrections

-- Create invoice_counters table for sequential ID generation
CREATE TABLE IF NOT EXISTS public.invoice_counters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  next_number integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS on invoice_counters
ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_counters (admin only)
CREATE POLICY "Only admins can manage invoice counters" 
ON public.invoice_counters 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Create invoice_items table for proper order-to-invoice mapping
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount_collected_usd numeric NOT NULL DEFAULT 0,
  amount_collected_lbp numeric NOT NULL DEFAULT 0,
  delivery_fee_usd numeric NOT NULL DEFAULT 0,
  delivery_fee_lbp numeric NOT NULL DEFAULT 0,
  net_payout_usd numeric NOT NULL DEFAULT 0,
  net_payout_lbp numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(order_id) -- Each order can only be in one invoice
);

-- Enable RLS on invoice_items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_items
CREATE POLICY "Admins can manage all invoice items" 
ON public.invoice_items 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Clients can view their invoice items" 
ON public.invoice_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = invoice_items.order_id 
    AND o.client_id = auth.uid()
  )
);

-- Add missing fields to orders table if they don't exist
DO $$ 
BEGIN
  -- Add payment_status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE public.orders ADD COLUMN payment_status text DEFAULT 'pending';
    
    -- Add constraint for payment_status
    ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN ('pending', 'in_progress', 'paid', 'on_hold'));
  END IF;
END $$;

-- Update the invoice_id foreign key constraint if needed
DO $$
BEGIN
  -- Check if the foreign key exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_invoice_id_fkey' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_invoice_id_fkey 
    FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Initialize invoice counter for the default company
INSERT INTO public.invoice_counters (company_id, next_number) 
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 1)
ON CONFLICT (company_id) DO NOTHING;

-- Update existing invoices to have sequential invoice_id format
DO $$
DECLARE
  invoice_record RECORD;
  counter INTEGER := 1;
BEGIN
  -- Get all existing invoices ordered by created_at
  FOR invoice_record IN 
    SELECT id, created_at 
    FROM public.invoices 
    WHERE invoice_id IS NULL OR invoice_id NOT LIKE 'INV-%'
    ORDER BY created_at ASC
  LOOP
    -- Update with sequential format
    UPDATE public.invoices 
    SET invoice_id = 'INV-' || LPAD(counter::text, 3, '0')
    WHERE id = invoice_record.id;
    
    counter := counter + 1;
  END LOOP;
  
  -- Update the counter to the next available number
  UPDATE public.invoice_counters 
  SET next_number = GREATEST(counter, next_number)
  WHERE company_id = '00000000-0000-0000-0000-000000000000'::uuid;
END $$;

-- Update the generate_invoice_id function to use sequential numbering
CREATE OR REPLACE FUNCTION public.generate_sequential_invoice_id(p_company_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create or replace the trigger to use sequential invoice IDs
DROP TRIGGER IF EXISTS set_invoice_id_trigger ON public.invoices;

CREATE OR REPLACE FUNCTION public.set_sequential_invoice_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
    IF NEW.invoice_id IS NULL THEN
        NEW.invoice_id := public.generate_sequential_invoice_id();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_invoice_id_trigger
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.set_sequential_invoice_id();