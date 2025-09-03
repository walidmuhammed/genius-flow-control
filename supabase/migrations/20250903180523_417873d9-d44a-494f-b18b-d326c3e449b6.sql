-- Drop the problematic admin_create_courier_with_auth function
-- We'll use Supabase's proper auth API instead of trying to manually create auth users

DROP FUNCTION IF EXISTS public.admin_create_courier_with_auth(text, text, text, text, text, text, text[], text, text, text, text);