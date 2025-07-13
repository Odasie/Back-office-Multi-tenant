import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';
import { useLead } from '@/contexts/LeadContext';

export default function SalesInsights() {
  const { leads } = useLead();

  // Calculate insights from leads data
  const sourceData = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(sourceData).map(([name, value]) => ({ name, value }));
  const statusChartData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

  // Calculate conversion rate by source
  const conversionBySource = Object.entries(sourceData).map(([source, total]) => {
    const converted = leads.filter(lead => 
      (lead.source === source) && 
      (lead.status === 'booked' || lead.status === 'completed')
    ).length;
    const rate = total > 0 ? (converted / total) * 100 : 0;
    return { source, rate, total, converted };
  }).sort((a, b) => b.rate - a.rate);

  // Top destinations
  const destinationData = leads.reduce((acc, lead) => {
    const destination = lead.destination || 'Unknown';
    acc[destination] = (acc[destination] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDestinations = Object.entries(destinationData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([destination, count]) => ({ destination, count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Sales Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lead Sources Chart */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Lead Sources</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rates by Source */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Conversion by Source</h4>
          <div className="space-y-3">
            {conversionBySource.slice(0, 4).map((item, index) => (
              <div key={item.source} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{item.source}</span>
                  <span className="text-muted-foreground">
                    {item.rate.toFixed(1)}% ({item.converted}/{item.total})
                  </span>
                </div>
                <Progress value={item.rate} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Top Destinations</h4>
          <div className="space-y-2">
            {topDestinations.map((item, index) => (
              <div key={item.destination} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-success' : 
                    index === 1 ? 'bg-warning' : 
                    index === 2 ? 'bg-primary' : 'bg-muted'
                  }`} />
                  <span className="text-sm text-foreground">{item.destination}</span>
                </div>
                <Badge variant="outline" className="bg-background">
                  {item.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Quick Insights</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
              <Award className="h-4 w-4 text-success mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-success">Best Performing Source</div>
                <div className="text-muted-foreground">
                  {conversionBySource[0]?.source} with {conversionBySource[0]?.rate.toFixed(1)}% conversion
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <Target className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-warning">Popular Destination</div>
                <div className="text-muted-foreground">
                  {topDestinations[0]?.destination} leads the demand with {topDestinations[0]?.count} leads
                </div>
              </div>
            </div>

            {conversionBySource.some(item => item.rate < 10) && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-destructive">Needs Attention</div>
                  <div className="text-muted-foreground">
                    Some sources have low conversion rates. Consider optimization.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}