import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskApiFilters, CreateTaskRequest } from '@/types/models';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

// Sample data fallback
const sampleTasks: Task[] = [
  {
    id: 'task-1',
    tenant_id: 'sample-tenant',
    title: 'Follow up with John Smith',
    description: 'Call customer to discuss Thailand beach holiday details',
    status: 'pending',
    priority: 'high',
    time_spent: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    auto_assigned: true,
    timer_alerts: [{
      id: 'alert-1',
      task_id: 'task-1',
      duration_minutes: 120,
      trigger_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      is_triggered: false,
      notification_sent: false,
    }],
  },
  {
    id: 'task-2',
    tenant_id: 'sample-tenant',
    title: 'Prepare B2B proposal',
    description: 'Create detailed proposal for Sarah Johnson corporate booking',
    status: 'in_progress',
    priority: 'medium',
    time_spent: 45,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    auto_assigned: false,
  }
];

export const useTasksQuery = (filters?: TaskApiFilters) => {
  const { profile } = useUser();
  
  return useQuery({
    queryKey: ['tasks', filters, profile?.tenant_id],
    queryFn: async () => {
      // Return sample data if no tenant or as fallback
      if (!profile?.tenant_id) {
        return { data: sampleTasks, error: null };
      }

      try {
        let query = supabase
          .from('tasks')
          .select(`
            *,
            assignee:profiles!assigned_to(*),
            related_lead:leads(*),
            related_booking:bookings(*)
          `)
          .eq('tenant_id', profile.tenant_id);

        // Apply filters
        if (filters?.status?.length) {
          query = query.in('status', filters.status);
        }
        if (filters?.priority?.length) {
          query = query.in('priority', filters.priority);
        }
        if (filters?.assigned_to?.length) {
          query = query.in('assigned_to', filters.assigned_to);
        }
        if (filters?.related_entity_type?.length) {
          const conditions = filters.related_entity_type.map(type => 
            type === 'lead' ? 'related_lead_id.not.is.null' : 'related_booking_id.not.is.null'
          );
          query = query.or(conditions.join(','));
        }
        if (filters?.date_range) {
          query = query
            .gte('created_at', filters.date_range.start)
            .lte('created_at', filters.date_range.end);
        }
        if (filters?.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
          );
        }
        if (filters?.is_overdue) {
          query = query.lt('due_date', new Date().toISOString());
        }

        // Apply role-based filtering
        if (profile.role === 'agent') {
          query = query.or(`assigned_to.eq.${profile.id},assigned_to.is.null`);
        } else if (profile.role === 'manager' && profile.department) {
          const { data: departmentUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('department', profile.department)
            .eq('tenant_id', profile.tenant_id);
          
          if (departmentUsers?.length) {
            const userIds = departmentUsers.map(u => u.id);
            query = query.or(`assigned_to.in.(${userIds.join(',')}),assigned_to.is.null`);
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

        // Add computed fields
        const enrichedTasks = data?.map(task => ({
          ...task,
          auto_assigned: (task as any).metadata?.auto_assigned || false,
          timer_alerts: generateTimerAlerts(task),
          handoff_history: (task as any).metadata?.handoff_history || [],
        })) || [];

        return { data: enrichedTasks, error: null };
      } catch (error) {
        console.warn('API request failed, falling back to sample data:', error);
        return { data: sampleTasks, error };
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTaskMutation = () => {
  const { profile } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskRequest) => {
      if (!profile?.tenant_id) {
        throw new Error('No tenant selected');
      }

      // Auto-assign logic
      let assignedTo = taskData.assigned_to;
      if (!assignedTo) {
        assignedTo = await autoAssignTask(taskData, profile);
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          assigned_to: assignedTo,
          tenant_id: profile.tenant_id,
          metadata: {
            auto_assigned: !taskData.assigned_to,
            created_by: profile.id,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task created",
        description: "The task has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create task",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTaskMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update task",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete task",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

// Helper functions
const autoAssignTask = async (taskData: CreateTaskRequest, profile: any): Promise<string | undefined> => {
  try {
    // Get department members with current workload
    const { data: departmentUsers } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('department', profile.department)
      .eq('is_active', true)
      .eq('tenant_id', profile.tenant_id)
      .neq('role', 'admin');

    if (!departmentUsers?.length) return undefined;

    // Get current task counts for each user
    const userWorkloads = await Promise.all(
      departmentUsers.map(async (user) => {
        const { count } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', user.id)
          .in('status', ['pending', 'in_progress']);

        return { user, taskCount: count || 0 };
      })
    );

    // Find user with lowest workload
    const assignedUser = userWorkloads.reduce((min, current) =>
      current.taskCount < min.taskCount ? current : min
    );

    return assignedUser.user.id;
  } catch (error) {
    console.error('Auto-assignment failed:', error);
    return undefined;
  }
};

const generateTimerAlerts = (task: any) => {
  const alerts = [];
  
  // 2-day timer alert for urgent tasks
  if (task.priority === 'urgent' && task.status !== 'completed') {
    alerts.push({
      id: `timer-${task.id}`,
      task_id: task.id,
      duration_minutes: 2 * 24 * 60, // 2 days
      trigger_time: new Date(new Date(task.created_at).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      is_triggered: false,
      notification_sent: false,
    });
  }
  
  // Due date alerts
  if (task.due_date && task.status !== 'completed') {
    alerts.push({
      id: `due-${task.id}`,
      task_id: task.id,
      duration_minutes: 0,
      trigger_time: task.due_date,
      is_triggered: new Date() > new Date(task.due_date),
      notification_sent: false,
    });
  }
  
  return alerts;
};