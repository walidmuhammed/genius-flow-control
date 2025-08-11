-- Fix critical security vulnerability: Remove overly permissive activity_logs policy
-- This policy was allowing ALL authenticated users to read sensitive system activity logs

-- Drop the dangerous policy that grants full access to all users
DROP POLICY IF EXISTS "Allow full access to activity_logs" ON public.activity_logs;

-- Ensure admin-only access for sensitive operations
-- The existing "activity_logs_select_policy" already restricts SELECT to admins (is_admin())
-- But we need to add proper admin-only policies for UPDATE and DELETE operations

CREATE POLICY "Only admins can update activity logs" 
ON public.activity_logs 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete activity logs" 
ON public.activity_logs 
FOR DELETE 
USING (is_admin());

-- The existing policies are now properly restrictive:
-- 1. "activity_logs_select_policy" - Only admins can SELECT (is_admin())
-- 2. "activity_logs_insert_policy" - Authenticated users can INSERT (for system logging)
-- 3. New admin-only UPDATE and DELETE policies added above