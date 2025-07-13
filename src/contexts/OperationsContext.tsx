import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Task, TaskStatus, TaskFilters, CreateTaskRequest } from '@/types/models';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';

interface OperationsContextType {
  tasks: Task[];
  loading: boolean;
  filters: TaskFilters;
  activeTimer: string | null;
  timerStart: Date | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: CreateTaskRequest) => Promise<{ error: any; data?: Task }>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<{ error: any }>;
  deleteTask: (taskId: string) => Promise<{ error: any }>;
  assignTask: (taskId: string, userId: string) => Promise<{ error: any }>;
  
  // Timer functionality
  startTimer: (taskId: string) => void;
  stopTimer: (taskId: string) => Promise<{ error: any }>;
  pauseTimer: () => void;
  getElapsedTime: () => number; // in minutes
  
  // Filters
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  
  // Bulk operations
  markTasksComplete: (taskIds: string[]) => Promise<{ error: any }>;
  bulkAssignTasks: (taskIds: string[], userId: string) => Promise<{ error: any }>;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};

interface OperationsProviderProps {
  children: ReactNode;
}

const defaultFilters: TaskFilters = {};

export const OperationsProvider = ({ children }: OperationsProviderProps) => {
  const { profile } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!profile?.tenant_id) return;
    
    setLoading(true);
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
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      
      if (filters.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      
      if (filters.assigned_to?.length) {
        query = query.in('assigned_to', filters.assigned_to);
      }
      
      if (filters.due_date_range) {
        query = query
          .gte('due_date', filters.due_date_range.start)
          .lte('due_date', filters.due_date_range.end);
      }

      // Apply role-based filtering
      if (profile.role === 'agent') {
        // Agents can only see their own tasks or unassigned tasks
        query = query.or(`assigned_to.eq.${profile.id},assigned_to.is.null`);
      } else if (profile.role === 'manager' && profile.department) {
        // Managers can see tasks in their department
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

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskRequest) => {
    if (!profile?.tenant_id) return { error: 'No tenant selected' };
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          tenant_id: profile.tenant_id,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Failed to create task",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Task created",
        description: "The task has been successfully created.",
      });

      // Refresh tasks
      await fetchTasks();
      
      return { error: null, data };
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) {
        toast({
          title: "Failed to update task",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      });

      // Refresh tasks
      await fetchTasks();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to update task",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        toast({
          title: "Failed to delete task",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });

      // Refresh tasks
      await fetchTasks();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to delete task",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const assignTask = async (taskId: string, userId: string) => {
    return updateTask(taskId, { assigned_to: userId });
  };

  // Timer functionality
  const startTimer = (taskId: string) => {
    // Stop any existing timer
    if (activeTimer) {
      stopTimer(activeTimer);
    }
    
    setActiveTimer(taskId);
    setTimerStart(new Date());
    
    toast({
      title: "Timer started",
      description: "Time tracking has been started for this task.",
    });
  };

  const stopTimer = async (taskId: string) => {
    if (!timerStart) return { error: 'No timer active' };
    
    const elapsedMinutes = getElapsedTime();
    
    // Find the current task and add elapsed time
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newTimeSpent = task.time_spent + elapsedMinutes;
      const result = await updateTask(taskId, { time_spent: newTimeSpent });
      
      if (!result.error) {
        setActiveTimer(null);
        setTimerStart(null);
        
        toast({
          title: "Timer stopped",
          description: `${elapsedMinutes} minutes have been logged to this task.`,
        });
      }
      
      return result;
    }
    
    return { error: 'Task not found' };
  };

  const pauseTimer = () => {
    if (activeTimer) {
      stopTimer(activeTimer);
    }
  };

  const getElapsedTime = (): number => {
    if (!timerStart) return 0;
    const now = new Date();
    const elapsedMs = now.getTime() - timerStart.getTime();
    return Math.floor(elapsedMs / (1000 * 60)); // Convert to minutes
  };

  const markTasksComplete = async (taskIds: string[]) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .in('id', taskIds);

      if (error) {
        toast({
          title: "Failed to update tasks",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Tasks completed",
        description: `${taskIds.length} tasks have been marked as completed.`,
      });

      // Refresh tasks
      await fetchTasks();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to update tasks",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const bulkAssignTasks = async (taskIds: string[], userId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: userId })
        .in('id', taskIds);

      if (error) {
        toast({
          title: "Failed to assign tasks",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Tasks assigned",
        description: `${taskIds.length} tasks have been assigned.`,
      });

      // Refresh tasks
      await fetchTasks();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to assign tasks",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchTasks();
    }
  }, [profile?.tenant_id, filters]);

  // Real-time subscriptions
  useEffect(() => {
    if (!profile?.tenant_id) return;
    
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `tenant_id=eq.${profile.tenant_id}`,
        },
        () => {
          setTimeout(() => {
            fetchTasks();
          }, 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.tenant_id]);

  // Timer cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeTimer && timerStart) {
        // Save timer state to localStorage for recovery
        localStorage.setItem('activeTimer', JSON.stringify({
          taskId: activeTimer,
          startTime: timerStart.toISOString(),
        }));
      }
    };
  }, [activeTimer, timerStart]);

  // Recover timer on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem('activeTimer');
    if (savedTimer) {
      try {
        const { taskId, startTime } = JSON.parse(savedTimer);
        setActiveTimer(taskId);
        setTimerStart(new Date(startTime));
        localStorage.removeItem('activeTimer');
      } catch (error) {
        console.error('Error recovering timer:', error);
        localStorage.removeItem('activeTimer');
      }
    }
  }, []);

  const value = {
    tasks,
    loading,
    filters,
    activeTimer,
    timerStart,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    startTimer,
    stopTimer,
    pauseTimer,
    getElapsedTime,
    setFilters,
    clearFilters,
    markTasksComplete,
    bulkAssignTasks,
  };

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
};