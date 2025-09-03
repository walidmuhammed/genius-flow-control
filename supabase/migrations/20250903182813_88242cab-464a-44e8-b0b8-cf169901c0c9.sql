-- Fix the handle_new_user function to properly handle JSON arrays
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      -- Properly handle JSON array conversion
      CASE 
        WHEN NEW.raw_user_meta_data -> 'assigned_zones' IS NOT NULL 
          AND jsonb_typeof(NEW.raw_user_meta_data -> 'assigned_zones') = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data -> 'assigned_zones'))
        ELSE '{}'::text[]
      END,
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
$function$