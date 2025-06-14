
-- Add archived field to orders table to support soft delete
ALTER TABLE public.orders 
ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Add edited field to track if order has been modified
ALTER TABLE public.orders 
ADD COLUMN edited BOOLEAN DEFAULT FALSE;

-- Add edit_history field to track changes made to the order
ALTER TABLE public.orders 
ADD COLUMN edit_history JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance on archived orders
CREATE INDEX idx_orders_archived ON public.orders(archived);

-- Create index for better query performance on status and archived combination
CREATE INDEX idx_orders_status_archived ON public.orders(status, archived);
