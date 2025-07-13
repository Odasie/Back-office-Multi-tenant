import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import DepartmentKPICards from '@/components/dashboard/DepartmentKPICards';
import LeadVolumeChart from '@/components/dashboard/LeadVolumeChart';

export default function InsightsDashboard() {
  const { user, loading } = useAuth();
  const { profile } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Insights Dashboard</h1>
            <p className="text-muted-foreground">
              Analytics and insights across all departments
            </p>
          </div>
        </div>

        {/* Department KPI Cards with Filters */}
        <DepartmentKPICards />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadVolumeChart />
          <LeadVolumeChart type="destination" />
        </div>
      </div>
    </div>
  );
}