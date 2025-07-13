import type { Database } from '@/integrations/supabase/types';

// Database types
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Basic types from database
export type BookingType = Enums['booking_type'];
export type LeadStatus = Enums['lead_status'];
export type PaymentStatus = Enums['payment_status'];
export type TaskStatus = Enums['task_status'];
export type TicketStatus = Enums['ticket_status'];
export type UserRole = Enums['user_role'];
export type Department = Enums['department'];

// Core model interfaces
export interface Tenant {
  id: string;
  name: string;
  css_overrides: Record<string, any>;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  user_id: string;
  tenant_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  department?: Department;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  title: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  source?: string;
  destination?: string;
  booking_type: BookingType;
  status: LeadStatus;
  estimated_value?: number;
  assigned_agent_id?: string;
  department: Department;
  notes?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  assigned_agent?: User;
  days_since_created?: number;
  progress_percentage?: number;
}

export interface Booking {
  id: string;
  tenant_id: string;
  lead_id: string;
  booking_reference: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  destination: string;
  booking_type: BookingType;
  start_date?: string;
  end_date?: string;
  total_amount: number;
  currency: string;
  status: string;
  itinerary_data: any;
  created_at: string;
  updated_at: string;
  
  // Relations
  lead?: Lead;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  tenant_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method?: string;
  transaction_id?: string;
  status: PaymentStatus;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  booking?: Booking;
}

export interface Task {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  related_lead_id?: string;
  related_booking_id?: string;
  status: TaskStatus;
  priority: string;
  due_date?: string;
  completed_at?: string;
  time_spent: number; // in minutes
  created_at: string;
  updated_at: string;
  
  // Relations
  assignee?: User;
  related_lead?: Lead;
  related_booking?: Booking;
}

export interface Ticket {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  customer_email?: string;
  customer_phone?: string;
  assigned_to?: string;
  status: TicketStatus;
  priority: string;
  category?: string;
  related_booking_id?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  assignee?: User;
  related_booking?: Booking;
}

export interface Activity {
  id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
  
  // Relations
  user?: User;
}

// Specialized interfaces
export interface Itinerary {
  id: string;
  lead_id: string;
  booking_id?: string;
  destination: string;
  start_date: string;
  end_date: string;
  activities: ItineraryActivity[];
  accommodations: Accommodation[];
  transportation: Transportation[];
  total_cost: number;
  status: 'draft' | 'sent' | 'approved' | 'confirmed';
  external_builder_url?: string;
}

export interface ItineraryActivity {
  id: string;
  name: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  cost: number;
  included: boolean;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'resort' | 'hostel' | 'villa' | 'apartment';
  location: string;
  check_in: string;
  check_out: string;
  room_type: string;
  cost_per_night: number;
  total_cost: number;
}

export interface Transportation {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'boat';
  from: string;
  to: string;
  departure_date: string;
  departure_time?: string;
  arrival_date: string;
  arrival_time?: string;
  cost: number;
  booking_reference?: string;
}

// KPI and Analytics interfaces
export interface KpiData {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date_range: {
    start: string;
    end: string;
  };
  department?: Department;
  metrics: {
    // Sales metrics
    leads_generated?: number;
    leads_converted?: number;
    conversion_rate?: number;
    revenue?: number;
    average_deal_size?: number;
    
    // Operations metrics
    tasks_completed?: number;
    average_task_completion_time?: number;
    on_time_completion_rate?: number;
    
    // Finance metrics
    revenue?: number;
    outstanding_payments?: number;
    payment_collection_rate?: number;
    refund_rate?: number;
    
    // Customer Service metrics
    tickets_resolved?: number;
    average_resolution_time?: number;
    customer_satisfaction?: number;
    first_response_time?: number;
  };
}

export interface FinancialDetail {
  booking_id: string;
  customer_name: string;
  destination: string;
  booking_date: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  payment_status: PaymentStatus;
  payment_due_date?: string;
  payments: Payment[];
  currency: string;
}

// Request types for API
export interface CreateLeadRequest {
  title: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  source?: string;
  destination?: string;
  booking_type: BookingType;
  estimated_value?: number;
  department: Department;
  notes?: string;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  status?: LeadStatus;
  assigned_agent_id?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigned_to?: string;
  related_lead_id?: string;
  related_booking_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}

export interface CreateTicketRequest {
  title: string;
  description?: string;
  customer_email?: string;
  customer_phone?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  related_booking_id?: string;
}

// Form validation schemas (for use with react-hook-form and zod)
export interface LeadFormData {
  title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  source: string;
  destination: string;
  booking_type: BookingType;
  estimated_value: number;
  notes: string;
}

// Filter and search interfaces
export interface LeadFilters {
  status?: LeadStatus[];
  booking_type?: BookingType[];
  department?: Department[];
  assigned_agent_id?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  estimated_value_range?: {
    min: number;
    max: number;
  };
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: ('low' | 'medium' | 'high' | 'urgent')[];
  assigned_to?: string[];
  due_date_range?: {
    start: string;
    end: string;
  };
}

// Drag and drop interfaces
export interface DragDropLead extends Lead {
  isDragging?: boolean;
}

export interface LeadColumn {
  id: LeadStatus;
  title: string;
  leads: DragDropLead[];
  color: string;
}

// Multi-tenant specific interfaces
export interface TenantSettings {
  branding: {
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    font_family: string;
  };
  features: {
    enable_b2b_bookings: boolean;
    enable_group_bookings: boolean;
    enable_external_itinerary_builder: boolean;
    enable_payment_tracking: boolean;
  };
  integrations: {
    google_oauth_enabled: boolean;
    external_builder_url?: string;
    payment_gateway_config?: Record<string, any>;
  };
}

export interface TenantUser extends User {
  tenant: Tenant;
}