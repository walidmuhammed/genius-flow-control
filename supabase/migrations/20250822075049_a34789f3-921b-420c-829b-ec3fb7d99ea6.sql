-- Add RLS policies for client invoice visibility
CREATE POLICY "Clients can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.invoice_orders io
    JOIN public.orders o ON io.order_id = o.id
    WHERE io.invoice_id = invoices.id 
    AND o.client_id = auth.uid()
  )
);