-- Add RLS policies for user and tenant management

-- Profiles table policies for user management
CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'super_admin'
  )
);

CREATE POLICY "Admins can manage profiles in their tenant" 
ON public.profiles 
FOR ALL
TO authenticated
USING (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('super_admin', 'admin')
  )
);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Tenants table policies
CREATE POLICY "Super admins can manage all tenants" 
ON public.tenants 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'super_admin'
  )
);

-- Tasks table policies for management
CREATE POLICY "Users can create tasks in their tenant" 
ON public.tasks 
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update tasks in their tenant" 
ON public.tasks 
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Tickets table policies for management
CREATE POLICY "Users can create tickets in their tenant" 
ON public.tickets 
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update tickets in their tenant" 
ON public.tickets 
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Bookings table policies for management
CREATE POLICY "Users can create bookings in their tenant" 
ON public.bookings 
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update bookings in their tenant" 
ON public.bookings 
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Payments table policies for management
CREATE POLICY "Users can create payments in their tenant" 
ON public.payments 
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update payments in their tenant" 
ON public.payments 
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Activities table policies for management
CREATE POLICY "Users can create activities in their tenant" 
ON public.activities 
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Update the handle_new_user function to work with existing profiles table structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_tenant_id uuid;
BEGIN
  -- Get or create a default tenant
  SELECT id INTO default_tenant_id FROM public.tenants LIMIT 1;
  
  IF default_tenant_id IS NULL THEN
    INSERT INTO public.tenants (name) VALUES ('Default Tenant') RETURNING id INTO default_tenant_id;
  END IF;
  
  -- Insert the new user profile
  INSERT INTO public.profiles (
    user_id, 
    tenant_id, 
    email, 
    first_name, 
    last_name,
    role
  )
  VALUES (
    NEW.id,
    default_tenant_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    'user'
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();