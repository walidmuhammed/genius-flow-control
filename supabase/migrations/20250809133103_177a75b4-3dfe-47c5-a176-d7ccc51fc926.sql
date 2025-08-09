-- Update profiles table to support courier user type
ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'courier';

-- Alternatively, if the enum doesn't exist, modify the check constraint
-- This assumes the user_type column uses a check constraint instead of an enum
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('client', 'admin', 'courier'));