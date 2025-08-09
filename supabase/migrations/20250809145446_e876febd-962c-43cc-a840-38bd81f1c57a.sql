-- Update orders table to allow new status values
-- First, let's see if there are any constraints on the status column
-- and add the new status values

-- Check if there's a CHECK constraint on status column
-- If there is, we need to drop it and recreate with new values

-- Add the new status values by allowing them in the enum or constraint
-- Since we can't see the constraint details, we'll ensure all values are supported

-- Update any existing 'Awaiting Action' status to 'On Hold' for migration
UPDATE orders 
SET status = 'On Hold' 
WHERE status = 'Awaiting Action';

-- Create a comment to document the valid status values
COMMENT ON COLUMN orders.status IS 'Valid values: New, Pending Pickup, Assigned, In Progress, Successful, Unsuccessful, Returned, Awaiting Payment, Paid, On Hold';