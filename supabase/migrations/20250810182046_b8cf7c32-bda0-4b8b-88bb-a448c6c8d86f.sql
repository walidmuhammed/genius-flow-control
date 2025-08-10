-- Standardize pickup status values to lowercase
UPDATE public.pickups 
SET status = LOWER(status), updated_at = now()
WHERE status != LOWER(status);

-- Specifically ensure 'In Progress' becomes 'in progress'
UPDATE public.pickups 
SET status = 'in progress', updated_at = now()
WHERE status = 'In Progress';