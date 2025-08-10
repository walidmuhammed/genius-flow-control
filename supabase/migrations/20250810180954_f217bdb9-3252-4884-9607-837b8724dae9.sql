-- Create courier record for existing user
INSERT INTO public.couriers (
  id,
  full_name,
  phone,
  email,
  status,
  vehicle_type,
  assigned_zones
) VALUES (
  '627d8146-d642-4f49-93c6-a5958b7107c7',
  'Khaled Kassem',
  '81678932',
  'h.warrak197@gmail.com',
  'active',
  'motorcycle',
  ARRAY['Beirut - Ashrafieh']
);

-- Update handle_new_user function to create courier records automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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
  
  -- If user type is courier, also create courier record
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'client') = 'courier' THEN
    INSERT INTO public.couriers (
      id,
      full_name,
      phone,
      email,
      status,
      vehicle_type
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.email,
      'active',
      'motorcycle'
    );
  END IF;
  
  RETURN NEW;
END;
$$;