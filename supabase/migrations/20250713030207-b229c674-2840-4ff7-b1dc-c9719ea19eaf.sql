-- Create enum types
CREATE TYPE public.booking_type AS ENUM ('domestic', 'international', 'b2b', 'group', 'corporate');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'awaiting_agency_confirm', 'confirmed', 'booked', 'completed', 'cancelled', 'lost');
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue', 'refunded');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'agent', 'user');
CREATE TYPE public.department AS ENUM ('sales', 'operations', 'finance', 'customer_service', 'management');

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  css_overrides JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  department department,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  source TEXT,
  destination TEXT,
  booking_type booking_type NOT NULL DEFAULT 'domestic',
  status lead_status NOT NULL DEFAULT 'new',
  estimated_value DECIMAL(10,2),
  assigned_agent_id UUID REFERENCES public.profiles(id),
  department department NOT NULL DEFAULT 'sales',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  booking_reference TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  destination TEXT NOT NULL,
  booking_type booking_type NOT NULL,
  start_date DATE,
  end_date DATE,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  status TEXT DEFAULT 'confirmed',
  itinerary_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  payment_method TEXT,
  transaction_id TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  paid_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  related_lead_id UUID REFERENCES public.leads(id),
  related_booking_id UUID REFERENCES public.bookings(id),
  status task_status NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  status ticket_status NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  related_booking_id UUID REFERENCES public.bookings(id),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for multi-tenant access
CREATE POLICY "Users can view their tenant's data" ON public.tenants FOR SELECT USING (
  id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view profiles in their tenant" ON public.profiles FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view leads in their tenant" ON public.leads FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create leads in their tenant" ON public.leads FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update leads in their tenant" ON public.leads FOR UPDATE USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view bookings in their tenant" ON public.bookings FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view payments in their tenant" ON public.payments FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view tasks in their tenant" ON public.tasks FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view tickets in their tenant" ON public.tickets FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view activities in their tenant" ON public.activities FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, tenant_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    (SELECT id FROM public.tenants LIMIT 1), -- Default to first tenant for now
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();