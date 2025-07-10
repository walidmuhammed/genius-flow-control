
-- 1. Create the couriers table
CREATE TABLE public.couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add 'created_by', 'reason_unsuccessful', 'courier_id', 'invoice_id' columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS reason_unsuccessful TEXT,
  ADD COLUMN IF NOT EXISTS courier_id UUID,
  ADD COLUMN IF NOT EXISTS invoice_id UUID;

-- 3. Add FK to couriers from orders
ALTER TABLE public.orders
  ADD CONSTRAINT orders_courier_id_fk
    FOREIGN KEY (courier_id) REFERENCES public.couriers(id);

-- 4. Add FK to profiles from orders.created_by
ALTER TABLE public.orders
  ADD CONSTRAINT orders_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- 5. Add FK to invoices from orders.invoice_id
ALTER TABLE public.orders
  ADD CONSTRAINT orders_invoice_id_fk
    FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);

-- 6. (For extension:) You may later populate courier_id and created_by as needed, based on new UI fields and user logic.
