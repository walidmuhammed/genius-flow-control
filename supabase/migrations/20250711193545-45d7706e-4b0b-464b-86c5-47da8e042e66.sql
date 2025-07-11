-- Step 4: Update RLS policies for secure profile management

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Create secure RLS policies
-- Users can view their own profile and admins can view all
CREATE POLICY "profiles_select_secure" 
ON public.profiles 
FOR SELECT 
USING (public.is_current_user_admin() OR id = auth.uid());

-- Users can only update their own profile (user_type protection handled by trigger)
CREATE POLICY "profiles_update_secure" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only authenticated users can insert their own profile
CREATE POLICY "profiles_insert_secure" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Step 5: Add trigger to prevent unauthorized user_type changes
CREATE OR REPLACE FUNCTION public.prevent_user_type_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if admin is making the change
  IF public.is_current_user_admin() THEN
    RETURN NEW;
  END IF;
  
  -- For non-admins, prevent user_type changes
  IF OLD.user_type IS DISTINCT FROM NEW.user_type THEN
    -- Log the attempt
    PERFORM public.log_security_event(
      'privilege_escalation_attempt',
      NEW.id,
      jsonb_build_object(
        'attempted_role', NEW.user_type,
        'current_role', OLD.user_type,
        'user_id', auth.uid()
      )
    );
    
    RAISE EXCEPTION 'Access denied: Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_type_escalation();