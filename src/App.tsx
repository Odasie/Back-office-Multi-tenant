import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { LeadProvider } from "@/contexts/LeadContext";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { OperationsProvider } from "@/contexts/OperationsContext";
import { CustomerServiceProvider } from "@/contexts/CustomerServiceContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import SettingsImports from "./pages/SettingsImports";
import SalesDashboard from "./pages/SalesDashboard";
import OperationsDashboard from "./pages/OperationsDashboard";
import CustomerServiceDashboard from "./pages/CustomerServiceDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import InsightsDashboard from "./pages/InsightsDashboard";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <UserProvider>
          <LeadProvider>
            <FinanceProvider>
              <OperationsProvider>
                <CustomerServiceProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* Auth route without layout */}
                      <Route path="/auth" element={<Auth />} />
                      
                      {/* Protected routes with layout */}
                      <Route path="/" element={<AppLayout />}>
                        <Route index element={<Index />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="settings/imports" element={<SettingsImports />} />
                        <Route path="dashboard/sales" element={<SalesDashboard />} />
                        <Route path="dashboard/operations" element={<OperationsDashboard />} />
                        <Route path="dashboard/customer-service" element={<CustomerServiceDashboard />} />
                        <Route path="finance" element={<FinanceDashboard />} />
                        <Route path="insights" element={<InsightsDashboard />} />
                        <Route path="dashboard/:department" element={<Index />} />
                      </Route>
                      
                      {/* 404 catch-all */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </CustomerServiceProvider>
              </OperationsProvider>
            </FinanceProvider>
          </LeadProvider>
        </UserProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
