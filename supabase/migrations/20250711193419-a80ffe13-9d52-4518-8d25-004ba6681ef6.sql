-- Phase 1: Fix Critical Privilege Escalation Vulnerability

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

-- Step 5: Add trigger to prevent direct user_type changes
CREATE OR REPLACE FUNCTION public.prevent_user_type_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if admin is making the change
  IF public.is_current_user_admin() THEN
    RETURN NEW;
  END IF;
  
  -- Prevent user_type changes for non-admins
  IF OLD.user_type IS DISTINCT FROM NEW.user_type THEN
    RAISE EXCEPTION 'Access denied: Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_type_change();

-- Step 6: Add input validation constraints
-- Add length constraints for security
ALTER TABLE public.profiles 
ADD CONSTRAINT full_name_length CHECK (length(full_name) <= 100),
ADD CONSTRAINT phone_length CHECK (length(phone) <= 20),
ADD CONSTRAINT business_name_length CHECK (length(business_name) <= 200),
ADD CONSTRAINT business_type_length CHECK (length(business_type) <= 100);

-- Add validation for user_type
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_user_type CHECK (user_type IN ('client', 'admin'));

-- Step 7: Add similar validation to other critical tables
ALTER TABLE public.customers
ADD CONSTRAINT customer_name_length CHECK (length(name) <= 100),
ADD CONSTRAINT customer_phone_length CHECK (length(phone) <= 20),
ADD CONSTRAINT customer_address_length CHECK (length(address) <= 500);

ALTER TABLE public.orders
ADD CONSTRAINT package_description_length CHECK (length(package_description) <= 1000),
ADD CONSTRAINT order_note_length CHECK (length(note) <= 1000);

-- Step 8: Create audit function for security events
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