import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPriority } from '@/types/models';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

// Sample notifications fallback
const sampleNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'sample-user',
    tenant_id: 'sample-tenant',
    title: 'Lead Follow-up Required',
    message: 'John Smith lead has been waiting for 2 days without contact',
    type: 'timer',
    priority: 'high',
    is_read: false,
    action_url: '/dashboard/sales',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'sample-user',
    tenant_id: 'sample-tenant',
    title: 'Task Handoff',
    message: 'B2B proposal task has been transferred from Sales to Operations',
    type: 'handoff',
    priority: 'medium',
    is_read: false,
    action_url: '/dashboard/operations',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'sample-user',
    tenant_id: 'sample-tenant',
    title: 'Payment Overdue',
    message: 'Payment for Bangkok Business Trip booking is 3 days overdue',
    type: 'payment',
    priority: 'urgent',
    is_read: true,
    action_url: '/finance',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  }
];

export const useNotificationsQuery = () => {
  const { profile } = useUser();
  
  return useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        return { data: sampleNotifications, error: null };
      }

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .or('expires_at.is.null,expires_at.gt.now()')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return { data: data || [], error: null };
      } catch (error) {
        console.warn('Failed to fetch notifications, using sample data:', error);
        return { data: sampleNotifications, error };
      }
    },
    enabled: !!profile?.id,
    refetchInterval: 30000,
  });
};

export const useUnreadNotificationsCount = () => {
  const { profile } = useUser();
  
  return useQuery({
    queryKey: ['notifications-unread-count', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        return sampleNotifications.filter(n => !n.is_read).length;
      }

      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('is_read', false)
          .or('expires_at.is.null,expires_at.gt.now()');

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.warn('Failed to fetch unread count:', error);
        return sampleNotifications.filter(n => !n.is_read).length;
      }
    },
    enabled: !!profile?.id,
    refetchInterval: 10000,
  });
};

export const useMarkNotificationReadMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to mark notification as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const { profile } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('No user profile');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast({
        title: "All notifications marked as read",
        description: "You're all caught up!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to mark notifications as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateNotificationMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: (error: any) => {
      console.error('Failed to create notification:', error);
    },
  });
};

export const useRealtimeNotifications = () => {
  const { profile } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications } = useNotificationsQuery();

  React.useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          if (['urgent', 'high'].includes(newNotification.priority)) {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
              action: newNotification.action_url ? 
                React.createElement(ToastAction, {
                  altText: "View details",
                  onClick: () => window.location.href = newNotification.action_url!
                }, "View") : undefined,
            });
          }

          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, queryClient, toast]);

  return {
    notifications: notifications?.data || [],
    createNotification: useCreateNotificationMutation(),
    markAsRead: useMarkNotificationReadMutation(),
    markAllAsRead: useMarkAllNotificationsReadMutation(),
  };
};