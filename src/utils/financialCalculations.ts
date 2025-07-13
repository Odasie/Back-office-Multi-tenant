import { Booking, CommissionRule, FinancialCalculation } from '@/types/models';

// Default commission rules
const defaultCommissionRules: CommissionRule[] = [
  {
    id: 'standard-55-10',
    name: 'Standard 55% + 10%',
    booking_type: 'domestic',
    calculation_type: 'percentage',
    base_rate: 0.55,
    markup_rate: 0.10,
    evaneos_commission: 0.12,
    is_active: true,
  },
  {
    id: 'flat-45',
    name: 'Flat 45%',
    booking_type: 'international',
    calculation_type: 'percentage',
    base_rate: 0.45,
    evaneos_commission: 0.12,
    is_active: true,
  },
  {
    id: 'b2b-custom',
    name: 'B2B Custom Rate',
    booking_type: 'b2b',
    calculation_type: 'percentage',
    base_rate: 0.35,
    markup_rate: 0.15,
    evaneos_commission: 0.12,
    b2b_commission: 0.05,
    is_active: true,
  },
  {
    id: 'group-tiered',
    name: 'Group Booking Tiered',
    booking_type: 'group',
    calculation_type: 'tiered',
    base_rate: 0.40,
    markup_rate: 0.12,
    evaneos_commission: 0.12,
    is_active: true,
    conditions: {
      tiers: [
        { min: 0, max: 5000, rate: 0.40 },
        { min: 5001, max: 15000, rate: 0.45 },
        { min: 15001, max: Infinity, rate: 0.50 },
      ],
    },
  },
];

export const calculateCommission = (
  booking: Booking,
  customRules?: CommissionRule[]
): FinancialCalculation => {
  const rules = customRules || defaultCommissionRules;
  const rule = rules.find(r => r.booking_type === booking.booking_type && r.is_active) 
               || rules[0]; // Fallback to first rule

  const grossAmount = booking.total_amount;
  let baseCommission = 0;
  let markupCommission = 0;

  // Calculate base commission
  if (rule.calculation_type === 'percentage') {
    baseCommission = grossAmount * rule.base_rate;
  } else if (rule.calculation_type === 'tiered' && rule.conditions?.tiers) {
    const tier = rule.conditions.tiers.find(t => 
      grossAmount >= t.min && grossAmount <= t.max
    );
    baseCommission = grossAmount * (tier?.rate || rule.base_rate);
  } else if (rule.calculation_type === 'fixed') {
    baseCommission = rule.base_rate;
  }

  // Calculate markup commission
  if (rule.markup_rate) {
    markupCommission = baseCommission * rule.markup_rate;
  }

  // Calculate Evaneos commission (percentage of gross)
  const evaneosCommission = grossAmount * rule.evaneos_commission;

  // Calculate B2B commission if applicable
  const b2bCommission = rule.b2b_commission ? grossAmount * rule.b2b_commission : 0;

  // Calculate net profit
  const totalCommissions = baseCommission + markupCommission + evaneosCommission + b2bCommission;
  const netProfit = grossAmount - totalCommissions;
  const marginPercentage = (netProfit / grossAmount) * 100;

  return {
    booking_id: booking.id,
    gross_amount: grossAmount,
    base_commission: baseCommission,
    markup_commission: markupCommission,
    evaneos_commission: evaneosCommission,
    b2b_commission: b2bCommission,
    net_profit: netProfit,
    margin_percentage: marginPercentage,
    calculation_breakdown: {
      'Gross Amount': grossAmount,
      'Base Commission': baseCommission,
      'Markup Commission': markupCommission,
      'Evaneos Commission (12%)': evaneosCommission,
      'B2B Commission': b2bCommission,
      'Total Commissions': totalCommissions,
      'Net Profit': netProfit,
      'Margin %': marginPercentage,
    },
  };
};

