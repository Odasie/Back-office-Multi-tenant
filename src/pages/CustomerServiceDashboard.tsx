import { useAuth } from "@/contexts/AuthContext";
import { useCustomerService } from "@/contexts/CustomerServiceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportTicketsTable } from "@/components/dashboard/SupportTicketsTable";
import { FeedbackInsights } from "@/components/dashboard/FeedbackInsights";
import { DepartmentHandoff } from "@/components/dashboard/DepartmentHandoff";
import { Headphones, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect } from "react";

export default function CustomerServiceDashboard() {
  const { user } = useAuth();
  const { 
    tickets, 
    loading, 
    totalTickets,
    averageResolutionTime,
    fetchTickets
  } = useCustomerService();

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicketsCount = tickets.filter(ticket => ticket.status === 'open').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in_progress').length;
  const resolvedTicketsCount = tickets.filter(ticket => ticket.status === 'resolved').length;
  const highPriorityTickets = tickets.filter(ticket => ticket.priority === 'high').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Customer Service Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage support tickets and customer feedback
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DepartmentHandoff 
                currentDepartment="customer_service"
                entityType="ticket"
                onHandoff={(department) => console.log('Handoff to:', department)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                  <p className="text-2xl font-bold text-foreground">{openTicketsCount}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{inProgressTickets}</p>
                </div>
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-foreground">{resolvedTicketsCount}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-foreground">{highPriorityTickets}</p>
                </div>
                <Badge variant="destructive">{highPriorityTickets}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Resolution</p>
                  <p className="text-2xl font-bold text-foreground">
                    {averageResolutionTime ? `${averageResolutionTime}h` : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Support Tickets Table - 8 columns */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Support Tickets
                </CardTitle>
                <CardDescription>
                  Manage and track customer support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupportTicketsTable tickets={tickets} />
              </CardContent>
            </Card>
          </div>

          {/* Feedback Insights - 4 columns */}
          <div className="lg:col-span-4">
            <FeedbackInsights />
          </div>
        </div>
      </div>
    </div>
  );
}