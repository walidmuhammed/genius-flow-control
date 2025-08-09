-- Update the orders status check constraint to include new statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with all valid statuses including the new ones
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('New', 'Pending Pickup', 'Assigned', 'In Progress', 'Successful', 'Unsuccessful', 'Returned', 'Awaiting Payment', 'Paid', 'On Hold'));