-- Ensure there is at least one global pricing record
INSERT INTO public.pricing_global (default_fee_usd, default_fee_lbp)
SELECT 4.00, 150000
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_global);

-- Add a unique constraint to ensure only one global pricing record (optional but recommended)
-- Note: We can't add this constraint if there are multiple records, so we'll just ensure one exists