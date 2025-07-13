import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadApiFilters, CreateLeadRequest, UpdateLeadRequest } from '@/types/models';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

// Sample data fallback
const sampleLeads: Lead[] = [
  {
    id: 'sample-1',
    tenant_id: 'sample-tenant',
    title: 'Thailand Beach Holiday',
    customer_name: 'John Smith',
    customer_email: 'john@example.com',
    source: 'website',
    destination: 'Phuket, Thailand',
    booking_type: 'international',
    status: 'qualified',
    estimated_value: 2500,
    department: 'sales',
    notes: 'Interested in luxury beachfront resort',
    metadata: { tags: ['luxury', 'beach', 'family'] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    auto_tags: ['high-value', 'international'],
    days_since_created: 3,
    progress_percentage: 35,
  },
  {
    id: 'sample-2',
    tenant_id: 'sample-tenant',
    title: 'Bangkok Business Trip',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah@company.com',
    source: 'referral',
    destination: 'Bangkok, Thailand',
    booking_type: 'b2b',
    status: 'proposal_sent',
    estimated_value: 1800,
    department: 'sales',
    notes: 'Corporate group booking for conference',
    metadata: { tags: ['business', 'group', 'conference'] },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    auto_tags: ['b2b', 'group'],
    days_since_created: 2,
    progress_percentage: 50,
  }
];

export const useLeadsQuery = (filters?: LeadApiFilters) => {
  const { profile } = useUser();
  
  return useQuery({
    queryKey: ['leads', filters, profile?.tenant_id],
    queryFn: async () => {
      // Return sample data if no tenant or as fallback
      if (!profile?.tenant_id) {
        return { data: sampleLeads, error: null };
      }

      try {
        let query = supabase
          .from('leads')
          .select(`
            *,
            assigned_agent:profiles(*)
          `)
          .eq('tenant_id', profile.tenant_id);

        // Apply filters
        if (filters?.status?.length) {
          query = query.in('status', filters.status);
        }
        if (filters?.booking_type?.length) {
          query = query.in('booking_type', filters.booking_type);
        }
        if (filters?.department?.length) {
          query = query.in('department', filters.department);
        }
        if (filters?.assigned_agent_id?.length) {
          query = query.in('assigned_agent_id', filters.assigned_agent_id);
        }
        if (filters?.source?.length) {
          query = query.in('source', filters.source);
        }
        if (filters?.destination?.length) {
          query = query.or(
            filters.destination.map(dest => `destination.ilike.%${dest}%`).join(',')
          );
        }
        if (filters?.date_range) {
          query = query
            .gte('created_at', filters.date_range.start)
            .lte('created_at', filters.date_range.end);
        }
        if (filters?.estimated_value_range) {
          query = query
            .gte('estimated_value', filters.estimated_value_range.min)
            .lte('estimated_value', filters.estimated_value_range.max);
        }
        if (filters?.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
          );
        }

        // Apply role-based filtering
        if (profile.role !== 'super_admin' && profile.role !== 'admin') {
          if (profile.department) {
            query = query.eq('department', profile.department);
          }
          if (profile.role === 'agent') {
            query = query.or(`assigned_agent_id.eq.${profile.id},assigned_agent_id.is.null`);
          }
        }

        // Apply sorting
        const sortBy = filters?.sort_by || 'created_at';
        const sortOrder = filters?.sort_order || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) throw error;

        // Add computed fields and auto-tagging
        const enrichedLeads = data?.map(lead => ({
          ...lead,
          days_since_created: Math.floor(
            (new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
          ),
          progress_percentage: calculateLeadProgress(lead.status),
          auto_tags: generateAutoTags(lead),
        })) || [];

        return { data: enrichedLeads, error: null };
      } catch (error) {
        console.warn('API request failed, falling back to sample data:', error);
        return { data: sampleLeads, error };
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateLeadMutation = () => {
  const { profile } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: CreateLeadRequest) => {
      if (!profile?.tenant_id) {
        throw new Error('No tenant selected');
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          tenant_id: profile.tenant_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead created",
        description: "The lead has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create lead",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLeadMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateLeadRequest }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead updated",
        description: "The lead has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update lead",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteLeadMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead deleted",
        description: "The lead has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete lead",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

// Helper functions
const calculateLeadProgress = (status: string): number => {
  const statusProgress: Record<string, number> = {
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

const generateAutoTags = (lead: any): string[] => {
  const tags: string[] = [];
  
  // Value-based tags
  if (lead.estimated_value > 3000) tags.push('high-value');
  else if (lead.estimated_value > 1500) tags.push('medium-value');
  else if (lead.estimated_value > 0) tags.push('budget');
  
  // Booking type tags
  if (lead.booking_type === 'b2b') tags.push('b2b');
  if (lead.booking_type === 'group') tags.push('group');
  if (lead.booking_type === 'international') tags.push('international');
  
  // Source-based tags
  if (lead.source === 'website') tags.push('organic');
  if (lead.source === 'referral') tags.push('referral');
  if (lead.source === 'social') tags.push('social-media');
  
  // Urgency tags based on days since created
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceCreated > 7) tags.push('follow-up-needed');
  if (daysSinceCreated > 14) tags.push('stale');
  
  return tags;
};