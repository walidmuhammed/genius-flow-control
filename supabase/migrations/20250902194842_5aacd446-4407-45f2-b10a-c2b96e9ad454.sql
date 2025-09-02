-- Phase 1: Fix Database Flow & Logic (Fixed Version)

-- Step 1: Drop dependent trigger first, then function
DROP TRIGGER IF EXISTS create_client_payout_on_completion ON orders;
DROP FUNCTION IF EXISTS public.create_client_payout_entry() CASCADE;

-- Step 2: Enhanced settlement-to-payouts integration
-- This trigger creates client payouts when settlements are marked as paid
CREATE OR REPLACE FUNCTION public.create_client_payouts_from_settlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
              AND o.status IN ('Delivered', 'Unsuccessful') -- Only for completed orders
        LOOP
            -- Insert into client_payouts if not already exists
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
            ) ON CONFLICT (order_id) DO NOTHING; -- Prevent duplicates
            
        END LOOP;
        
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recreate the trigger for settlement payouts
DROP TRIGGER IF EXISTS create_client_payouts_on_settlement_paid ON courier_settlements;
CREATE TRIGGER create_client_payouts_on_settlement_paid
    AFTER UPDATE ON courier_settlements
    FOR EACH ROW
    EXECUTE FUNCTION public.create_client_payouts_from_settlement();

-- Step 3: Update order status management for proper settlement flow
CREATE OR REPLACE FUNCTION public.update_order_settlement_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path TO 'public'
AS $function$
BEGIN
    -- When order status changes to Delivered or Unsuccessful
    -- Mark it as ready for settlement (if not already settled)
    IF NEW.status IN ('Delivered', 'Unsuccessful') 
       AND (OLD.status IS NULL OR OLD.status NOT IN ('Delivered', 'Unsuccessful'))
       AND NEW.courier_id IS NOT NULL
       AND NEW.courier_settlement_id IS NULL THEN
        
        -- Mark as ready for settlement
        NEW.courier_settlement_status := 'Pending Settlement';
        
        -- Ensure courier fees are set
        IF NEW.courier_fee_usd IS NULL OR NEW.courier_fee_lbp IS NULL THEN
            -- Calculate courier fees if not already set
            SELECT fee_usd, fee_lbp INTO NEW.courier_fee_usd, NEW.courier_fee_lbp
            FROM public.calculate_courier_fee(
                NEW.courier_id,
                COALESCE(NEW.package_type, 'parcel'),
                (SELECT governorate_id FROM public.customers WHERE id = NEW.customer_id),
                NEW.status
            );
            
            -- Fallback to defaults if calculation fails
            NEW.courier_fee_usd := COALESCE(NEW.courier_fee_usd, 2);
            NEW.courier_fee_lbp := COALESCE(NEW.courier_fee_lbp, 75000);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for order settlement status management
DROP TRIGGER IF EXISTS update_order_settlement_status_trigger ON orders;
CREATE TRIGGER update_order_settlement_status_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_settlement_status();

-- Step 4: Clean up existing incorrect client payouts
-- Remove client payouts that were created before proper settlement flow
DELETE FROM public.client_payouts 
WHERE order_id IN (
    SELECT o.id FROM public.orders o
    WHERE o.courier_settlement_id IS NULL 
    AND o.status IN ('Delivered', 'Unsuccessful')
);