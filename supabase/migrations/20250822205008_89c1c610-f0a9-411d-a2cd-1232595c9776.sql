-- Update RLS policy for clients to view their invoices through invoice_items
DROP POLICY IF EXISTS "Clients can view their own invoices" ON public.invoices;

-- Create new policy using invoice_items table instead of invoice_orders
CREATE POLICY "Clients can view their own invoices through invoice_items" 
ON public.invoices 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM (public.invoice_items ii
    JOIN public.orders o ON ((ii.order_id = o.id)))
  WHERE ((ii.invoice_id = invoices.id) AND (o.client_id = auth.uid()))
));

-- Also ensure invoice_items has proper RLS policies for clients
DROP POLICY IF EXISTS "Clients can view their invoice items" ON public.invoice_items;

CREATE POLICY "Clients can view their invoice items" 
ON public.invoice_items 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM public.orders o
  WHERE ((o.id = invoice_items.order_id) AND (o.client_id = auth.uid()))
));