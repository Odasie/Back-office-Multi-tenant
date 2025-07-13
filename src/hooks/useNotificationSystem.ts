import React, { useEffect, useState, useCallback } from 'react';
import { useRealtimeNotifications } from '@/hooks/api/useNotificationsQuery';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Notification, NotificationPriority } from '@/types/models';
import { Button } from '@/components/ui/button';

interface NotificationSystemConfig {
  enableSound: boolean;
  enableDesktopNotifications: boolean;
  enableToasts: boolean;
  priorityFilter: NotificationPriority[];
  maxDisplayedNotifications: number;
}

const defaultConfig: NotificationSystemConfig = {
  enableSound: true,
  enableDesktopNotifications: true,
  enableToasts: true,
  priorityFilter: ['urgent', 'high', 'medium', 'low'],
  maxDisplayedNotifications: 5,
};

export const useNotificationSystem = (config: Partial<NotificationSystemConfig> = {}) => {
  const { profile } = useUser();
  const { toast } = useToast();
  const { notifications, createNotification, markAsRead, markAllAsRead } = useRealtimeNotifications();
  
  const [systemConfig, setSystemConfig] = useState<NotificationSystemConfig>({
    ...defaultConfig,
    ...config,
  });
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Request notification permissions on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback((priority: NotificationPriority) => {
    if (!systemConfig.enableSound) return;

    try {
      const audio = new Audio();
      
      // Different sounds for different priorities
      switch (priority) {
        case 'urgent':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmAcBSuIz/LVfzEGIXLX8M5+KgUgi83x3YQ+CRZNq+frrVGODRVAntdxnKfOzqTIzzq+2/LHdyoF';
          break;
        case 'high':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmAcBSuIz/LVfzEGIXLX8M5+KgUgi83x3YQ+CRZNq+frrVGODRVAntdxnKfOzqTIzzq+2/LHdyoF';
          break;
        default:
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmAcBSuIz/LVfzEGIXLX8M5+KgUgi83x3YQ+CRZNq+frrVGODRVAntdxnKfOzqTIzzq+2/LHdyoF';
      }
      
      audio.volume = priority === 'urgent' ? 0.8 : 0.5;
      audio.play().catch(console.error);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [systemConfig.enableSound]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: Notification) => {
    if (!systemConfig.enableDesktopNotifications || notificationPermission !== 'granted') return;

    try {
      const browserNotification = new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: false,
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
        browserNotification.close();
      };

      // Auto-close after delay based on priority
      const closeDelay = notification.priority === 'urgent' ? 10000 : 
                       notification.priority === 'high' ? 7000 : 5000;
      
      setTimeout(() => {
        browserNotification.close();
      }, closeDelay);
    } catch (error) {
      console.warn('Failed to show desktop notification:', error);
    }
  }, [systemConfig.enableDesktopNotifications, notificationPermission]);

  // Show toast notification
  const showToastNotification = useCallback((notification: Notification) => {
    if (!systemConfig.enableToasts) return;

    const variant = notification.priority === 'urgent' ? 'destructive' : 'default';
    
    toast({
      title: notification.title,
      description: notification.message,
      variant,
      action: notification.action_url ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = notification.action_url!}
        >
          View
        </Button>
      ) : undefined,
    });
  }, [systemConfig.enableToasts, toast]);

  // Process incoming notifications
  useEffect(() => {
    if (!notifications.length) return;

    const unreadNotifications = notifications
      .filter(n => !n.is_read)
      .filter(n => systemConfig.priorityFilter.includes(n.priority))
      .slice(0, systemConfig.maxDisplayedNotifications);

    unreadNotifications.forEach(notification => {
      // Play sound for high-priority notifications
      if (['urgent', 'high'].includes(notification.priority)) {
        playNotificationSound(notification.priority);
      }

      // Show desktop notification
      showDesktopNotification(notification);

      // Show toast for urgent/high priority
      if (['urgent', 'high'].includes(notification.priority)) {
        showToastNotification(notification);
      }
    });
  }, [notifications, systemConfig, playNotificationSound, showDesktopNotification, showToastNotification]);

  // Notification creation helpers
  const createTimerAlert = useCallback((taskId: string, taskTitle: string, hoursElapsed: number) => {
    return createNotification.mutateAsync({
      user_id: profile?.id || '',
      title: 'Timer Alert',
      message: `Task "${taskTitle}" has been active for ${hoursElapsed} hours`,
      type: 'timer',
      priority: hoursElapsed > 24 ? 'urgent' : 'high',
      is_read: false,
      action_url: '/dashboard/operations',
      metadata: { task_id: taskId, hours_elapsed: hoursElapsed },
    });
  }, [createNotification, profile?.id]);

  const createHandoffAlert = useCallback((entityType: string, entityId: string, fromDept: string, toDept: string) => {
    return createNotification.mutateAsync({
      user_id: profile?.id || '',
      title: 'Handoff Required',
      message: `${entityType} needs to be transferred from ${fromDept} to ${toDept}`,
      type: 'handoff',
      priority: 'medium',
      is_read: false,
      action_url: entityType === 'lead' ? '/dashboard/sales' : '/dashboard/operations',
      metadata: { entity_type: entityType, entity_id: entityId, from_department: fromDept, to_department: toDept },
    });
  }, [createNotification, profile?.id]);

  const createPaymentAlert = useCallback((bookingId: string, customerName: string, amount: number, daysPastDue: number) => {
    return createNotification.mutateAsync({
      user_id: profile?.id || '',
      title: 'Payment Overdue',
      message: `Payment of $${amount} from ${customerName} is ${daysPastDue} days overdue`,
      type: 'payment',
      priority: daysPastDue > 7 ? 'urgent' : 'high',
      is_read: false,
      action_url: '/finance',
      metadata: { booking_id: bookingId, amount, days_past_due: daysPastDue },
    });
  }, [createNotification, profile?.id]);

  const createLeadAlert = useCallback((leadId: string, leadTitle: string, alertType: string, message: string) => {
    return createNotification.mutateAsync({
      user_id: profile?.id || '',
      title: `Lead Alert: ${alertType}`,
      message: `${leadTitle}: ${message}`,
      type: 'lead',
      priority: alertType.includes('urgent') ? 'urgent' : 'medium',
      is_read: false,
      action_url: '/dashboard/sales',
      metadata: { lead_id: leadId, alert_type: alertType },
    });
  }, [createNotification, profile?.id]);

  // Update system configuration
  const updateConfig = useCallback((newConfig: Partial<NotificationSystemConfig>) => {
    setSystemConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const urgentCount = notifications.filter(n => !n.is_read && n.priority === 'urgent').length;
    const highCount = notifications.filter(n => !n.is_read && n.priority === 'high').length;
    
    return {
      total: notifications.length,
      unread: unreadCount,
      urgent: urgentCount,
      high: highCount,
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + (n.is_read ? 0 : 1);
        return acc;
      }, {} as Record<string, number>),
    };
  }, [notifications]);

  return {
    notifications,
    config: systemConfig,
    updateConfig,
    
    // Actions
    markAsRead,
    markAllAsRead,
    
    // Helpers for creating specific notification types
    createTimerAlert,
    createHandoffAlert,
    createPaymentAlert,
    createLeadAlert,
    
    // Statistics
    getNotificationStats,
    
    // Permissions
    notificationPermission,
    requestPermission: () => Notification.requestPermission().then(setNotificationPermission),
  };
};