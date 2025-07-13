import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Users, Trophy, Target, TrendingUp, TrendingDown, UserCheck, Settings, Award } from 'lucide-react';
import { useLead } from '@/contexts/LeadContext';
import { mockUsers } from '@/data/mockData';

// Mock performance data - in real app, this would come from analytics
const mockPerformanceData = {
  'Sarah Smith': {
    leadsAssigned: 8,
    leadsConverted: 3,
    conversionRate: 37.5,
    totalRevenue: 287000,
    avgDealSize: 95667,
    responseTime: 2.1,
    customerRating: 4.8,
    trend: 'up',
    weeklyData: [
      { day: 'Mon', leads: 2, converted: 1 },
      { day: 'Tue', leads: 1, converted: 0 },
      { day: 'Wed', leads: 3, converted: 1 },
      { day: 'Thu', leads: 1, converted: 1 },
      { day: 'Fri', leads: 1, converted: 0 },
    ]
  },
  'John Doe': {
    leadsAssigned: 6,
    leadsConverted: 2,
    conversionRate: 33.3,
    totalRevenue: 320000,
    avgDealSize: 160000,
    responseTime: 1.8,
    customerRating: 4.9,
    trend: 'up',
    weeklyData: [
      { day: 'Mon', leads: 1, converted: 0 },
      { day: 'Tue', leads: 2, converted: 1 },
      { day: 'Wed', leads: 1, converted: 0 },
      { day: 'Thu', leads: 2, converted: 1 },
      { day: 'Fri', leads: 0, converted: 0 },
    ]
  }
};

interface AgentStatsProps {
  agent: typeof mockUsers[0];
  stats: typeof mockPerformanceData['Sarah Smith'];
}

function AgentStats({ agent, stats }: AgentStatsProps) {
  const isTopPerformer = stats.conversionRate > 35;
  
  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={agent.avatar_url} />
            <AvatarFallback>
              {agent.first_name?.charAt(0)}{agent.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">
              {agent.first_name} {agent.last_name}
            </div>
            <div className="text-xs text-muted-foreground">{agent.email}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isTopPerformer && (
            <Badge className="bg-success text-success-foreground">
              <Trophy className="h-3 w-3 mr-1" />
              Top
            </Badge>
          )}
          {stats.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 rounded bg-accent/50">
          <div className="text-sm font-bold text-foreground">{stats.leadsAssigned}</div>
          <div className="text-xs text-muted-foreground">Assigned</div>
        </div>
        <div className="text-center p-2 rounded bg-success/20">
          <div className="text-sm font-bold text-success">{stats.leadsConverted}</div>
          <div className="text-xs text-muted-foreground">Converted</div>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Conversion Rate</span>
          <span className="font-medium text-foreground">{stats.conversionRate}%</span>
        </div>
        <Progress 
          value={stats.conversionRate} 
          className="h-2"
        />
      </div>

      {/* Additional Metrics */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Revenue:</span>
          <span className="font-medium text-foreground">฿{stats.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Avg Deal Size:</span>
          <span className="font-medium text-foreground">฿{stats.avgDealSize.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Response Time:</span>
          <span className="font-medium text-foreground">{stats.responseTime}h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rating:</span>
          <span className="font-medium text-foreground">{stats.customerRating}/5.0</span>
        </div>
      </div>
    </div>
  );
}

export default function AgentPerformancePanel() {
  const { leads } = useLead();
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Get sales agents
  const salesAgents = mockUsers.filter(user => user.department === 'sales');
  
  // Get unassigned leads
  const unassignedLeads = leads.filter(lead => !lead.assigned_agent_id);

  const handleBulkAssign = () => {
    // In real app, this would call the API to assign leads
    console.log('Assigning leads:', selectedLeads, 'to agent:', selectedAgent);
    setIsBulkAssignOpen(false);
    setSelectedLeads([]);
    setSelectedAgent('');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Performance
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsBulkAssignOpen(true)}
              disabled={unassignedLeads.length === 0}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Bulk Assign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Team Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-lg font-bold text-primary">{salesAgents.length}</div>
                  <div className="text-xs text-muted-foreground">Active Agents</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="text-lg font-bold text-warning">{unassignedLeads.length}</div>
                  <div className="text-xs text-muted-foreground">Unassigned</div>
                </div>
              </div>

              {/* Agent Performance Cards */}
              <div className="space-y-3">
                {salesAgents.map(agent => {
                  const fullName = `${agent.first_name} ${agent.last_name}`;
                  const stats = mockPerformanceData[fullName as keyof typeof mockPerformanceData];
                  
                  if (!stats) return null;
                  
                  return (
                    <AgentStats key={agent.id} agent={agent} stats={stats} />
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {/* Detailed Charts and Analytics */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Weekly Performance</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockPerformanceData['Sarah Smith'].weeklyData}>
                      <XAxis dataKey="day" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="leads" fill="hsl(var(--primary))" />
                      <Bar dataKey="converted" fill="hsl(var(--success))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performers */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Rankings</h4>
                <div className="space-y-2">
                  {Object.entries(mockPerformanceData)
                    .sort(([,a], [,b]) => b.conversionRate - a.conversionRate)
                    .map(([name, stats], index) => (
                      <div key={name} className="flex items-center justify-between p-2 rounded bg-accent/30">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-success text-success-foreground' :
                            index === 1 ? 'bg-warning text-warning-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm text-foreground">{name}</span>
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {stats.conversionRate}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bulk Assignment Dialog */}
      <Dialog open={isBulkAssignOpen} onOpenChange={setIsBulkAssignOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Lead Assignment</DialogTitle>
            <DialogDescription>
              Assign multiple unassigned leads to a sales agent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Agent Selection */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Select Agent
              </label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {salesAgents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lead Selection */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Select Leads ({unassignedLeads.length} unassigned)
              </label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 bg-background">
                {unassignedLeads.length > 0 ? (
                  unassignedLeads.map(lead => (
                    <div key={lead.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                      <input
                        type="checkbox"
                        id={lead.id}
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads([...selectedLeads, lead.id]);
                          } else {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                          }
                        }}
                        className="rounded border-border"
                      />
                      <label htmlFor={lead.id} className="text-sm text-foreground cursor-pointer flex-1">
                        {lead.title} - {lead.customer_name}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No unassigned leads available
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkAssignOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAssign}
              disabled={!selectedAgent || selectedLeads.length === 0}
            >
              Assign {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}