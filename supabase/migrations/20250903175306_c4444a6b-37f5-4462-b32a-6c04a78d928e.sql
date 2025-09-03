-- Phase 1: Update courier status constraint to support pending status
ALTER TABLE public.couriers 
DROP CONSTRAINT IF EXISTS couriers_status_check;

ALTER TABLE public.couriers 
ADD CONSTRAINT couriers_status_check 
CHECK (status IN ('pending', 'active', 'inactive', 'suspended'));

-- Update the handle_new_user trigger to properly populate courier records for self-signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, business_name, business_type, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'business_name',
    NEW.raw_user_meta_data ->> 'business_type',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'client')
  );
  
  -- If user type is courier, create comprehensive courier record
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'client') = 'courier' THEN
    INSERT INTO public.couriers (
      id,
      full_name,
      phone,
      email,
      address,
      vehicle_type,
      assigned_zones,
      status,
      avatar_url,
      id_photo_url,
      license_photo_url,
      admin_notes
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.email,
      NEW.raw_user_meta_data ->> 'address',
      COALESCE(NEW.raw_user_meta_data ->> 'vehicle_type', 'motorcycle'),
      COALESCE(
        (NEW.raw_user_meta_data ->> 'assigned_zones')::text[], 
        '{}'::text[]
      ),
      -- Self-registered couriers start as pending, admin-created are active
      CASE 
        WHEN NEW.raw_user_meta_data ->> 'admin_created' = 'true' THEN 'active'
        ELSE 'pending'
      END,
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'id_photo_url',
      NEW.raw_user_meta_data ->> 'license_photo_url',
      NEW.raw_user_meta_data ->> 'admin_notes'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function for admin to create courier with auth credentials
CREATE OR REPLACE FUNCTION public.admin_create_courier_with_auth(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text DEFAULT NULL,
  p_vehicle_type text DEFAULT 'motorcycle',
  p_address text DEFAULT NULL,
  p_assigned_zones text[] DEFAULT '{}',
  p_avatar_url text DEFAULT NULL,
  p_id_photo_url text DEFAULT NULL,
  p_license_photo_url text DEFAULT NULL,
  p_admin_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_courier_data jsonb;
BEGIN
  -- Only admins can execute this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can create couriers with auth credentials';
  END IF;

  -- Create auth user with courier metadata
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object(
      'full_name', p_full_name,
      'phone', p_phone,
      'user_type', 'courier',
      'address', p_address,
      'vehicle_type', p_vehicle_type,
      'assigned_zones', p_assigned_zones,
      'avatar_url', p_avatar_url,
      'id_photo_url', p_id_photo_url,
      'license_photo_url', p_license_photo_url,
      'admin_notes', p_admin_notes,
      'admin_created', 'true'
    ),
    'authenticated',
    'authenticated'
  ) RETURNING id INTO v_user_id;

  -- The trigger will automatically create the profiles and courier records
  
  -- Return the created courier data
  SELECT to_jsonb(c.*) INTO v_courier_data
  FROM public.couriers c
  WHERE c.id = v_user_id;

  RETURN v_courier_data;
END;
$$;

-- Create function for admins to approve pending couriers
CREATE OR REPLACE FUNCTION public.approve_courier(p_courier_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can approve couriers
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can approve couriers';
  END IF;

  -- Update courier status to active
  UPDATE public.couriers 
  SET status = 'active',
      updated_at = now()
  WHERE id = p_courier_id
    AND status = 'pending';

  -- Log the approval
  INSERT INTO public.activity_logs (entity_type, entity_id, action, details, performed_by)
  VALUES (
    'couriers',
    p_courier_id,
    'approved',
    jsonb_build_object('approved_by', auth.uid(), 'approved_at', now()),
    auth.uid()::text
  );

  RETURN FOUND;
END;
$$;