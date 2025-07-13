import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Target, Clock, DollarSign, Headphones, CheckCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// Mock KPI data by department
const departmentKPIs = {
  sales: [
    {
      title: 'Total Leads',
      value: 168,
      change: 12.5,
      trend: 'up' as const,
      icon: Users,
      trendData: [{ value: 145 }, { value: 152 }, { value: 160 }, { value: 168 }]
    },
    {
      title: 'Conversion Rate',
      value: 28.5,
      suffix: '%',
      change: 4.2,
      trend: 'up' as const,
      icon: Target,
      trendData: [{ value: 24.1 }, { value: 26.3 }, { value: 27.8 }, { value: 28.5 }]
    },
    {
      title: 'Revenue',
      value: 2840000,
      prefix: '฿',
      change: 15.8,
      trend: 'up' as const,
      icon: DollarSign,
      trendData: [{ value: 2200000 }, { value: 2450000 }, { value: 2650000 }, { value: 2840000 }]
    },
    {
      title: 'Avg Deal Size',
      value: 68500,
      prefix: '฿',
      change: -2.1,
      trend: 'down' as const,
      icon: Clock,
      trendData: [{ value: 72000 }, { value: 70500 }, { value: 69200 }, { value: 68500 }]
    }
  ],
  operations: [
    {
      title: 'Tasks Completed',
      value: 142,
      change: 8.7,
      trend: 'up' as const,
      icon: CheckCircle,
      trendData: [{ value: 125 }, { value: 135 }, { value: 138 }, { value: 142 }]
    },
    {
      title: 'On-Time Rate',
      value: 94.2,
      suffix: '%',
      change: 3.5,
      trend: 'up' as const,
      icon: Clock,
      trendData: [{ value: 89.1 }, { value: 91.2 }, { value: 92.8 }, { value: 94.2 }]
    },
    {
      title: 'Avg Task Time',
      value: 2.3,
      suffix: ' hrs',
      change: -12.5,
      trend: 'down' as const,
      icon: Target,
      trendData: [{ value: 2.8 }, { value: 2.6 }, { value: 2.4 }, { value: 2.3 }]
    },
    {
      title: 'Active Bookings',
      value: 85,
      change: 5.2,
      trend: 'up' as const,
      icon: Users,
      trendData: [{ value: 78 }, { value: 81 }, { value: 83 }, { value: 85 }]
    }
  ],
  customer_service: [
    {
      title: 'Tickets Resolved',
      value: 89,
      change: 15.2,
      trend: 'up' as const,
      icon: CheckCircle,
      trendData: [{ value: 72 }, { value: 78 }, { value: 84 }, { value: 89 }]
    },
    {
      title: 'Response Time',
      value: 1.8,
      suffix: ' hrs',
      change: -18.5,
      trend: 'down' as const,
      icon: Clock,
      trendData: [{ value: 2.4 }, { value: 2.1 }, { value: 1.9 }, { value: 1.8 }]
    },
    {
      title: 'Satisfaction Score',
      value: 4.7,
      suffix: '/5',
      change: 6.8,
      trend: 'up' as const,
      icon: Target,
      trendData: [{ value: 4.3 }, { value: 4.5 }, { value: 4.6 }, { value: 4.7 }]
    },
    {
      title: 'Open Tickets',
      value: 12,
      change: -25.0,
      trend: 'down' as const,
      icon: Headphones,
      trendData: [{ value: 18 }, { value: 16 }, { value: 14 }, { value: 12 }]
    }
  ],
  finance: [
    {
      title: 'Revenue',
      value: 2840000,
      prefix: '฿',
      change: 15.8,
      trend: 'up' as const,
      icon: DollarSign,
      trendData: [{ value: 2200000 }, { value: 2450000 }, { value: 2650000 }, { value: 2840000 }]
    },
    {
      title: 'Collection Rate',
      value: 92.5,
      suffix: '%',
      change: 8.2,
      trend: 'up' as const,
      icon: Target,
      trendData: [{ value: 86.1 }, { value: 88.7 }, { value: 90.5 }, { value: 92.5 }]
    },
    {
      title: 'Outstanding',
      value: 285000,
      prefix: '฿',
      change: -15.2,
      trend: 'down' as const,
      icon: Clock,
      trendData: [{ value: 345000 }, { value: 320000 }, { value: 305000 }, { value: 285000 }]
    },
    {
      title: 'Profit Margin',
      value: 38.5,
      suffix: '%',
      change: 4.1,
      trend: 'up' as const,
      icon: TrendingUp,
      trendData: [{ value: 35.2 }, { value: 36.8 }, { value: 37.5 }, { value: 38.5 }]
    }
  ]
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
}

function KPICard({ title, value, prefix = '', suffix = '', change, icon: Icon, trend, trendData }: KPICardProps) {
  const isPositive = trend === 'up';

  return (
    <Card className="hover:shadow-card transition-all duration-300 hover:-translate-y-1">
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
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
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
              <span className="text-xs text-muted-foreground">vs last period</span>
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

export default function DepartmentKPICards() {
  const [selectedDepartment, setSelectedDepartment] = useState<keyof typeof departmentKPIs>('sales');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const departmentLabels = {
    sales: 'Sales',
    operations: 'Operations',
    customer_service: 'Customer Service',
    finance: 'Finance'
  };

  return (
    <div className="space-y-6">
      {/* Department Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Department KPIs</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Filter by department and time range
              </p>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(departmentKPIs) as Array<keyof typeof departmentKPIs>).map((dept) => (
              <Button
                key={dept}
                variant={selectedDepartment === dept ? 'default' : 'outline'}
                onClick={() => setSelectedDepartment(dept)}
              >
                {departmentLabels[dept]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departmentKPIs[selectedDepartment].map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Department Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            {departmentLabels[selectedDepartment]} Summary - Last {timeRange}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Performance Trend</div>
              <Badge variant="default" className="bg-success/10 text-success border-success/20">
                <TrendingUp className="w-3 h-3 mr-1" />
                Improving
              </Badge>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Team Utilization</div>
              <div className="text-lg font-semibold">87%</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Goal Achievement</div>
              <div className="text-lg font-semibold text-primary">94%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}