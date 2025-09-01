-- Ensure orders table has all required fields for courier settlements
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS courier_settlement_status text DEFAULT 'None'::text,
ADD COLUMN IF NOT EXISTS cash_handover_status text DEFAULT 'None'::text;

-- Update existing orders to have proper settlement status
UPDATE public.orders 
SET courier_settlement_status = 'None' 
WHERE courier_settlement_status IS NULL;

UPDATE public.orders 
SET cash_handover_status = 'None' 
WHERE cash_handover_status IS NULL;

-- Ensure courier_settlements table has all required fields
ALTER TABLE public.courier_settlements 
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone DEFAULT NULL;

-- Create unique constraint on settlement_id to prevent duplicates
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'courier_settlements_settlement_id_key' 
        AND table_name = 'courier_settlements'
    ) THEN
        ALTER TABLE public.courier_settlements 
        ADD CONSTRAINT courier_settlements_settlement_id_key UNIQUE (settlement_id);
    END IF;
END $$;

-- Create trigger to auto-generate settlement_id
DROP TRIGGER IF EXISTS trigger_set_settlement_id ON public.courier_settlements;
CREATE TRIGGER trigger_set_settlement_id
    BEFORE INSERT ON public.courier_settlements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_settlement_id();

-- Backfill courier fees for existing delivered/unsuccessful orders without fees
UPDATE public.orders 
SET 
    courier_fee_usd = CASE 
        WHEN package_type = 'Document' THEN 2.0
        WHEN package_type = 'Package' THEN 3.0
        WHEN package_type = 'Heavy' THEN 5.0
        ELSE 2.0
    END,
    courier_fee_lbp = CASE 
        WHEN package_type = 'Document' THEN 75000
        WHEN package_type = 'Package' THEN 100000
        WHEN package_type = 'Heavy' THEN 150000
        ELSE 75000
    END
WHERE status IN ('Delivered', 'Unsuccessful', 'Successful') 
AND (courier_fee_usd IS NULL OR courier_fee_usd = 0)
AND (courier_fee_lbp IS NULL OR courier_fee_lbp = 0);