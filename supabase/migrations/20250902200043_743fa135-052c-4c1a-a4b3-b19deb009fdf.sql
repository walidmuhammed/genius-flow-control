-- Fix courier settlement status handling - align with existing data

-- Drop existing trigger first
DROP TRIGGER IF EXISTS update_order_settlement_status_trigger ON public.orders;
DROP FUNCTION IF EXISTS public.update_order_settlement_status();

-- Update the check constraint to match existing values in the database
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_courier_settlement_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_courier_settlement_status_check 
    CHECK (courier_settlement_status IN ('None', 'Pending', 'Settled'));

-- Fix existing orders that have 'Successful' status but haven't been marked for settlement
UPDATE public.orders 
SET courier_settlement_status = 'Pending'
WHERE status = 'Successful' 
  AND courier_id IS NOT NULL
  AND courier_settlement_id IS NULL
  AND courier_settlement_status = 'None';

-- Ensure courier fees are set for existing orders that need settlement
UPDATE public.orders 
SET 
  courier_fee_usd = COALESCE(courier_fee_usd, 2),
  courier_fee_lbp = COALESCE(courier_fee_lbp, 75000)
WHERE status IN ('Successful', 'Unsuccessful')
  AND courier_id IS NOT NULL
  AND courier_settlement_status = 'Pending'
  AND (courier_fee_usd IS NULL OR courier_fee_lbp IS NULL);

-- Recreate the trigger function with correct status check
CREATE OR REPLACE FUNCTION public.update_order_settlement_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- When order status changes to Successful or Unsuccessful
    -- Mark it as ready for settlement (if not already settled)
    IF NEW.status IN ('Successful', 'Unsuccessful') 
       AND (OLD.status IS NULL OR OLD.status NOT IN ('Successful', 'Unsuccessful'))
       AND NEW.courier_id IS NOT NULL
       AND NEW.courier_settlement_id IS NULL THEN
        
        -- Mark as ready for settlement using 'Pending' to match existing data
        NEW.courier_settlement_status := 'Pending';
        
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

-- Recreate the trigger
CREATE TRIGGER update_order_settlement_status_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_settlement_status();