export const calculateRevenueMetrics = (bookings: Booking[]) => {
  const calculations = bookings.map(booking => calculateCommission(booking));
  
  const totalRevenue = calculations.reduce((sum, calc) => sum + calc.gross_amount, 0);
  const totalCommissions = calculations.reduce((sum, calc) => 
    sum + calc.base_commission + calc.markup_commission + calc.evaneos_commission + calc.b2b_commission, 0);
  const totalNetProfit = calculations.reduce((sum, calc) => sum + calc.net_profit, 0);
  const averageMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

  // Revenue by booking type
  const revenueByType = bookings.reduce((acc, booking) => {
    acc[booking.booking_type] = (acc[booking.booking_type] || 0) + booking.total_amount;
    return acc;
  }, {} as Record<string, number>);

  // Monthly revenue trend (last 12 months)
  const monthlyRevenue = bookings.reduce((acc, booking) => {
    const month = new Date(booking.created_at).toISOString().slice(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + booking.total_amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRevenue,
    totalCommissions,
    totalNetProfit,
    averageMargin,
    revenueByType,
    monthlyRevenue,
    bookingCount: bookings.length,
    averageBookingValue: totalRevenue / bookings.length || 0,
  };
};

export const calculateAgentCommissions = (bookings: Booking[], agentId: string) => {
  const agentBookings = bookings.filter(b => 
    (b as any).assigned_agent_id === agentId || 
    (b.lead as any)?.assigned_agent_id === agentId
  );
  
  const calculations = agentBookings.map(booking => calculateCommission(booking));
  
  const totalSales = calculations.reduce((sum, calc) => sum + calc.gross_amount, 0);
  const totalCommissionEarned = calculations.reduce((sum, calc) => 
    sum + calc.base_commission + calc.markup_commission, 0);
  const totalNetProfit = calculations.reduce((sum, calc) => sum + calc.net_profit, 0);

  return {
    agentId,
    totalSales,
    totalCommissionEarned,
    totalNetProfit,
    bookingCount: agentBookings.length,
    averageDealSize: totalSales / agentBookings.length || 0,
    conversionMetrics: {
      salesVolume: totalSales,
      profitContribution: totalNetProfit,
      marginPercentage: totalSales > 0 ? (totalNetProfit / totalSales) * 100 : 0,
    },
  };
};

export const generateProfitLossStatement = (
  bookings: Booking[], 
  expenses: { category: string; amount: number; description: string }[] = []
) => {
  const revenueMetrics = calculateRevenueMetrics(bookings);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Operating expenses breakdown
  const operatingExpenses = {
    salaries: totalExpenses * 0.60, // Estimated 60% of expenses are salaries
    marketing: totalExpenses * 0.15,
    technology: totalExpenses * 0.10,
    operations: totalExpenses * 0.10,
    other: totalExpenses * 0.05,
  };

  const grossProfit = revenueMetrics.totalNetProfit;
  const operatingProfit = grossProfit - totalExpenses;
  const netProfit = operatingProfit; // Simplified - would include taxes, interest, etc.

  return {
    revenue: {
      grossRevenue: revenueMetrics.totalRevenue,
      commissionsPaid: revenueMetrics.totalCommissions,
      netRevenue: revenueMetrics.totalNetProfit,
    },
    expenses: {
      total: totalExpenses,
      breakdown: operatingExpenses,
      byCategory: expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>),
    },
    profit: {
      grossProfit,
      operatingProfit,
      netProfit,
      margins: {
        gross: (grossProfit / revenueMetrics.totalRevenue) * 100,
        operating: (operatingProfit / revenueMetrics.totalRevenue) * 100,
        net: (netProfit / revenueMetrics.totalRevenue) * 100,
      },
    },
    kpis: {
      revenuePerBooking: revenueMetrics.averageBookingValue,
      profitPerBooking: netProfit / revenueMetrics.bookingCount,
      commissionRate: (revenueMetrics.totalCommissions / revenueMetrics.totalRevenue) * 100,
    },
  };
};

import React from 'react';

// Auto-calculation hooks for real-time updates
export const useRealtimeFinancialCalculations = (bookings: Booking[]) => {
  const [calculations, setCalculations] = React.useState<FinancialCalculation[]>([]);
  const [metrics, setMetrics] = React.useState<any>(null);

  React.useEffect(() => {
    const newCalculations = bookings.map(booking => calculateCommission(booking));
    setCalculations(newCalculations);
    
    const newMetrics = calculateRevenueMetrics(bookings);
    setMetrics(newMetrics);
  }, [bookings]);

  return {
    calculations,
    metrics,
    recalculate: () => {
      const newCalculations = bookings.map(booking => calculateCommission(booking));
      setCalculations(newCalculations);
      setMetrics(calculateRevenueMetrics(bookings));
    },
  };
};