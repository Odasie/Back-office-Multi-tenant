import { Lead, User, Booking, Payment, Task, Ticket, KpiData, FinancialDetail } from '@/types/models';

// Mock Users (Agents/Staff)
export const mockUsers: User[] = [
  {
    id: '1',
    user_id: 'user-1',
    tenant_id: 'tenant-1',
    email: 'john.doe@odasie.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'manager',
    department: 'sales',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+66 2 123 4567',
    is_active: true,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-2',
    tenant_id: 'tenant-1',
    email: 'sarah.smith@odasie.com',
    first_name: 'Sarah',
    last_name: 'Smith',
    role: 'agent',
    department: 'sales',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=150&h=150&fit=crop&crop=face',
    phone: '+66 2 123 4568',
    is_active: true,
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-3',
    tenant_id: 'tenant-1',
    email: 'mike.johnson@odasie.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    role: 'agent',
    department: 'operations',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+66 2 123 4569',
    is_active: true,
    created_at: '2024-01-17T09:00:00Z',
    updated_at: '2024-01-17T09:00:00Z',
  },
  {
    id: '4',
    user_id: 'user-4',
    tenant_id: 'tenant-1',
    email: 'emma.wilson@odasie.com',
    first_name: 'Emma',
    last_name: 'Wilson',
    role: 'manager',
    department: 'finance',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+66 2 123 4570',
    is_active: true,
    created_at: '2024-01-18T09:00:00Z',
    updated_at: '2024-01-18T09:00:00Z',
  },
  {
    id: '5',
    user_id: 'user-5',
    tenant_id: 'tenant-1',
    email: 'alex.chen@odasie.com',
    first_name: 'Alex',
    last_name: 'Chen',
    role: 'agent',
    department: 'customer_service',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    phone: '+66 2 123 4571',
    is_active: true,
    created_at: '2024-01-19T09:00:00Z',
    updated_at: '2024-01-19T09:00:00Z',
  }
];

