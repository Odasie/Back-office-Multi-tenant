import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Lead, LeadStatus, LeadFilters, DragDropLead, LeadColumn, CreateLeadRequest, UpdateLeadRequest } from '@/types/models';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';

interface LeadContextType {
  leads: Lead[];
  leadColumns: LeadColumn[];
  loading: boolean;
  filters: LeadFilters;
  searchTerm: string;
  selectedLead: Lead | null;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Actions
  fetchLeads: () => Promise<void>;
  createLead: (leadData: CreateLeadRequest) => Promise<{ error: any; data?: Lead }>;
  updateLead: (leadId: string, updates: UpdateLeadRequest) => Promise<{ error: any }>;
  deleteLead: (leadId: string) => Promise<{ error: any }>;
  moveLead: (leadId: string, newStatus: LeadStatus) => Promise<{ error: any }>;
  
  // Drag and drop
  handleDragStart: (leadId: string) => void;
  handleDragEnd: () => void;
  handleDrop: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  
  // Filters and search
  setFilters: (filters: LeadFilters) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Selection
  selectLead: (lead: Lead | null) => void;
  
  // Real-time subscriptions
  subscribeToLeads: () => () => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const useLead = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLead must be used within a LeadProvider');
  }
  return context;
};

interface LeadProviderProps {
  children: ReactNode;
}

const defaultFilters: LeadFilters = {};

const leadStatusColumns: Array<{ id: LeadStatus; title: string; color: string }> = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-100 text-blue-800' },
  { id: 'contacted', title: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'qualified', title: 'Qualified', color: 'bg-purple-100 text-purple-800' },
  { id: 'proposal_sent', title: 'Proposal Sent', color: 'bg-orange-100 text-orange-800' },
  { id: 'negotiating', title: 'Negotiating', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'awaiting_agency_confirm', title: 'Awaiting Agency', color: 'bg-pink-100 text-pink-800' },
  { id: 'confirmed', title: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { id: 'booked', title: 'Booked', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'completed', title: 'Completed', color: 'bg-teal-100 text-teal-800' },
  { id: 'cancelled', title: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { id: 'lost', title: 'Lost', color: 'bg-gray-100 text-gray-800' },
];

export const LeadProvider = ({ children }: LeadProviderProps) => {
  const { profile, tenant } = useUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const { toast } = useToast();

  // Transform leads into kanban columns
  const leadColumns: LeadColumn[] = leadStatusColumns.map(column => ({
    ...column,
    leads: leads
      .filter(lead => lead.status === column.id)
      .map(lead => ({ ...lead, isDragging: lead.id === draggedLeadId }))
  }));

  const fetchLeads = async () => {
    if (!profile?.tenant_id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_agent:profiles(*)
        `)
        .eq('tenant_id', profile.tenant_id);

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      
      if (filters.booking_type?.length) {
        query = query.in('booking_type', filters.booking_type);
      }
      
      if (filters.department?.length) {
        query = query.in('department', filters.department);
      }
      
      if (filters.assigned_agent_id?.length) {
        query = query.in('assigned_agent_id', filters.assigned_agent_id);
      }
      
      if (filters.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end);
      }
      
      if (filters.estimated_value_range) {
        query = query
          .gte('estimated_value', filters.estimated_value_range.min)
          .lte('estimated_value', filters.estimated_value_range.max);
      }

      // Apply search term
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`);
      }

      // Apply department-based filtering for non-admin users
      if (profile.role !== 'super_admin' && profile.role !== 'admin') {
        if (profile.department) {
          query = query.eq('department', profile.department);
        }
        
        // Agents can only see their own leads or unassigned leads
        if (profile.role === 'agent') {
          query = query.or(`assigned_agent_id.eq.${profile.id},assigned_agent_id.is.null`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: "Error fetching leads",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Add computed fields
      const enrichedLeads = data.map(lead => ({
        ...lead,
        days_since_created: Math.floor(
          (new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
        progress_percentage: calculateLeadProgress(lead.status),
      }));

      setLeads(enrichedLeads);
    } catch (error) {
      console.error('Error in fetchLeads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLeadProgress = (status: LeadStatus): number => {
    const statusProgress: Record<LeadStatus, number> = {
      new: 10,
      contacted: 20,
      qualified: 35,
      proposal_sent: 50,
      negotiating: 65,
      awaiting_agency_confirm: 75,
      confirmed: 85,
      booked: 95,
      completed: 100,
      cancelled: 0,
      lost: 0,
    };
    return statusProgress[status] || 0;
  };

  const createLead = async (leadData: CreateLeadRequest) => {
    if (!profile?.tenant_id) return { error: 'No tenant selected' };
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          tenant_id: profile.tenant_id,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Failed to create lead",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Lead created",
        description: "The lead has been successfully created.",
      });

      // Refresh leads
      await fetchLeads();
      
      return { error: null, data };
    } catch (error: any) {
      toast({
        title: "Failed to create lead",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsCreating(false);
    }
  };

  const updateLead = async (leadId: string, updates: UpdateLeadRequest) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);

      if (error) {
        toast({
          title: "Failed to update lead",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Lead updated",
        description: "The lead has been successfully updated.",
      });

      // Refresh leads
      await fetchLeads();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to update lead",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        toast({
          title: "Failed to delete lead",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Lead deleted",
        description: "The lead has been successfully deleted.",
      });

      // Refresh leads
      await fetchLeads();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to delete lead",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const moveLead = async (leadId: string, newStatus: LeadStatus) => {
    return updateLead(leadId, { status: newStatus });
  };

  // Drag and drop handlers
  const handleDragStart = (leadId: string) => {
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
  };

  const handleDrop = async (leadId: string, newStatus: LeadStatus) => {
    await moveLead(leadId, newStatus);
    setDraggedLeadId(null);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchTerm('');
  };

  const selectLead = (lead: Lead | null) => {
    setSelectedLead(lead);
  };

  const subscribeToLeads = () => {
    if (!profile?.tenant_id) return () => {};
    
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `tenant_id=eq.${profile.tenant_id}`,
        },
        () => {
          // Refresh leads when changes occur
          setTimeout(() => {
            fetchLeads();
          }, 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchLeads();
    }
  }, [profile?.tenant_id, filters, searchTerm]);

  useEffect(() => {
    if (profile?.tenant_id) {
      const unsubscribe = subscribeToLeads();
      return unsubscribe;
    }
  }, [profile?.tenant_id]);

  const value = {
    leads,
    leadColumns,
    loading,
    filters,
    searchTerm,
    selectedLead,
    isCreating,
    isUpdating,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    moveLead,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    setFilters,
    setSearchTerm,
    clearFilters,
    selectLead,
    subscribeToLeads,
  };

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
};