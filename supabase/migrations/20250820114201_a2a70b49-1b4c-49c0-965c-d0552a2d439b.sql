-- Check if client_payouts table exists, if not create it
CREATE TABLE IF NOT EXISTS public.client_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  collected_amount_usd NUMERIC DEFAULT 0,
  collected_amount_lbp NUMERIC DEFAULT 0,
  delivery_fee_usd NUMERIC DEFAULT 0,
  delivery_fee_lbp NUMERIC DEFAULT 0,
  net_payout_usd NUMERIC DEFAULT 0,
  net_payout_lbp NUMERIC DEFAULT 0,
  payout_status TEXT DEFAULT 'Pending' CHECK (payout_status IN ('Pending', 'In Progress', 'Paid')),
  invoice_id UUID REFERENCES public.invoices(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on client_payouts table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_payouts') THEN
    ALTER TABLE public.client_payouts ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies for client_payouts
    CREATE POLICY "Admins can manage all client payouts" 
    ON public.client_payouts 
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());

    CREATE POLICY "Clients can view their own payouts" 
    ON public.client_payouts 
    FOR SELECT 
    USING (client_id = auth.uid());
  END IF;
END $$;