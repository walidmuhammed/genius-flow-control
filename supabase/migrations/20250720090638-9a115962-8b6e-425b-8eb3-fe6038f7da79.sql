-- Add RLS policies for pricing_global table to allow only admins to Insert, Update, and Delete

CREATE POLICY "Only admins can insert global pricing"
ON public.pricing_global
FOR INSERT
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update global pricing"
ON public.pricing_global
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete global pricing"
ON public.pricing_global
FOR DELETE
USING (is_admin());