-- Complete invoice system reset - correct foreign key handling order
-- First, reset order statuses that were linked to invoices
UPDATE public.orders 
SET 
  invoice_id = NULL,
  payment_status = 'pending',
  updated_at = now()
WHERE invoice_id IS NOT NULL;

-- Update client payouts to remove invoice references
UPDATE public.client_payouts 
SET invoice_id = NULL
WHERE invoice_id IS NOT NULL;

-- Now delete all existing invoice data (no more foreign key constraints)
DELETE FROM public.invoice_items;
DELETE FROM public.invoice_orders;
DELETE FROM public.invoices;

-- Reset invoice counter to start fresh
DELETE FROM public.invoice_counters;
INSERT INTO public.invoice_counters (company_id, next_number) 
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 1);