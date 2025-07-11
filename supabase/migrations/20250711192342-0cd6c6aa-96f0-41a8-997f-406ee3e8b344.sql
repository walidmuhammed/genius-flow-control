-- Step 1: Remove conflicting RLS policies that bypass tenant isolation
DROP POLICY IF EXISTS "Allow full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow full access to pickups" ON public.pickups; 
DROP POLICY IF EXISTS "Allow full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;

-- Step 2: Add proper customer isolation by client (customers need to be linked to the client who created them)
-- Add created_by column to customers table if it doesn't exist
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Step 3: Update existing customers to link to the first client user (temporary fix for existing data)
-- Update customers that don't have created_by set
UPDATE public.customers 
SET created_by = (
  SELECT id FROM public.profiles 
  WHERE user_type = 'client' 
  ORDER BY created_at 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Step 4: Create proper customer isolation policies
CREATE POLICY "Customers belong to the client who created them" 
ON public.customers 
FOR ALL 
USING (is_admin() OR (created_by = auth.uid() AND created_by IS NOT NULL))
WITH CHECK (is_admin() OR (auth.uid() IS NOT NULL));

-- Step 5: Ensure invoices are properly linked to clients 
-- Update existing invoices to link to client users
UPDATE public.invoices 
SET created_by = (
  SELECT client_id FROM public.orders 
  WHERE orders.invoice_id = invoices.id 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Step 6: Add trigger to auto-set created_by for customers
CREATE OR REPLACE FUNCTION public.set_customer_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER customers_set_created_by
  BEFORE INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_customer_created_by();