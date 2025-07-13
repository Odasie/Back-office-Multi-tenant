import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, CreditCard, Building } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';

// Animated counter hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + increment;
        if (next >= end) {
          clearInterval(timer);
          return end;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return Math.floor(count);
};

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down';
  trendData?: { value: number }[];
  delay?: number;
}

function KPICard({ title, value, prefix = '', suffix = '', change, icon: Icon, trend, trendData, delay = 0 }: KPICardProps) {
  const animatedValue = useCounter(value, 2000 + delay);
  const isPositive = trend === 'up';

  return (
    <Card className="hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {prefix}{typeof value === 'number' ? animatedValue.toLocaleString() : value}{suffix}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          
          {trendData && (
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FinanceKPICards() {
  const financeContext = useFinance();
  
  if (!financeContext) {
    return <div>Loading finance data...</div>;
  }

  const { totalRevenue, paidAmount, outstandingAmount } = financeContext;

  // Calculate financial metrics
  const evaneosFee = totalRevenue * 0.12; // 12% Evaneos commission
  const netRevenue = totalRevenue - evaneosFee;
  const grossMargin = totalRevenue * 0.35; // Estimated 35% gross margin
  const netMargin = grossMargin - evaneosFee;
  const marginPercentage = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;
  const b2bCommissions = totalRevenue * 0.08; // Estimated 8% B2B commissions

  // Mock trend data
  const revenueTrend = [
    { value: netRevenue * 0.85 }, { value: netRevenue * 0.90 }, { value: netRevenue * 0.95 },
    { value: netRevenue * 0.98 }, { value: netRevenue * 1.02 }, { value: netRevenue }
  ];

  const marginTrend = [
    { value: marginPercentage * 0.92 }, { value: marginPercentage * 0.95 }, { value: marginPercentage * 0.98 },
    { value: marginPercentage * 1.01 }, { value: marginPercentage * 1.03 }, { value: marginPercentage }
  ];

  const commissionTrend = [
    { value: b2bCommissions * 0.88 }, { value: b2bCommissions * 0.93 }, { value: b2bCommissions * 0.97 },
    { value: b2bCommissions * 1.02 }, { value: b2bCommissions * 1.05 }, { value: b2bCommissions }
  ];

  const outstandingTrend = [
    { value: outstandingAmount * 1.15 }, { value: outstandingAmount * 1.08 }, { value: outstandingAmount * 1.02 },
    { value: outstandingAmount * 0.98 }, { value: outstandingAmount * 0.95 }, { value: outstandingAmount }
  ];

  const kpis = [
    {
      title: 'Net Revenue (After Evaneos)',
      value: netRevenue,
      prefix: '฿',
      change: 8.5,
      icon: DollarSign,
      trend: 'up' as const,
      trendData: revenueTrend,
      delay: 0
    },
    {
      title: 'Net Margin',
      value: marginPercentage,
      suffix: '%',
      change: 12.3,
      icon: Percent,
      trend: 'up' as const,
      trendData: marginTrend,
      delay: 200
    },
    {
      title: 'B2B Commissions',
      value: b2bCommissions,
      prefix: '฿',
      change: 15.7,
      icon: Building,
      trend: 'up' as const,
      trendData: commissionTrend,
      delay: 400
    },
    {
      title: 'Outstanding Payments',
      value: outstandingAmount,
      prefix: '฿',
      change: -18.2,
      icon: CreditCard,
      trend: 'down' as const,
      trendData: outstandingTrend,
      delay: 600
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}