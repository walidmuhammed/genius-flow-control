-- Add RLS policy to allow couriers to view pickups assigned to them
CREATE POLICY "Couriers can view their assigned pickups" 
ON public.pickups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'courier' 
    AND profiles.full_name = pickups.courier_name
  )
);