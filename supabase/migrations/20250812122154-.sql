-- Add RLS policy to allow couriers to view orders assigned to them
CREATE POLICY "Couriers can view their assigned orders" 
ON public.orders 
FOR SELECT 
USING (courier_id = auth.uid());