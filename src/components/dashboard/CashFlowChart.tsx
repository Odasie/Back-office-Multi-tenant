import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock cash flow data
const mockCashFlowData = [
  {
    month: 'Oct',
    inflow: 850000,
    outflow: 620000,
    net: 230000
  },
  {
    month: 'Nov',
    inflow: 920000,
    outflow: 680000,
    net: 240000
  },
  {
    month: 'Dec',
    inflow: 1100000,
    outflow: 780000,
    net: 320000
  },
  {
    month: 'Jan',
    inflow: 890000,
    outflow: 650000,
    net: 240000
  },
  {
    month: 'Feb',
    inflow: 1050000,
    outflow: 720000,
    net: 330000
  },
  {
    month: 'Mar',
    inflow: 1200000,
    outflow: 850000,
    net: 350000
  },
  {
    month: 'Apr (Proj)',
    inflow: 1150000,
    outflow: 800000,
    net: 350000
  },
  {
    month: 'May (Proj)',
    inflow: 1300000,
    outflow: 900000,
    net: 400000
  }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ฿{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CashFlowChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly cash inflow vs outflow with projections
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockCashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="inflow" 
                stroke="hsl(var(--success))" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Cash Inflow"
              />
              <Line 
                type="monotone" 
                dataKey="outflow" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Cash Outflow"
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ r: 4 }}
                strokeDasharray="5 5"
                name="Net Cash Flow"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Inflow</div>
            <div className="text-lg font-semibold text-success">฿1.07M</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Outflow</div>
            <div className="text-lg font-semibold text-destructive">฿0.74M</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Net Flow</div>
            <div className="text-lg font-semibold text-primary">฿0.32M</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}