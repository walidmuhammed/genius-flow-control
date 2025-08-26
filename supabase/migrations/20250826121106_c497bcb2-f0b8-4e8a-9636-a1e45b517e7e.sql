-- Fix search path for log_customer_change function
CREATE OR REPLACE FUNCTION public.log_customer_change(
  p_customer_id UUID,
  p_field_name TEXT,
  p_old_value TEXT,
  p_new_value TEXT,
  p_change_reason TEXT DEFAULT 'user_edit'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.customer_history (
    customer_id,
    field_name,
    old_value,
    new_value,
    changed_by,
    change_reason
  )
  VALUES (
    p_customer_id,
    p_field_name,
    p_old_value,
    p_new_value,
    auth.uid(),
    p_change_reason
  );
END;
$$;