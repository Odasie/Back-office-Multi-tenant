import { useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useCreateNotificationMutation } from '@/hooks/api/useNotificationsQuery';
import { useToast } from '@/hooks/use-toast';
import { Lead, Task, HandoffRecord, WorkflowAlert } from '@/types/models';

interface AutomationConfig {
  enableAutoTagging: boolean;
  enableTimerAlerts: boolean;
  enableAutoHandoffs: boolean;
  timerThresholds: {
    urgent: number; // hours
    high: number;
    medium: number;
    low: number;
  };
}

const defaultConfig: AutomationConfig = {
  enableAutoTagging: true,
  enableTimerAlerts: true,
  enableAutoHandoffs: true,
  timerThresholds: {
    urgent: 2,
    high: 24,
    medium: 48,
    low: 72,
  },
};

export const useAutomation = (config: Partial<AutomationConfig> = {}) => {
  const { profile } = useUser();
  const { toast } = useToast();
  const createNotification = useCreateNotificationMutation();
  
  const automationConfig = useMemo(() => ({
    ...defaultConfig,
    ...config,
  }), [config]);

  // Auto-tagging system
  const generateAutoTags = (lead: Lead): string[] => {
    if (!automationConfig.enableAutoTagging) return [];

    const tags: string[] = [];
    
    // Source-based tagging
    const sourceTagMap: Record<string, string[]> = {
      'website': ['organic', 'direct'],
      'referral': ['referral', 'trusted'],
      'social': ['social-media', 'viral'],
      'email': ['email-campaign', 'nurture'],
      'phone': ['cold-call', 'outbound'],
      'walk-in': ['local', 'immediate'],
    };
    
    if (lead.source && sourceTagMap[lead.source]) {
      tags.push(...sourceTagMap[lead.source]);
    }

    // Value-based tagging
    if (lead.estimated_value) {
      if (lead.estimated_value > 5000) tags.push('premium', 'high-value');
      else if (lead.estimated_value > 2500) tags.push('standard', 'medium-value');
      else if (lead.estimated_value > 1000) tags.push('budget', 'low-value');
      else tags.push('economy');
    }

    // Destination-based tagging
    if (lead.destination) {
      const destination = lead.destination.toLowerCase();
      if (destination.includes('thailand')) tags.push('domestic');
      else tags.push('international');
      
      if (destination.includes('phuket') || destination.includes('samui') || destination.includes('krabi')) {
        tags.push('beach', 'island');
      }
      if (destination.includes('bangkok')) tags.push('city', 'business');
      if (destination.includes('chiang mai')) tags.push('cultural', 'mountain');
    }

    // Booking type tagging
    if (lead.booking_type === 'b2b') tags.push('corporate', 'b2b');
    if (lead.booking_type === 'group') tags.push('group', 'multiple-travelers');
    if (lead.booking_type === 'international') tags.push('overseas');

    // Time-sensitive tagging
    const daysSinceCreated = Math.floor(
      (new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCreated > 7) tags.push('follow-up-needed');
    if (daysSinceCreated > 14) tags.push('stale', 'urgent-attention');
    if (daysSinceCreated <= 1) tags.push('fresh', 'new');

    // Customer behavior tagging
    if (lead.customer_email?.includes('gmail') || lead.customer_email?.includes('yahoo')) {
      tags.push('personal');
    } else if (lead.customer_email?.includes('.com') && !lead.customer_email?.includes('gmail')) {
      tags.push('business');
    }

    return [...new Set(tags)]; // Remove duplicates
  };

  // Timer alert system
  const checkTimerAlerts = (tasks: Task[]): WorkflowAlert[] => {
    if (!automationConfig.enableTimerAlerts) return [];

    const alerts: WorkflowAlert[] = [];
    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'completed' || task.status === 'cancelled') return;

      const createdAt = new Date(task.created_at);
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const threshold = automationConfig.timerThresholds[task.priority as keyof typeof automationConfig.timerThresholds] || 24;

      if (hoursElapsed > threshold) {
        alerts.push({
          id: `timer-${task.id}`,
          type: 'timer',
          priority: task.priority === 'urgent' ? 'urgent' : 'high',
          message: `Task "${task.title}" has exceeded ${threshold} hour threshold`,
          trigger_date: new Date(createdAt.getTime() + threshold * 60 * 60 * 1000).toISOString(),
          is_active: true,
          metadata: {
            task_id: task.id,
            threshold_hours: threshold,
            hours_elapsed: Math.floor(hoursElapsed),
          },
        });
      }

      // Due date alerts
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        if (now > dueDate) {
          alerts.push({
            id: `overdue-${task.id}`,
            type: 'deadline',
            priority: 'urgent',
            message: `Task "${task.title}" is overdue`,
            trigger_date: task.due_date,
            is_active: true,
            metadata: {
              task_id: task.id,
              days_overdue: Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
            },
          });
        }
      }
    });

    return alerts;
  };

  // Auto-handoff system
  const determineHandoffNeeded = (lead: Lead): HandoffRecord | null => {
    if (!automationConfig.enableAutoHandoffs) return null;

    // B2B leads need operations involvement
    if (lead.booking_type === 'b2b' && lead.department === 'sales' && 
        ['qualified', 'proposal_sent'].includes(lead.status)) {
      return {
        id: `handoff-${lead.id}`,
        entity_type: 'lead',
        entity_id: lead.id,
        from_department: 'sales',
        to_department: 'operations',
        handoff_reason: 'B2B booking requires operations coordination',
        handoff_date: new Date().toISOString(),
        status: 'pending',
      };
    }

    // High-value leads need manager approval
    if (lead.estimated_value && lead.estimated_value > 5000 && 
        lead.status === 'negotiating' && lead.department === 'sales') {
      return {
        id: `handoff-${lead.id}`,
        entity_type: 'lead',
        entity_id: lead.id,
        from_department: 'sales',
        to_department: 'management',
        handoff_reason: 'High-value booking requires manager approval',
        handoff_date: new Date().toISOString(),
        status: 'pending',
      };
    }

    // Payment issues need finance involvement
    if (lead.status === 'confirmed' && lead.department !== 'finance') {
      return {
        id: `handoff-${lead.id}`,
        entity_type: 'lead',
        entity_id: lead.id,
        from_department: lead.department,
        to_department: 'finance',
        handoff_reason: 'Confirmed booking needs payment processing',
        handoff_date: new Date().toISOString(),
        status: 'pending',
      };
    }

    return null;
  };

  // Email template generator
  const generateEmailTemplate = (type: 'b2b' | 'third_party' | 'customer' | 'internal', context: any) => {
    const templates = {
      b2b: {
        subject: 'Business Partnership Proposal - {{customer_name}}',
        body: `Dear {{partner_name}},

We hope this email finds you well. We are reaching out regarding a business opportunity for {{customer_name}}.

Details:
- Destination: {{destination}}
- Travel Dates: {{travel_dates}}
- Group Size: {{group_size}}
- Estimated Value: {{estimated_value}}

We would appreciate your competitive proposal for this booking. Please include:
- Detailed itinerary
- Pricing breakdown
- Terms and conditions
- Availability confirmation

We look forward to your response within 48 hours.

Best regards,
{{agent_name}}
{{company_name}}`,
      },
      third_party: {
        subject: 'Booking Confirmation Required - {{booking_reference}}',
        body: `Dear Partner,

Please confirm the following booking details:

Booking Reference: {{booking_reference}}
Customer: {{customer_name}}
Destination: {{destination}}
Dates: {{travel_dates}}
Services: {{services}}

Required Actions:
- Confirm availability
- Provide final pricing
- Send vouchers/confirmations

Please respond by {{confirmation_deadline}}.

Thank you for your cooperation.

Best regards,
{{agent_name}}`,
      },
      customer: {
        subject: 'Your {{destination}} Trip Update - {{booking_reference}}',
        body: `Dear {{customer_name}},

Thank you for choosing us for your {{destination}} adventure!

Current Status: {{status}}
{{#if next_steps}}
Next Steps: {{next_steps}}
{{/if}}

We will keep you updated on your booking progress. Please don't hesitate to contact us if you have any questions.

Best regards,
{{agent_name}}
{{company_name}}`,
      },
      internal: {
        subject: 'Task Assignment - {{task_title}}',
        body: `Team Member,

You have been assigned a new task:

Task: {{task_title}}
Priority: {{priority}}
Due Date: {{due_date}}
Related to: {{related_entity}}

Description:
{{description}}

Please acknowledge receipt and provide updates as needed.

Best regards,
System Automation`,
      },
    };

    return templates[type] || templates.internal;
  };

  // Notification sender
  const sendAutomationNotification = async (alert: WorkflowAlert, userId: string) => {
    try {
      await createNotification.mutateAsync({
        user_id: userId,
        title: alert.type === 'timer' ? 'Timer Alert' : 
               alert.type === 'deadline' ? 'Deadline Alert' : 
               alert.type === 'handoff' ? 'Handoff Required' : 'System Alert',
        message: alert.message,
        type: alert.type,
        priority: alert.priority,
        is_read: false,
        metadata: alert.metadata,
      });
    } catch (error) {
      console.error('Failed to send automation notification:', error);
    }
  };

  // Main automation processor
  const processAutomations = async (leads: Lead[], tasks: Task[]) => {
    if (!profile?.id) return;

    // Process timer alerts
    const timerAlerts = checkTimerAlerts(tasks);
    for (const alert of timerAlerts) {
      await sendAutomationNotification(alert, profile.id);
    }

    // Process handoff requirements
    for (const lead of leads) {
      const handoff = determineHandoffNeeded(lead);
      if (handoff) {
        await sendAutomationNotification({
          id: handoff.id,
          type: 'handoff',
          priority: 'medium',
          message: `Handoff required: ${handoff.handoff_reason}`,
          trigger_date: handoff.handoff_date,
          is_active: true,
          metadata: handoff,
        }, profile.id);
      }
    }

    // Show summary toast if there are alerts
    const totalAlerts = timerAlerts.length;
    if (totalAlerts > 0) {
      toast({
        title: "Automation Alerts",
        description: `${totalAlerts} automated alerts have been processed`,
      });
    }
  };

  return {
    generateAutoTags,
    checkTimerAlerts,
    determineHandoffNeeded,
    generateEmailTemplate,
    processAutomations,
    config: automationConfig,
  };
};