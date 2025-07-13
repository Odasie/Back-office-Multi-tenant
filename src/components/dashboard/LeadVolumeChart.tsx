import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, MapPin, Calendar } from 'lucide-react';

// Mock data for lead volume by channel
const leadVolumeByChannel = [
  { name: 'Website', leads: 45, conversion: 28, value: 890000 },
  { name: 'Social Media', leads: 32, conversion: 18, value: 520000 },
  { name: 'Referral', leads: 28, conversion: 22, value: 680000 },
  { name: 'Google Ads', leads: 35, conversion: 25, value: 750000 },
  { name: 'Partner Agency', leads: 18, conversion: 12, value: 420000 },
  { name: 'Cold Call', leads: 12, conversion: 8, value: 280000 }
];

// Mock data for lead volume by destination
const leadVolumeByDestination = [
  { name: 'Phuket', leads: 38, conversion: 24, value: 950000 },
  { name: 'Bangkok', leads: 42, conversion: 28, value: 1120000 },
  { name: 'Chiang Mai', leads: 28, conversion: 18, value: 640000 },
  { name: 'Koh Samui', leads: 22, conversion: 15, value: 580000 },
  { name: 'Krabi', leads: 18, conversion: 12, value: 420000 },
  { name: 'Hua Hin', leads: 15, conversion: 10, value: 350000 }
];

interface LeadVolumeChartProps {
  type?: 'channel' | 'destination';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        <p className="text-sm text-primary">Leads: {data.leads}</p>
        <p className="text-sm text-success">Conversions: {data.conversion}</p>
        <p className="text-sm text-muted-foreground">
          Value: ฿{data.value.toLocaleString()}
        </p>
        <p className="text-sm text-warning">
          Rate: {((data.conversion / data.leads) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function LeadVolumeChart({ type = 'channel' }: LeadVolumeChartProps) {
  const [viewMode, setViewMode] = useState<'leads' | 'conversion'>('leads');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const isChannelView = type === 'channel';
  const data = isChannelView ? leadVolumeByChannel : leadVolumeByDestination;
  const title = isChannelView ? 'Lead Volume by Channel' : 'Lead Volume by Destination';
  const icon = isChannelView ? BarChart3 : MapPin;

  const dataKey = viewMode === 'leads' ? 'leads' : 'conversion';
  const barColor = viewMode === 'leads' ? 'hsl(var(--primary))' : 'hsl(var(--success))';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {React.createElement(icon, { className: "w-5 h-5" })}
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'leads' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('leads')}
            >
              Leads
            </Button>
            <Button
              variant={viewMode === 'conversion' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('conversion')}
            >
              Conversions
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="h-7 px-2 text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                fill={barColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Leads</div>
            <div className="text-lg font-semibold text-primary">
              {data.reduce((sum, item) => sum + item.leads, 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Conversions</div>
            <div className="text-lg font-semibold text-success">
              {data.reduce((sum, item) => sum + item.conversion, 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Rate</div>
            <div className="text-lg font-semibold text-warning">
              {(
                (data.reduce((sum, item) => sum + item.conversion, 0) / 
                 data.reduce((sum, item) => sum + item.leads, 0)) * 100
              ).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}