import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Payment, Booking, FinancialDetail, PaymentStatus } from '@/types/models';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';

interface FinanceContextType {
  payments: Payment[];
  bookings: Booking[];
  financialDetails: FinancialDetail[];
  loading: boolean;
  
  // Summary metrics
  totalRevenue: number;
  outstandingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  
  // Actions
  fetchFinancialData: () => Promise<void>;
  updatePaymentStatus: (paymentId: string, status: PaymentStatus) => Promise<{ error: any }>;
  recordPayment: (bookingId: string, amount: number, paymentMethod?: string) => Promise<{ error: any }>;
  generateFinancialReport: (startDate: string, endDate: string) => Promise<{ error: any; data?: any }>;
  
  // Filters
  filterByDateRange: (startDate: string, endDate: string) => void;
  filterByStatus: (status: PaymentStatus[]) => void;
  clearFilters: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider = ({ children }: FinanceProviderProps) => {
  const { profile } = useUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [financialDetails, setFinancialDetails] = useState<FinancialDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const { toast } = useToast();

  // Calculate summary metrics
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const outstandingAmount = payments
    .filter(p => p.status === 'pending' || p.status === 'partial')
    .reduce((sum, p) => sum + p.amount, 0);

  const paidAmount = totalRevenue;

  const overdueAmount = payments
    .filter(p => {
      if (p.status !== 'pending' && p.status !== 'partial') return false;
      if (!p.due_date) return false;
      return new Date(p.due_date) < new Date();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const fetchFinancialData = async () => {
    if (!profile?.tenant_id) return;
    
    setLoading(true);
    try {
      // Fetch payments with booking relations
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(*)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        toast({
          title: "Error fetching payments",
          description: paymentsError.message,
          variant: "destructive",
        });
        return;
      }

      // Fetch bookings with payment relations
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          payments(*),
          lead:leads(*)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        toast({
          title: "Error fetching bookings",
          description: bookingsError.message,
          variant: "destructive",
        });
        return;
      }

      setPayments(paymentsData || []);
      setBookings(bookingsData || []);
      setFilteredPayments(paymentsData || []);

      // Create financial details summary
      const details = createFinancialDetails(bookingsData || [], paymentsData || []);
      setFinancialDetails(details);

    } catch (error) {
      console.error('Error in fetchFinancialData:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFinancialDetails = (bookingsData: Booking[], paymentsData: Payment[]): FinancialDetail[] => {
    return bookingsData.map(booking => {
      const bookingPayments = paymentsData.filter(p => p.booking_id === booking.id);
      const paidAmount = bookingPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const outstandingAmount = booking.total_amount - paidAmount;
      
      let paymentStatus: PaymentStatus = 'pending';
      if (paidAmount === 0) {
        paymentStatus = 'pending';
      } else if (paidAmount >= booking.total_amount) {
        paymentStatus = 'paid';
      } else {
        paymentStatus = 'partial';
      }

      // Check if any payments are overdue
      const hasOverduePayments = bookingPayments.some(p => {
        if (!p.due_date) return false;
        return new Date(p.due_date) < new Date() && (p.status === 'pending' || p.status === 'partial');
      });

      if (hasOverduePayments) {
        paymentStatus = 'overdue';
      }

      return {
        booking_id: booking.id,
        customer_name: booking.customer_name,
        destination: booking.destination,
        booking_date: booking.created_at,
        total_amount: booking.total_amount,
        paid_amount: paidAmount,
        outstanding_amount: outstandingAmount,
        payment_status: paymentStatus,
        payment_due_date: bookingPayments.find(p => p.due_date)?.due_date,
        payments: bookingPayments,
        currency: booking.currency,
      };
    });
  };

  const updatePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
    try {
      const updateData: any = { status };
      
      // If marking as paid, set paid_date
      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) {
        toast({
          title: "Failed to update payment",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Payment updated",
        description: "Payment status has been successfully updated.",
      });

      // Refresh financial data
      await fetchFinancialData();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to update payment",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const recordPayment = async (bookingId: string, amount: number, paymentMethod?: string) => {
    if (!profile?.tenant_id) return { error: 'No tenant selected' };
    
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          tenant_id: profile.tenant_id,
          booking_id: bookingId,
          amount,
          payment_method: paymentMethod,
          status: 'paid',
          paid_date: new Date().toISOString(),
          transaction_id: `TXN_${Date.now()}`, // Simple transaction ID generation
        });

      if (error) {
        toast({
          title: "Failed to record payment",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Payment recorded",
        description: "Payment has been successfully recorded.",
      });

      // Refresh financial data
      await fetchFinancialData();
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to record payment",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const generateFinancialReport = async (startDate: string, endDate: string) => {
    try {
      const { data: reportData, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(*)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {
        toast({
          title: "Failed to generate report",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Process report data
      const report = {
        period: { start: startDate, end: endDate },
        total_revenue: reportData
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0),
        total_transactions: reportData.length,
        payment_methods: reportData.reduce((acc, p) => {
          const method = p.payment_method || 'unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        daily_revenue: calculateDailyRevenue(reportData, startDate, endDate),
      };

      return { error: null, data: report };
    } catch (error: any) {
      toast({
        title: "Failed to generate report",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const calculateDailyRevenue = (payments: Payment[], startDate: string, endDate: string) => {
    const dailyRevenue: Record<string, number> = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Initialize all dates with 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyRevenue[dateStr] = 0;
    }
    
    // Add revenue for each date
    payments
      .filter(p => p.status === 'paid' && p.paid_date)
      .forEach(payment => {
        const dateStr = payment.paid_date!.split('T')[0];
        if (dailyRevenue[dateStr] !== undefined) {
          dailyRevenue[dateStr] += payment.amount;
        }
      });
    
    return dailyRevenue;
  };

  const filterByDateRange = (startDate: string, endDate: string) => {
    const filtered = payments.filter(payment => {
      const paymentDate = payment.created_at.split('T')[0];
      return paymentDate >= startDate && paymentDate <= endDate;
    });
    setFilteredPayments(filtered);
  };

  const filterByStatus = (statuses: PaymentStatus[]) => {
    const filtered = payments.filter(payment => statuses.includes(payment.status));
    setFilteredPayments(filtered);
  };

  const clearFilters = () => {
    setFilteredPayments(payments);
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchFinancialData();
    }
  }, [profile?.tenant_id]);

  // Real-time subscriptions
  useEffect(() => {
    if (!profile?.tenant_id) return;
    
    const paymentsChannel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `tenant_id=eq.${profile.tenant_id}`,
        },
        () => {
          setTimeout(() => {
            fetchFinancialData();
          }, 0);
        }
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `tenant_id=eq.${profile.tenant_id}`,
        },
        () => {
          setTimeout(() => {
            fetchFinancialData();
          }, 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [profile?.tenant_id]);

  const value = {
    payments: filteredPayments,
    bookings,
    financialDetails,
    loading,
    totalRevenue,
    outstandingAmount,
    paidAmount,
    overdueAmount,
    fetchFinancialData,
    updatePaymentStatus,
    recordPayment,
    generateFinancialReport,
    filterByDateRange,
    filterByStatus,
    clearFilters,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};