// Mock Leads
export const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    tenant_id: 'tenant-1',
    title: 'Bangkok to Phuket Family Vacation',
    customer_name: 'Robert Johnson',
    customer_email: 'robert.johnson@email.com',
    customer_phone: '+1 555 0123',
    source: 'Website',
    destination: 'Phuket',
    booking_type: 'domestic',
    status: 'new',
    estimated_value: 85000,
    assigned_agent_id: '2',
    department: 'sales',
    notes: 'Family of 4 looking for luxury resort with kids activities',
    metadata: { guests: 4, duration: '7 days' },
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T10:30:00Z',
    assigned_agent: mockUsers[1],
    days_since_created: 3,
    progress_percentage: 10,
  },
  {
    id: 'lead-2',
    tenant_id: 'tenant-1',
    title: 'Singapore Business Trip',
    customer_name: 'Maria Rodriguez',
    customer_email: 'maria.rodriguez@company.com',
    customer_phone: '+1 555 0124',
    source: 'Referral',
    destination: 'Singapore',
    booking_type: 'international',
    status: 'contacted',
    estimated_value: 45000,
    assigned_agent_id: '2',
    department: 'sales',
    notes: 'Corporate client, needs flexible dates',
    metadata: { guests: 1, duration: '4 days' },
    created_at: '2024-01-19T14:15:00Z',
    updated_at: '2024-01-21T09:20:00Z',
    assigned_agent: mockUsers[1],
    days_since_created: 4,
    progress_percentage: 20,
  },
  {
    id: 'lead-3',
    tenant_id: 'tenant-1',
    title: 'Chiang Mai Cultural Tour',
    customer_name: 'David Kim',
    customer_email: 'david.kim@email.com',
    customer_phone: '+1 555 0125',
    source: 'Social Media',
    destination: 'Chiang Mai',
    booking_type: 'domestic',
    status: 'qualified',
    estimated_value: 32000,
    assigned_agent_id: '1',
    department: 'sales',
    notes: 'Interested in authentic cultural experiences',
    metadata: { guests: 2, duration: '5 days' },
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-01-22T15:30:00Z',
    assigned_agent: mockUsers[0],
    days_since_created: 5,
    progress_percentage: 35,
  },
  {
    id: 'lead-4',
    tenant_id: 'tenant-1',
    title: 'Group Tour to Japan',
    customer_name: 'Jennifer Brown',
    customer_email: 'jennifer.brown@agency.com',
    customer_phone: '+1 555 0126',
    source: 'Partner Agency',
    destination: 'Tokyo, Japan',
    booking_type: 'b2b',
    status: 'awaiting_agency_confirm',
    estimated_value: 250000,
    assigned_agent_id: '1',
    department: 'sales',
    notes: 'Large group booking through partner agency',
    metadata: { guests: 25, duration: '10 days' },
    created_at: '2024-01-17T16:45:00Z',
    updated_at: '2024-01-23T11:15:00Z',
    assigned_agent: mockUsers[0],
    days_since_created: 6,
    progress_percentage: 75,
  },
  {
    id: 'lead-5',
    tenant_id: 'tenant-1',
    title: 'Honeymoon in Krabi',
    customer_name: 'Michael & Lisa Thompson',
    customer_email: 'mike.lisa@email.com',
    customer_phone: '+1 555 0127',
    source: 'Google Ads',
    destination: 'Krabi',
    booking_type: 'domestic',
    status: 'proposal_sent',
    estimated_value: 65000,
    assigned_agent_id: '2',
    department: 'sales',
    notes: 'Honeymoon package with romantic activities',
    metadata: { guests: 2, duration: '7 days' },
    created_at: '2024-01-16T13:20:00Z',
    updated_at: '2024-01-22T10:00:00Z',
    assigned_agent: mockUsers[1],
    days_since_created: 7,
    progress_percentage: 50,
  },
  {
    id: 'lead-6',
    tenant_id: 'tenant-1',
    title: 'Corporate Retreat Koh Samui',
    customer_name: 'Tech Innovations Ltd',
    customer_email: 'events@techinnovations.com',
    customer_phone: '+66 2 555 0100',
    source: 'Cold Call',
    destination: 'Koh Samui',
    booking_type: 'corporate',
    status: 'negotiating',
    estimated_value: 180000,
    assigned_agent_id: '1',
    department: 'sales',
    notes: 'Annual company retreat, 30 employees',
    metadata: { guests: 30, duration: '4 days' },
    created_at: '2024-01-15T09:30:00Z',
    updated_at: '2024-01-23T14:20:00Z',
    assigned_agent: mockUsers[0],
    days_since_created: 8,
    progress_percentage: 65,
  }
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    tenant_id: 'tenant-1',
    lead_id: 'lead-completed-1',
    booking_reference: 'ODS-2024-001',
    customer_name: 'Amanda Wilson',
    customer_email: 'amanda.wilson@email.com',
    customer_phone: '+1 555 0200',
    destination: 'Pattaya',
    booking_type: 'domestic',
    start_date: '2024-02-15',
    end_date: '2024-02-20',
    total_amount: 75000,
    currency: 'THB',
    status: 'confirmed',
    itinerary_data: {
      hotel: 'Hilton Pattaya',
      activities: ['City Tour', 'Beach Day', 'Floating Market'],
      transportation: 'Private Car'
    },
    created_at: '2024-01-10T15:30:00Z',
    updated_at: '2024-01-10T15:30:00Z',
  },
  {
    id: 'booking-2',
    tenant_id: 'tenant-1',
    lead_id: 'lead-completed-2',
    booking_reference: 'ODS-2024-002',
    customer_name: 'James Miller',
    customer_email: 'james.miller@email.com',
    customer_phone: '+1 555 0201',
    destination: 'Hua Hin',
    booking_type: 'domestic',
    start_date: '2024-02-28',
    end_date: '2024-03-05',
    total_amount: 92000,
    currency: 'THB',
    status: 'confirmed',
    itinerary_data: {
      hotel: 'InterContinental Hua Hin Resort',
      activities: ['Golf', 'Spa Day', 'Night Market'],
      transportation: 'Private Transfer'
    },
    created_at: '2024-01-12T11:20:00Z',
    updated_at: '2024-01-12T11:20:00Z',
  }
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    tenant_id: 'tenant-1',
    booking_id: 'booking-1',
    amount: 37500,
    currency: 'THB',
    payment_method: 'Credit Card',
    transaction_id: 'TXN_001_20240110',
    status: 'paid',
    due_date: '2024-01-15',
    paid_date: '2024-01-10T16:00:00Z',
    notes: 'Deposit payment - 50%',
    created_at: '2024-01-10T16:00:00Z',
    updated_at: '2024-01-10T16:00:00Z',
  },
  {
    id: 'payment-2',
    tenant_id: 'tenant-1',
    booking_id: 'booking-1',
    amount: 37500,
    currency: 'THB',
    payment_method: 'Bank Transfer',
    transaction_id: 'TXN_002_20240205',
    status: 'pending',
    due_date: '2024-02-10',
    notes: 'Final payment - 50%',
    created_at: '2024-01-10T16:00:00Z',
    updated_at: '2024-01-10T16:00:00Z',
  },
  {
    id: 'payment-3',
    tenant_id: 'tenant-1',
    booking_id: 'booking-2',
    amount: 46000,
    currency: 'THB',
    payment_method: 'Credit Card',
    transaction_id: 'TXN_003_20240112',
    status: 'paid',
    due_date: '2024-01-17',
    paid_date: '2024-01-12T12:00:00Z',
    notes: 'Deposit payment - 50%',
    created_at: '2024-01-12T12:00:00Z',
    updated_at: '2024-01-12T12:00:00Z',
  },
  {
    id: 'payment-4',
    tenant_id: 'tenant-1',
    booking_id: 'booking-2',
    amount: 46000,
    currency: 'THB',
    payment_method: 'Bank Transfer',
    transaction_id: null,
    status: 'overdue',
    due_date: '2024-01-20',
    notes: 'Final payment - 50% (OVERDUE)',
    created_at: '2024-01-12T12:00:00Z',
    updated_at: '2024-01-12T12:00:00Z',
  }
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    tenant_id: 'tenant-1',
    title: 'Prepare itinerary for Johnson family',
    description: 'Create detailed 7-day itinerary for Bangkok-Phuket trip',
    assigned_to: '3',
    related_lead_id: 'lead-1',
    status: 'in_progress',
    priority: 'high',
    due_date: '2024-01-25T17:00:00Z',
    time_spent: 45,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-23T10:30:00Z',
    assignee: mockUsers[2],
  },
  {
    id: 'task-2',
    tenant_id: 'tenant-1',
    title: 'Follow up on Singapore business trip',
    description: 'Call Maria Rodriguez regarding travel dates',
    assigned_to: '2',
    related_lead_id: 'lead-2',
    status: 'pending',
    priority: 'medium',
    due_date: '2024-01-24T15:00:00Z',
    time_spent: 0,
    created_at: '2024-01-21T11:00:00Z',
    updated_at: '2024-01-21T11:00:00Z',
    assignee: mockUsers[1],
  },
  {
    id: 'task-3',
    tenant_id: 'tenant-1',
    title: 'Send revised quote for Corporate Retreat',
    description: 'Update pricing for Koh Samui corporate package',
    assigned_to: '1',
    related_lead_id: 'lead-6',
    status: 'completed',
    priority: 'high',
    due_date: '2024-01-22T12:00:00Z',
    completed_at: '2024-01-22T11:30:00Z',
    time_spent: 120,
    created_at: '2024-01-20T14:00:00Z',
    updated_at: '2024-01-22T11:30:00Z',
    assignee: mockUsers[0],
  },
  {
    id: 'task-4',
    tenant_id: 'tenant-1',
    title: 'Process payment for Hua Hin booking',
    description: 'Follow up on overdue payment from James Miller',
    assigned_to: '4',
    related_booking_id: 'booking-2',
    status: 'pending',
    priority: 'urgent',
    due_date: '2024-01-24T09:00:00Z',
    time_spent: 15,
    created_at: '2024-01-21T16:00:00Z',
    updated_at: '2024-01-23T08:00:00Z',
    assignee: mockUsers[3],
  }
];

