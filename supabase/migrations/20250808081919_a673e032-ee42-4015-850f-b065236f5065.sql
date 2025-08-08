CREATE OR REPLACE FUNCTION public.delete_client_pricing_configuration(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Ensure only admins can execute this logic
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can delete client pricing configurations';
  END IF;

  -- Remove new structured client-specific pricing first
  DELETE FROM public.pricing_client_package_extras WHERE client_id = p_client_id;
  DELETE FROM public.pricing_client_zone_rules WHERE client_id = p_client_id;
  DELETE FROM public.pricing_client_defaults WHERE client_id = p_client_id;

  -- Clean up legacy and mixed tables for full backward-compatibility
  DELETE FROM public.pricing_client_overrides WHERE client_id = p_client_id;
  DELETE FROM public.pricing_package_types WHERE client_id = p_client_id;
  DELETE FROM public.pricing_zone_rules WHERE client_id = p_client_id;
END;
$$;