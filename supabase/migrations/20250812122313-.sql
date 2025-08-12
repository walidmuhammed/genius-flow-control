-- Add RLS policy to allow couriers to update orders assigned to them
CREATE POLICY "Couriers can update their assigned orders" 
ON public.orders 
FOR UPDATE 
USING (courier_id = auth.uid())
WITH CHECK (courier_id = auth.uid());