// Mock Tickets
export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    tenant_id: 'tenant-1',
    title: 'Hotel room upgrade request',
    description: 'Customer requesting room upgrade for honeymoon package',
    customer_email: 'mike.lisa@email.com',
    customer_phone: '+1 555 0127',
    assigned_to: '5',
    status: 'open',
    priority: 'medium',
    category: 'Accommodation',
    related_booking_id: null,
    created_at: '2024-01-22T14:30:00Z',
    updated_at: '2024-01-22T14:30:00Z',
    assignee: mockUsers[4],
  },
  {
    id: 'ticket-2',
    tenant_id: 'tenant-1',
    title: 'Flight change due to weather',
    description: 'Need to reschedule flights due to storm warnings',
    customer_email: 'amanda.wilson@email.com',
    customer_phone: '+1 555 0200',
    assigned_to: '5',
    status: 'in_progress',
    priority: 'urgent',
    category: 'Transportation',
    related_booking_id: 'booking-1',
    created_at: '2024-01-23T08:15:00Z',
    updated_at: '2024-01-23T10:00:00Z',
    assignee: mockUsers[4],
  },
  {
    id: 'ticket-3',
    tenant_id: 'tenant-1',
    title: 'Dietary requirements not noted',
    description: 'Customer has food allergies that were not recorded',
    customer_email: 'james.miller@email.com',
    customer_phone: '+1 555 0201',
    assigned_to: '5',
    status: 'resolved',
    priority: 'high',
    category: 'Special Requirements',
    related_booking_id: 'booking-2',
    resolution: 'Updated booking with dietary requirements, contacted hotel directly',
    created_at: '2024-01-20T16:45:00Z',
    updated_at: '2024-01-21T09:30:00Z',
    assignee: mockUsers[4],
  }
];

