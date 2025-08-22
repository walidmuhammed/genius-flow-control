-- Complete invoice system reset
-- Delete all existing invoice data
DELETE FROM public.invoice_items;
DELETE FROM public.invoice_orders;
DELETE FROM public.invoices;

-- Reset invoice counter to start fresh
DELETE FROM public.invoice_counters;
INSERT INTO public.invoice_counters (company_id, next_number) 
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 1);

-- Reset order statuses that were linked to invoices
UPDATE public.orders 
SET 
  invoice_id = NULL,
  payment_status = 'pending',
  updated_at = now()
WHERE invoice_id IS NOT NULL;