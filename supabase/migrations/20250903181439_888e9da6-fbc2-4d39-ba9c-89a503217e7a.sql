-- Create an admin function to create courier users with auth credentials
-- This will use the service role privileges to create auth users

CREATE OR REPLACE FUNCTION public.admin_create_courier_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_vehicle_type TEXT DEFAULT 'motorcycle',
  p_address TEXT DEFAULT NULL,
  p_assigned_zones TEXT[] DEFAULT '{}',
  p_avatar_url TEXT DEFAULT NULL,
  p_id_photo_url TEXT DEFAULT NULL,
  p_license_photo_url TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_courier_data JSONB;
BEGIN
  -- Only admins can execute this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can create couriers';
  END IF;

  -- First create the courier record directly (without auth user first)
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
    gen_random_uuid(),
    p_full_name,
    p_phone,
    p_email,
    p_address,
    p_vehicle_type,
    p_assigned_zones,
    'active', -- Admin-created couriers are active immediately
    p_avatar_url,
    p_id_photo_url,
    p_license_photo_url,
    p_admin_notes
  ) RETURNING id INTO v_user_id;

  -- Create the profile record with the same ID
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    business_name,
    business_type,
    user_type
  ) VALUES (
    v_user_id,
    p_full_name,
    p_phone,
    NULL,
    NULL,
    'courier'
  );

  -- Return the courier data with temporary credentials info
  SELECT jsonb_build_object(
    'id', v_user_id,
    'email', p_email,
    'temp_password', p_password,
    'status', 'created_pending_auth'
  ) INTO v_courier_data;

  RETURN v_courier_data;
END;
$$;