// Mock KPI Data
export const mockKpiData: KpiData[] = [
  {
    period: 'monthly',
    date_range: { start: '2024-01-01', end: '2024-01-31' },
    department: 'sales',
    metrics: {
      leads_generated: 45,
      leads_converted: 12,
      conversion_rate: 26.7,
      revenue: 890000,
      average_deal_size: 74167,
    }
  },
  {
    period: 'monthly',
    date_range: { start: '2024-01-01', end: '2024-01-31' },
    department: 'operations',
    metrics: {
      tasks_completed: 78,
      average_task_completion_time: 2.5,
      on_time_completion_rate: 89.7,
    }
  },
  {
    period: 'monthly',
    date_range: { start: '2024-01-01', end: '2024-01-31' },
    department: 'finance',
    metrics: {
      revenue: 890000,
      outstanding_payments: 83500,
      payment_collection_rate: 91.2,
      refund_rate: 2.1,
    }
  },
  {
    period: 'monthly',
    date_range: { start: '2024-01-01', end: '2024-01-31' },
    department: 'customer_service',
    metrics: {
      tickets_resolved: 23,
      average_resolution_time: 4.2,
      customer_satisfaction: 4.6,
      first_response_time: 1.8,
    }
  },
  {
    period: 'weekly',
    date_range: { start: '2024-01-15', end: '2024-01-21' },
    metrics: {
      leads_generated: 12,
      leads_converted: 3,
      conversion_rate: 25.0,
      revenue: 225000,
      tasks_completed: 18,
      tickets_resolved: 7,
    }
  }
];

// Mock Financial Details
export const mockFinancialDetails: FinancialDetail[] = [
  {
    booking_id: 'booking-1',
    customer_name: 'Amanda Wilson',
    destination: 'Pattaya',
    booking_date: '2024-01-10T15:30:00Z',
    total_amount: 75000,
    paid_amount: 37500,
    outstanding_amount: 37500,
    payment_status: 'partial',
    payment_due_date: '2024-02-10',
    payments: [mockPayments[0], mockPayments[1]],
    currency: 'THB',
  },
  {
    booking_id: 'booking-2',
    customer_name: 'James Miller',
    destination: 'Hua Hin',
    booking_date: '2024-01-12T11:20:00Z',
    total_amount: 92000,
    paid_amount: 46000,
    outstanding_amount: 46000,
    payment_status: 'overdue',
    payment_due_date: '2024-01-20',
    payments: [mockPayments[2], mockPayments[3]],
    currency: 'THB',
  }
];

// Helper functions for mock data
export const getMockLeadsByStatus = (status: string) => {
  return mockLeads.filter(lead => lead.status === status);
};

export const getMockLeadsByAgent = (agentId: string) => {
  return mockLeads.filter(lead => lead.assigned_agent_id === agentId);
};

export const getMockTasksByAssignee = (userId: string) => {
  return mockTasks.filter(task => task.assigned_to === userId);
};

export const getMockTicketsByStatus = (status: string) => {
  return mockTickets.filter(ticket => ticket.status === status);
};

export const getMockKpiByDepartment = (department: string) => {
  return mockKpiData.filter(kpi => kpi.department === department);
};

export const getMockOverduePayments = () => {
  return mockPayments.filter(payment => payment.status === 'overdue');
};

export const getMockRecentActivities = () => {
  return [
    {
      id: 'activity-1',
      user: mockUsers[1],
      action: 'created lead',
      entity: 'Bangkok to Phuket Family Vacation',
      timestamp: '2024-01-23T10:30:00Z',
    },
    {
      id: 'activity-2',
      user: mockUsers[0],
      action: 'updated lead status',
      entity: 'Corporate Retreat Koh Samui',
      timestamp: '2024-01-23T09:45:00Z',
    },
    {
      id: 'activity-3',
      user: mockUsers[3],
      action: 'processed payment',
      entity: 'Hua Hin booking',
      timestamp: '2024-01-23T08:15:00Z',
    },
    {
      id: 'activity-4',
      user: mockUsers[4],
      action: 'resolved ticket',
      entity: 'Dietary requirements issue',
      timestamp: '2024-01-22T16:20:00Z',
    },
    {
      id: 'activity-5',
      user: mockUsers[2],
      action: 'completed task',
      entity: 'Prepare itinerary',
      timestamp: '2024-01-22T14:10:00Z',
    }
  ];
};