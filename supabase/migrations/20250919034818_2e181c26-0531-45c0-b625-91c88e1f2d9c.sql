-- Fix infinite recursion in profiles RLS policies
-- The issue is that the "Users can view profiles in their tenant" policy
-- references the profiles table within itself, causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;

-- Create a new policy that avoids recursion by using a more direct approach
-- Users can view their own profile without needing to check tenant
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can view other profiles in their tenant (this requires a subquery but avoids recursion)
-- We'll use a function approach to avoid the recursion
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Now create the policy using the function
CREATE POLICY "Users can view profiles in same tenant" 
ON public.profiles 
FOR SELECT 
USING (tenant_id = public.get_user_tenant_id(auth.uid()));