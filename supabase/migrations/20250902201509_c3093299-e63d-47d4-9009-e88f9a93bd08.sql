-- Fix courier settlements direction values and add client_payouts unique constraint

-- 1. First update existing records with wrong direction values
UPDATE public.courier_settlements 
SET direction = CASE 
    WHEN direction = 'Owe Courier' THEN 'admin_to_courier'
    WHEN direction = 'Courier Owes' THEN 'courier_to_admin'
    ELSE direction
END
WHERE direction IN ('Owe Courier', 'Courier Owes');

-- 2. Add unique constraint on client_payouts.order_id to fix ON CONFLICT issue
ALTER TABLE public.client_payouts 
ADD CONSTRAINT client_payouts_order_id_unique UNIQUE (order_id);

-- 3. Update the trigger function to properly handle the constraint
CREATE OR REPLACE FUNCTION public.create_client_payouts_from_settlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    settlement_order RECORD;
BEGIN
    -- Only proceed if settlement is being marked as paid
    IF NEW.status = 'Paid' AND (OLD.status IS NULL OR OLD.status != 'Paid') THEN
        
        -- Create client payout entries for each order in the settlement
        FOR settlement_order IN 
            SELECT o.id, o.client_id, o.collected_amount_usd, o.collected_amount_lbp,
                   o.delivery_fees_usd, o.delivery_fees_lbp, o.courier_fee_usd, o.courier_fee_lbp
            FROM public.orders o
            WHERE o.courier_settlement_id = NEW.id
              AND o.status IN ('Successful', 'Unsuccessful') -- Only for completed orders
        LOOP
            -- Insert into client_payouts with proper conflict handling
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
                settlement_order.id,
                settlement_order.client_id,
                COALESCE(settlement_order.collected_amount_usd, 0),
                COALESCE(settlement_order.collected_amount_lbp, 0),
                COALESCE(settlement_order.delivery_fees_usd, 0),
                COALESCE(settlement_order.delivery_fees_lbp, 0),
                COALESCE(settlement_order.collected_amount_usd, 0) - COALESCE(settlement_order.delivery_fees_usd, 0),
                COALESCE(settlement_order.collected_amount_lbp, 0) - COALESCE(settlement_order.delivery_fees_lbp, 0),
                'Pending',
                auth.uid()
            ) 
            ON CONFLICT (order_id) 
            DO UPDATE SET
                collected_amount_usd = EXCLUDED.collected_amount_usd,
                collected_amount_lbp = EXCLUDED.collected_amount_lbp,
                delivery_fee_usd = EXCLUDED.delivery_fee_usd,
                delivery_fee_lbp = EXCLUDED.delivery_fee_lbp,
                net_payout_usd = EXCLUDED.net_payout_usd,
                net_payout_lbp = EXCLUDED.net_payout_lbp,
                updated_at = now();
            
        END LOOP;
        
    END IF;
    
    RETURN NEW;
END;
$function$;