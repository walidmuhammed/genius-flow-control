-- Check current constraint on pickups status
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'public.pickups'::regclass 
AND contype = 'c' 
AND conname LIKE '%status%';

-- Update the check constraint to allow lowercase status values
ALTER TABLE public.pickups DROP CONSTRAINT IF EXISTS pickups_status_check;

-- Add new constraint that allows both title case and lowercase
ALTER TABLE public.pickups ADD CONSTRAINT pickups_status_check 
CHECK (status IN ('Scheduled', 'scheduled', 'Assigned', 'assigned', 'In Progress', 'in progress', 'Completed', 'completed', 'Canceled', 'canceled'));

-- Now update existing records to use lowercase
UPDATE public.pickups 
SET status = 'in progress', updated_at = now()
WHERE status = 'In Progress';

UPDATE public.pickups 
SET status = 'scheduled', updated_at = now()
WHERE status = 'Scheduled';

UPDATE public.pickups 
SET status = 'canceled', updated_at = now()
WHERE status = 'Canceled';