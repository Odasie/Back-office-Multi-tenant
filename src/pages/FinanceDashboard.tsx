import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Navigate } from 'react-router-dom';
import FinanceKPICards from '@/components/dashboard/FinanceKPICards';
import ReconciliationTable from '@/components/dashboard/ReconciliationTable';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import CommissionTracker from '@/components/dashboard/CommissionTracker';

export default function FinanceDashboard() {
  const { user, loading } = useAuth();
  const { profile } = useUser();
  const financeContext = useFinance();

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

  if (!financeContext) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Finance context not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finance Dashboard</h1>
            <p className="text-muted-foreground">
              Manage revenue, commissions, and financial operations
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <FinanceKPICards />

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CashFlowChart />
          <CommissionTracker />
        </div>

        {/* Reconciliation Table */}
        <ReconciliationTable />
      </div>
    </div>
  );
}