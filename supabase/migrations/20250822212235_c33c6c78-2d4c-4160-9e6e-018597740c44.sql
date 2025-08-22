-- Update the client payout entry creation function to handle unsuccessful orders correctly
CREATE OR REPLACE FUNCTION public.create_client_payout_entry()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_collected_usd NUMERIC := 0;
  v_collected_lbp NUMERIC := 0;
  v_delivery_usd NUMERIC := 0;
  v_delivery_lbp NUMERIC := 0;
  v_net_payout_usd NUMERIC := 0;
  v_net_payout_lbp NUMERIC := 0;
BEGIN
  -- Only create payout entry when status changes to Successful or Unsuccessful
  IF NEW.status IN ('Successful', 'Unsuccessful') AND (OLD.status IS NULL OR OLD.status NOT IN ('Successful', 'Unsuccessful')) THEN
    
    -- Get amounts with proper null handling
    v_collected_usd := COALESCE(NEW.collected_amount_usd, 0);
    v_collected_lbp := COALESCE(NEW.collected_amount_lbp, 0);
    v_delivery_usd := COALESCE(NEW.delivery_fees_usd, 0);
    v_delivery_lbp := COALESCE(NEW.delivery_fees_lbp, 0);
    
    -- Calculate net payout based on order status
    IF NEW.status = 'Successful' THEN
      -- For successful orders: net payout = collected amount - delivery fee
      v_net_payout_usd := v_collected_usd - v_delivery_usd;
      v_net_payout_lbp := v_collected_lbp - v_delivery_lbp;
    ELSIF NEW.status = 'Unsuccessful' THEN
      -- For unsuccessful orders: net payout = collected amount (partial payment) - delivery fee
      -- This results in negative amounts when no collection, or less negative when partial payment
      v_net_payout_usd := v_collected_usd - v_delivery_usd;
      v_net_payout_lbp := v_collected_lbp - v_delivery_lbp;
    END IF;
    
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
      v_collected_usd,
      v_collected_lbp,
      v_delivery_usd,
      v_delivery_lbp,
      v_net_payout_usd,
      v_net_payout_lbp,
      'Pending',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;