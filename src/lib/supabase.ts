import { supabase } from '@/integrations/supabase/client';
import { Lead, User, Task, Ticket, Payment, Booking } from '@/types/models';

// Enhanced Supabase helper functions for multi-tenant CRM

// Lead operations
export const leadOperations = {
  async getAll(tenantId: string, filters?: any) {
    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_agent:profiles!assigned_agent_id(*)
      `)
      .eq('tenant_id', tenantId);

    if (filters?.status) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    
    if (filters?.assigned_agent_id) {
      query = query.eq('assigned_agent_id', filters.assigned_agent_id);
    }

    return query.order('created_at', { ascending: false });
  },

  async getById(id: string) {
    return supabase
      .from('leads')
      .select(`
        *,
        assigned_agent:profiles!assigned_agent_id(*)
      `)
      .eq('id', id)
      .single();
  },

  async create(leadData: Partial<Lead>) {
    return supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();
  },

  async update(id: string, updates: Partial<Lead>) {
    return supabase
      .from('leads')
      .update(updates)
      .eq('id', id);
  },

  async delete(id: string) {
    return supabase
      .from('leads')
      .delete()
      .eq('id', id);
  },

  async getByDepartment(tenantId: string, department: string) {
    return supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('department', department)
      .order('created_at', { ascending: false });
  },

  async getByAgent(agentId: string) {
    return supabase
      .from('leads')
      .select('*')
      .eq('assigned_agent_id', agentId)
      .order('updated_at', { ascending: false });
  }
};

// User/Profile operations
export const userOperations = {
  async getProfile(userId: string) {
    return supabase
      .from('profiles')
      .select(`
        *,
        tenant:tenants(*)
      `)
      .eq('user_id', userId)
      .single();
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    return supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
  },

  async getTeamMembers(tenantId: string, department?: string) {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (department) {
      query = query.eq('department', department);
    }

    return query.order('first_name');
  },

  async switchTenant(userId: string, tenantId: string) {
    return supabase
      .from('profiles')
      .update({ tenant_id: tenantId })
      .eq('user_id', userId);
  }
};

// Task operations
export const taskOperations = {
  async getAll(tenantId: string, filters?: any) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!assigned_to(*),
        related_lead:leads(*),
        related_booking:bookings(*)
      `)
      .eq('tenant_id', tenantId);

    if (filters?.status) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    
    if (filters?.priority) {
      query = query.in('priority', filters.priority);
    }

    return query.order('created_at', { ascending: false });
  },

  async create(taskData: Partial<Task>) {
    return supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();
  },

  async update(id: string, updates: Partial<Task>) {
    return supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);
  },

  async updateTimeSpent(id: string, timeSpent: number) {
    return supabase
      .from('tasks')
      .update({ time_spent: timeSpent })
      .eq('id', id);
  },

  async markComplete(id: string) {
    return supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id);
  },

  async getByAssignee(assigneeId: string) {
    return supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', assigneeId)
      .neq('status', 'completed')
      .order('due_date', { ascending: true });
  }
};

// Ticket operations
export const ticketOperations = {
  async getAll(tenantId: string, filters?: any) {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        assignee:profiles!assigned_to(*),
        related_booking:bookings(*)
      `)
      .eq('tenant_id', tenantId);

    if (filters?.status) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.priority) {
      query = query.in('priority', filters.priority);
    }
    
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    return query.order('created_at', { ascending: false });
  },

  async create(ticketData: Partial<Ticket>) {
    return supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single();
  },

  async update(id: string, updates: Partial<Ticket>) {
    return supabase
      .from('tickets')
      .update(updates)
      .eq('id', id);
  },

  async resolve(id: string, resolution: string) {
    return supabase
      .from('tickets')
      .update({ 
        status: 'resolved',
        resolution
      })
      .eq('id', id);
  },

  async getOpenTickets(tenantId: string) {
    return supabase
      .from('tickets')
      .select('*')
      .eq('tenant_id', tenantId)
      .in('status', ['open', 'in_progress'])
      .order('priority', { ascending: false });
  }
};

// Financial operations
export const financialOperations = {
  async getPayments(tenantId: string, filters?: any) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(*)
      `)
      .eq('tenant_id', tenantId);

    if (filters?.status) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end);
    }

    return query.order('created_at', { ascending: false });
  },

  async getBookings(tenantId: string) {
    return supabase
      .from('bookings')
      .select(`
        *,
        lead:leads(*),
        payments(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
  },

  async updatePaymentStatus(paymentId: string, status: string) {
    const updateData: any = { status };
    if (status === 'paid') {
      updateData.paid_date = new Date().toISOString();
    }
    
    return supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId);
  },

  async recordPayment(paymentData: Partial<Payment>) {
    return supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();
  },

  async getOutstandingPayments(tenantId: string) {
    return supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(*)
      `)
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'partial'])
      .order('due_date', { ascending: true });
  },

  async getOverduePayments(tenantId: string) {
    const today = new Date().toISOString().split('T')[0];
    return supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(*)
      `)
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'partial'])
      .lt('due_date', today);
  }
};

// Activity logging
export const activityOperations = {
  async log(tenantId: string, userId: string, action: string, entityType: string, entityId: string, metadata?: any) {
    return supabase
      .from('activities')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || {}
      });
  },

  async getRecent(tenantId: string, limit = 20) {
    return supabase
      .from('activities')
      .select(`
        *,
        user:profiles!user_id(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  async getByEntity(entityType: string, entityId: string) {
    return supabase
      .from('activities')
      .select(`
        *,
        user:profiles!user_id(*)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
  }
};

// Tenant operations
export const tenantOperations = {
  async get(tenantId: string) {
    return supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
  },

  async update(tenantId: string, updates: any) {
    return supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId);
  },

  async updateCSSOverrides(tenantId: string, cssOverrides: any) {
    return supabase
      .from('tenants')
      .update({ css_overrides: cssOverrides })
      .eq('id', tenantId);
  },

  async updateSettings(tenantId: string, settings: any) {
    return supabase
      .from('tenants')
      .update({ settings })
      .eq('id', tenantId);
  }
};

// Real-time subscriptions
export const realtimeOperations = {
  subscribeToLeads(tenantId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`leads-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `tenant_id=eq.${tenantId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToTasks(tenantId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`tasks-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `tenant_id=eq.${tenantId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToTickets(tenantId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`tickets-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `tenant_id=eq.${tenantId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToPayments(tenantId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`payments-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `tenant_id=eq.${tenantId}`,
        },
        callback
      )
      .subscribe();
  },

  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  }
};

// Utility functions
export const utilityFunctions = {
  async generateReference(prefix: string) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  },

  async uploadFile(bucket: string, path: string, file: File) {
    return supabase.storage
      .from(bucket)
      .upload(path, file);
  },

  async getPublicUrl(bucket: string, path: string) {
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path);
  },

  formatCurrency(amount: number, currency = 'THB') {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  formatDate(date: string) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  },

  formatDateTime(date: string) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }
};

// Export all operations as a single object for easy importing
export const supabaseOperations = {
  leads: leadOperations,
  users: userOperations,
  tasks: taskOperations,
  tickets: ticketOperations,
  financial: financialOperations,
  activities: activityOperations,
  tenants: tenantOperations,
  realtime: realtimeOperations,
  utils: utilityFunctions,
};

export default supabaseOperations;