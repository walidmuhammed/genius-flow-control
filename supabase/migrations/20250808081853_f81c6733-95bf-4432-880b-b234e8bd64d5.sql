-- Delete all client-specific pricing configuration in one atomic operation
CREATE OR REPLACE FUNCTION public.delete_client_pricing_configuration(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- Optionally, you could log this cleanup in pricing_change_logs with a generic entry if needed
  -- INSERT INTO public.pricing_change_logs (action, pricing_type, entity_id, old_values, new_values, changed_by)
  -- VALUES ('DELETE', 'client_full_cleanup', p_client_id, NULL, NULL, auth.uid());
END;
$$;