import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bell, Search, User, Plus, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useLead } from '@/contexts/LeadContext';

// Import dashboard components
import SalesKPICards from '@/components/dashboard/SalesKPICards';
import LeadInboxTable from '@/components/dashboard/LeadInboxTable';
import LeadKanban from '@/components/dashboard/LeadKanban';
import LeadDetailDrawer from '@/components/dashboard/LeadDetailDrawer';
import QuickActions from '@/components/dashboard/QuickActions';
import SalesInsights from '@/components/dashboard/SalesInsights';
import ItineraryUpdates from '@/components/dashboard/ItineraryUpdates';
import AgentPerformancePanel from '@/components/dashboard/AgentPerformancePanel';

export default function SalesDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useUser();
  const { selectedLead, selectLead } = useLead();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showKanban, setShowKanban] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLeadSelect = (lead: any) => {
    selectLead(lead);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    selectLead(null);
  };

  const isSupervisor = profile?.role === 'manager' || profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.first_name || profile?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads, customers, destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={!showKanban ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowKanban(false)}
                >
                  Table View
                </Button>
                <Button
                  variant={showKanban ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowKanban(true)}
                >
                  Pipeline View
                </Button>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* Profile */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={signOut}
                className="hover:bg-accent"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <SalesKPICards />

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Lead Management Section */}
          <div className={`${isSupervisor ? 'col-span-8' : 'col-span-9'} space-y-6`}>
            {/* Lead Inbox / Kanban */}
            {showKanban ? (
              <LeadKanban onLeadSelect={handleLeadSelect} />
            ) : (
              <LeadInboxTable 
                searchTerm={searchTerm} 
                onLeadSelect={handleLeadSelect} 
              />
            )}

            {/* Quick Actions */}
            <QuickActions />
          </div>

          {/* Right Sidebar */}
          <div className={`${isSupervisor ? 'col-span-4' : 'col-span-3'} space-y-6`}>
            {/* Supervisor Panel (only for managers/admins) */}
            {isSupervisor && (
              <AgentPerformancePanel />
            )}

            {/* Itinerary Updates */}
            <ItineraryUpdates />

            {/* Sales Insights */}
            <SalesInsights />
          </div>
        </div>
      </main>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        lead={selectedLead}
      />
    </div>
  );
}