-- Add pricing_source column to orders table to track which pricing rule was used
ALTER TABLE public.orders 
ADD COLUMN pricing_source TEXT;