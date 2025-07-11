-- Phase 1: Fix Critical Privilege Escalation Vulnerability (Corrected)

-- Step 1: Create security definer function to safely check if user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$;

-- Step 2: Create function to safely update user roles (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can update user roles
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can update user roles';
  END IF;
  
  -- Validate role value
  IF new_role NOT IN ('client', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: must be either client or admin';
  END IF;
  
  -- Update the user role
  UPDATE public.profiles 
  SET user_type = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the role change for security audit
  INSERT INTO public.activity_logs (entity_type, entity_id, action, details, performed_by)
  VALUES (
    'profiles',
    target_user_id,
    'role_changed',
    jsonb_build_object('new_role', new_role, 'changed_by', auth.uid()),
    auth.uid()::text
  );
  
  RETURN FOUND;
END;
$$;

-- Step 3: Drop existing problematic policies that allow users to modify their own user_type
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Step 4: Create secure RLS policies
-- Users can view their own profile and admins can view all
CREATE POLICY "profiles_select_secure" 
ON public.profiles 
FOR SELECT 
USING (public.is_current_user_admin() OR id = auth.uid());

-- Users can only update their own profile EXCEPT user_type field
CREATE POLICY "profiles_update_secure" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND 
  (OLD.user_type = NEW.user_type OR public.is_current_user_admin())
);

-- Only authenticated users can insert their own profile
CREATE POLICY "profiles_insert_secure" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Step 5: Add input validation constraints
-- Add length constraints for security
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS full_name_length CHECK (length(full_name) <= 100),
ADD CONSTRAINT IF NOT EXISTS phone_length CHECK (length(phone) <= 20),
ADD CONSTRAINT IF NOT EXISTS business_name_length CHECK (length(business_name) <= 200),
ADD CONSTRAINT IF NOT EXISTS business_type_length CHECK (length(business_type) <= 100);

-- Add validation for user_type
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS valid_user_type CHECK (user_type IN ('client', 'admin'));

-- Step 6: Add similar validation to other critical tables
ALTER TABLE public.customers
ADD CONSTRAINT IF NOT EXISTS customer_name_length CHECK (length(name) <= 100),
ADD CONSTRAINT IF NOT EXISTS customer_phone_length CHECK (length(phone) <= 20),
ADD CONSTRAINT IF NOT EXISTS customer_address_length CHECK (length(address) <= 500);

ALTER TABLE public.orders
ADD CONSTRAINT IF NOT EXISTS package_description_length CHECK (length(package_description) <= 1000),
ADD CONSTRAINT IF NOT EXISTS order_note_length CHECK (length(note) <= 1000);

-- Step 7: Create audit function for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.activity_logs (entity_type, entity_id, action, details, performed_by)
  VALUES (
    'security',
    COALESCE(entity_id, auth.uid()),
    event_type,
    details || jsonb_build_object('timestamp', now(), 'user_id', auth.uid()),
    COALESCE(auth.uid()::text, 'system')
  );
END;
$$;