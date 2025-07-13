import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Ticket, TicketStatus, CreateTicketRequest } from '@/types/models';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';

interface CustomerServiceContextType {
  tickets: Ticket[];
  loading: boolean;
  
  // Metrics
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number; // in hours
  
  // Actions
  fetchTickets: () => Promise<void>;
  createTicket: (ticketData: CreateTicketRequest) => Promise<{ error: any; data?: Ticket }>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<{ error: any }>;
  assignTicket: (ticketId: string, userId: string) => Promise<{ error: any }>;
  resolveTicket: (ticketId: string, resolution: string) => Promise<{ error: any }>;
  closeTicket: (ticketId: string) => Promise<{ error: any }>;
  
  // Filters
  filterByStatus: (status: TicketStatus[]) => void;
  filterByPriority: (priority: string[]) => void;
  filterByAssignee: (userIds: string[]) => void;
  clearFilters: () => void;
  
  // Search
  searchTickets: (query: string) => void;
  
  // Bulk operations
  bulkAssignTickets: (ticketIds: string[], userId: string) => Promise<{ error: any }>;
  bulkUpdateStatus: (ticketIds: string[], status: TicketStatus) => Promise<{ error: any }>;
}

const CustomerServiceContext = createContext<CustomerServiceContextType | undefined>(undefined);

export const useCustomerService = () => {
  const context = useContext(CustomerServiceContext);
  if (context === undefined) {
    throw new Error('useCustomerService must be used within a CustomerServiceProvider');
  }
  return context;
};

interface CustomerServiceProviderProps {
  children: ReactNode;
}

export const CustomerServiceProvider = ({ children }: CustomerServiceProviderProps) => {
  const { profile } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Calculate metrics
  const totalTickets = allTickets.length;
  const openTickets = allTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedTickets = allTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  
  const averageResolutionTime = (() => {
    const resolvedTicketsWithDates = allTickets.filter(t => 
      (t.status === 'resolved' || t.status === 'closed') && t.updated_at
    );
    
    if (resolvedTicketsWithDates.length === 0) return 0;
    
    const totalHours = resolvedTicketsWithDates.reduce((sum, ticket) => {
      const created = new Date(ticket.created_at);
      const resolved = new Date(ticket.updated_at);
      const hours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    return Math.round(totalHours / resolvedTicketsWithDates.length);
  })();

  const fetchTickets = async () => {
    if (!profile?.tenant_id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          assignee:profiles!assigned_to(*),
          related_booking:bookings(*)
        `)
        .eq('tenant_id', profile.tenant_id);

      // Apply role-based filtering
      if (profile.role === 'agent') {
        // Agents can only see their own tickets or unassigned tickets
        query = query.or(`assigned_to.eq.${profile.id},assigned_to.is.null`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error fetching tickets",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAllTickets(data || []);
      setTickets(data || []);
    } catch (error) {
      console.error('Error in fetchTickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: CreateTicketRequest) => {
    if (!profile?.tenant_id) return { error: 'No tenant selected' };
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          tenant_id: profile.tenant_id,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Failed to create ticket",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Ticket created",
        description: "The support ticket has been successfully created.",
      });

      // Refresh tickets
      await fetchTickets();
      
      return { error: null, data };
    } catch (error: any) {
      toast({
        title: "Failed to create ticket",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) {
        toast({
          title: "Failed to update ticket",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Ticket updated",
        description: "The ticket has been successfully updated.",
      });

      // Refresh tickets
      await fetchTickets();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to update ticket",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const assignTicket = async (ticketId: string, userId: string) => {
    return updateTicket(ticketId, { 
      assigned_to: userId,
      status: 'in_progress' as TicketStatus
    });
  };

  const resolveTicket = async (ticketId: string, resolution: string) => {
    return updateTicket(ticketId, { 
      status: 'resolved' as TicketStatus,
      resolution
    });
  };

  const closeTicket = async (ticketId: string) => {
    return updateTicket(ticketId, { 
      status: 'closed' as TicketStatus
    });
  };

  const filterByStatus = (statuses: TicketStatus[]) => {
    if (statuses.length === 0) {
      setTickets(allTickets);
    } else {
      setTickets(allTickets.filter(ticket => statuses.includes(ticket.status)));
    }
  };

  const filterByPriority = (priorities: string[]) => {
    if (priorities.length === 0) {
      setTickets(allTickets);
    } else {
      setTickets(allTickets.filter(ticket => priorities.includes(ticket.priority)));
    }
  };

  const filterByAssignee = (userIds: string[]) => {
    if (userIds.length === 0) {
      setTickets(allTickets);
    } else {
      setTickets(allTickets.filter(ticket => 
        ticket.assigned_to && userIds.includes(ticket.assigned_to)
      ));
    }
  };

  const clearFilters = () => {
    setTickets(allTickets);
  };

  const searchTickets = (query: string) => {
    if (!query.trim()) {
      setTickets(allTickets);
      return;
    }

    const searchTerm = query.toLowerCase();
    setTickets(allTickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchTerm) ||
      ticket.description?.toLowerCase().includes(searchTerm) ||
      ticket.customer_email?.toLowerCase().includes(searchTerm) ||
      ticket.category?.toLowerCase().includes(searchTerm)
    ));
  };

  const bulkAssignTickets = async (ticketIds: string[], userId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          assigned_to: userId,
          status: 'in_progress'
        })
        .in('id', ticketIds);

      if (error) {
        toast({
          title: "Failed to assign tickets",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Tickets assigned",
        description: `${ticketIds.length} tickets have been assigned.`,
      });

      // Refresh tickets
      await fetchTickets();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to assign tickets",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const bulkUpdateStatus = async (ticketIds: string[], status: TicketStatus) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .in('id', ticketIds);

      if (error) {
        toast({
          title: "Failed to update tickets",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Tickets updated",
        description: `${ticketIds.length} tickets have been updated.`,
      });

      // Refresh tickets
      await fetchTickets();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to update tickets",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchTickets();
    }
  }, [profile?.tenant_id]);

  // Real-time subscriptions
  useEffect(() => {
    if (!profile?.tenant_id) return;
    
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `tenant_id=eq.${profile.tenant_id}`,
        },
        () => {
          setTimeout(() => {
            fetchTickets();
          }, 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.tenant_id]);

  const value = {
    tickets,
    loading,
    totalTickets,
    openTickets,
    resolvedTickets,
    averageResolutionTime,
    fetchTickets,
    createTicket,
    updateTicket,
    assignTicket,
    resolveTicket,
    closeTicket,
    filterByStatus,
    filterByPriority,
    filterByAssignee,
    clearFilters,
    searchTickets,
    bulkAssignTickets,
    bulkUpdateStatus,
  };

  return <CustomerServiceContext.Provider value={value}>{children}</CustomerServiceContext.Provider>;
};