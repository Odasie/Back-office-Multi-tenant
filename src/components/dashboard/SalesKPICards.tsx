import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLead } from '@/contexts/LeadContext';
import { useUser } from '@/contexts/UserContext';

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

export default function SalesKPICards() {
  const { leads } = useLead();
  const { profile } = useUser();

  // Calculate KPIs from leads data
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(lead => lead.status === 'booked' || lead.status === 'completed').length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  const totalRevenue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const avgDealSize = totalLeads > 0 ? totalRevenue / totalLeads : 0;

  // Mock trend data - in real app, this would come from historical data
  const revenueTrend = [
    { value: 820000 }, { value: 850000 }, { value: 890000 }, { value: 920000 },
    { value: 950000 }, { value: 980000 }, { value: totalRevenue }
  ];

  const leadsTrend = [
    { value: 38 }, { value: 42 }, { value: 45 }, { value: 48 },
    { value: 52 }, { value: 55 }, { value: totalLeads }
  ];

  const conversionTrend = [
    { value: 22 }, { value: 24 }, { value: 26 }, { value: 28 },
    { value: 30 }, { value: 32 }, { value: conversionRate }
  ];

  const dealSizeTrend = [
    { value: 65000 }, { value: 68000 }, { value: 70000 }, { value: 72000 },
    { value: 74000 }, { value: 76000 }, { value: avgDealSize }
  ];

  const kpis = [
    {
      title: 'Total Revenue',
      value: totalRevenue,
      prefix: '฿',
      change: 12.5,
      icon: DollarSign,
      trend: 'up' as const,
      trendData: revenueTrend,
      delay: 0
    },
    {
      title: 'Total Leads',
      value: totalLeads,
      change: 8.2,
      icon: Users,
      trend: 'up' as const,
      trendData: leadsTrend,
      delay: 200
    },
    {
      title: 'Conversion Rate',
      value: conversionRate,
      suffix: '%',
      change: 4.1,
      icon: Target,
      trend: 'up' as const,
      trendData: conversionTrend,
      delay: 400
    },
    {
      title: 'Avg Deal Size',
      value: avgDealSize,
      prefix: '฿',
      change: -2.3,
      icon: Clock,
      trend: 'down' as const,
      trendData: dealSizeTrend,
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