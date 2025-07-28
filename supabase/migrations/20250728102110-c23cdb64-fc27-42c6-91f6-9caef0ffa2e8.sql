-- Add foreign key constraint from tickets.created_by to profiles.id
-- First, ensure all existing tickets have valid created_by references
UPDATE tickets 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM profiles);

-- Add the foreign key constraint
ALTER TABLE tickets 
ADD CONSTRAINT tickets_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id) 
ON DELETE SET NULL;