-- Fix courier settlements schema and add triggers for automatic fee calculation
-- First drop existing triggers to avoid dependency issues

-- Drop existing triggers first
DROP TRIGGER IF EXISTS set_settlement_id_trigger ON courier_settlements;
DROP TRIGGER IF EXISTS trigger_set_settlement_id ON courier_settlements;
DROP TRIGGER IF EXISTS set_settlement_id ON courier_settlements;

-- Now drop the functions
DROP FUNCTION IF EXISTS generate_settlement_id CASCADE;
DROP FUNCTION IF EXISTS set_settlement_id CASCADE;

-- Create a more robust settlement ID generator
CREATE OR REPLACE FUNCTION generate_settlement_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    next_number INTEGER;
    new_settlement_id TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    LOOP
        -- Use advisory lock to prevent race conditions
        PERFORM pg_advisory_lock(54321);
        
        BEGIN
            -- Get the next sequential number
            SELECT COALESCE(MAX(CAST(SUBSTRING(settlement_id FROM 5) AS INTEGER)), 0) + 1
            INTO next_number
            FROM public.courier_settlements
            WHERE settlement_id IS NOT NULL 
            AND settlement_id != ''
            AND settlement_id ~ '^CST-[0-9]+$';
            
            -- Format as CST-XXX (3 digits with leading zeros)
            new_settlement_id := 'CST-' || LPAD(next_number::TEXT, 3, '0');
            
            -- Check if this ID already exists
            IF NOT EXISTS (SELECT 1 FROM public.courier_settlements WHERE settlement_id = new_settlement_id) THEN
                PERFORM pg_advisory_unlock(54321);
                RETURN new_settlement_id;
            END IF;
            
            PERFORM pg_advisory_unlock(54321);
        EXCEPTION WHEN OTHERS THEN
            PERFORM pg_advisory_unlock(54321);
            RAISE;
        END;
        
        -- Increment attempt counter and exit if too many attempts
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique settlement ID after % attempts', max_attempts;
        END IF;
        
        -- Small delay before retrying
        PERFORM pg_sleep(0.001);
    END LOOP;
END;
$$;

-- Create trigger function to set settlement ID
CREATE OR REPLACE FUNCTION set_settlement_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.settlement_id IS NULL OR NEW.settlement_id = '' THEN
        NEW.settlement_id := public.generate_settlement_id();
    END IF;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER set_settlement_id_trigger
    BEFORE INSERT ON public.courier_settlements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_settlement_id();

-- Add function to automatically calculate courier fees when order status changes
CREATE OR REPLACE FUNCTION calculate_and_set_courier_fee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    calculated_fees RECORD;
BEGIN
    -- Only calculate fees when order is marked as Delivered or Unsuccessful
    -- and courier_fee fields are not already set
    IF NEW.status IN ('Delivered', 'Unsuccessful') 
       AND NEW.courier_id IS NOT NULL
       AND (OLD.status IS NULL OR OLD.status NOT IN ('Delivered', 'Unsuccessful'))
       AND (NEW.courier_fee_usd IS NULL OR NEW.courier_fee_lbp IS NULL) THEN
        
        -- Calculate courier fee using the pricing function if it exists
        BEGIN
            SELECT fee_usd, fee_lbp INTO calculated_fees
            FROM public.calculate_courier_fee(
                NEW.courier_id,
                COALESCE(NEW.package_type, 'parcel'),
                (SELECT governorate_id FROM customers WHERE id = NEW.customer_id),
                NEW.status
            );
        EXCEPTION WHEN OTHERS THEN
            -- Fallback to default values if function fails
            calculated_fees.fee_usd := 2;
            calculated_fees.fee_lbp := 75000;
        END;
        
        -- Set the calculated fees
        NEW.courier_fee_usd := COALESCE(calculated_fees.fee_usd, 2);
        NEW.courier_fee_lbp := COALESCE(calculated_fees.fee_lbp, 75000);
        
        -- Set courier settlement status
        NEW.courier_settlement_status := 'None';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic courier fee calculation
DROP TRIGGER IF EXISTS calculate_courier_fee_trigger ON orders;
CREATE TRIGGER calculate_courier_fee_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_and_set_courier_fee();

-- Add function to create client payouts when settlement is marked paid
CREATE OR REPLACE FUNCTION create_client_payouts_from_settlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    settlement_order RECORD;
BEGIN
    -- Only proceed if settlement is being marked as paid
    IF NEW.status = 'Paid' AND (OLD.status IS NULL OR OLD.status != 'Paid') THEN
        
        -- Create client payout entries for each order in the settlement
        FOR settlement_order IN 
            SELECT o.id, o.client_id, o.collected_amount_usd, o.collected_amount_lbp,
                   o.delivery_fees_usd, o.delivery_fees_lbp
            FROM orders o
            WHERE o.courier_settlement_id = NEW.id
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
            ) ON CONFLICT (order_id) DO NOTHING; -- Avoid duplicates
            
        END LOOP;
        
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for client payout creation
DROP TRIGGER IF EXISTS create_client_payouts_trigger ON courier_settlements;
CREATE TRIGGER create_client_payouts_trigger
    AFTER UPDATE ON public.courier_settlements
    FOR EACH ROW
    EXECUTE FUNCTION public.create_client_payouts_from_settlement();

-- Backfill courier fees for existing delivered/unsuccessful orders
UPDATE public.orders 
SET courier_fee_usd = 2, courier_fee_lbp = 75000, courier_settlement_status = 'None'
WHERE status IN ('Delivered', 'Unsuccessful') 
AND courier_id IS NOT NULL 
AND (courier_fee_usd IS NULL OR courier_fee_lbp IS NULL);

-- Ensure courier_settlement_status enum values are consistent
UPDATE public.orders 
SET courier_settlement_status = 'None'
WHERE courier_settlement_status IS NULL;

-- Ensure cash_handover_status enum values are consistent  
UPDATE public.orders 
SET cash_handover_status = 'None'
WHERE cash_handover_status IS NULL;