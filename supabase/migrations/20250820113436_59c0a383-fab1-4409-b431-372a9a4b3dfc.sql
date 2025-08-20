-- Add new fields to orders table for delivery completion tracking
ALTER TABLE public.orders 
ADD COLUMN collected_amount_usd NUMERIC DEFAULT 0,
ADD COLUMN collected_amount_lbp NUMERIC DEFAULT 0,
ADD COLUMN collected_currency TEXT,
ADD COLUMN unsuccessful_reason TEXT,
ADD COLUMN delivery_photo_url TEXT,
ADD COLUMN collection_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN payout_status TEXT DEFAULT 'Pending' CHECK (payout_status IN ('Pending', 'In Progress', 'Paid'));

-- Create client_payouts table for tracking payouts to clients
CREATE TABLE public.client_payouts (
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

-- Enable RLS on client_payouts table
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

-- Create trigger to update timestamps
CREATE TRIGGER update_client_payouts_updated_at
BEFORE UPDATE ON public.client_payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Create function to automatically create client payout entries
CREATE OR REPLACE FUNCTION public.create_client_payout_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create payout entry when status changes to Successful or Unsuccessful
  IF NEW.status IN ('Successful', 'Unsuccessful') AND (OLD.status IS NULL OR OLD.status NOT IN ('Successful', 'Unsuccessful')) THEN
    INSERT INTO public.client_payouts (
      order_id,
      client_id,
      collected_amount_usd,
      collected_amount_lbp,
      delivery_fee_usd,
      delivery_fee_lbp,
      net_payout_usd,
      net_payout_lbp,
      payout_status,
      created_by
    ) VALUES (
      NEW.id,
      NEW.client_id,
      COALESCE(NEW.collected_amount_usd, 0),
      COALESCE(NEW.collected_amount_lbp, 0),
      COALESCE(NEW.delivery_fees_usd, 0),
      COALESCE(NEW.delivery_fees_lbp, 0),
      COALESCE(NEW.collected_amount_usd, 0) - COALESCE(NEW.delivery_fees_usd, 0),
      COALESCE(NEW.collected_amount_lbp, 0) - COALESCE(NEW.delivery_fees_lbp, 0),
      'Pending',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;