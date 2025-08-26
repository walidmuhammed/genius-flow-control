-- Create customer history table to track all changes
CREATE TABLE public.customer_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_reason TEXT DEFAULT 'user_edit'
);

-- Enable Row Level Security
ALTER TABLE public.customer_history ENABLE ROW LEVEL SECURITY;

-- Create policies for customer history
CREATE POLICY "Users can view their customer history" 
ON public.customer_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = customer_history.customer_id 
    AND customers.created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert their customer history" 
ON public.customer_history 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = customer_history.customer_id 
    AND customers.created_by = auth.uid()
  ) AND changed_by = auth.uid()
);

-- Admins can view all customer history
CREATE POLICY "Admins can view all customer history" 
ON public.customer_history 
FOR SELECT 
USING (is_admin());

-- Create index for performance
CREATE INDEX idx_customer_history_customer_id ON public.customer_history(customer_id);

-- Create function to log customer changes
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