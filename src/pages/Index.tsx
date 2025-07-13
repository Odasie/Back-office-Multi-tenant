import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, CheckSquare, Ticket, BarChart, DollarSign } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
    return null; // Will redirect to auth
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your travel business today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Leads</p>
                <p className="text-2xl font-bold">6</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-md" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed Bookings</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-md" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <CheckSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-md" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Ticket className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-lg group" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <User className="h-5 w-5" />
                Leads Management
              </CardTitle>
              <CardDescription>
                Manage and track travel leads from inquiry to booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors" 
                onClick={() => navigate('/dashboard/sales')}
                aria-label="Navigate to leads management"
              >
                View Leads
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-lg group" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <Calendar className="h-5 w-5" />
                Operations
              </CardTitle>
              <CardDescription>
                Track bookings, tasks, and operational workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors" 
                onClick={() => navigate('/dashboard/operations')}
                aria-label="Navigate to operations dashboard"
              >
                Operations Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-lg group" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <Ticket className="h-5 w-5" />
                Customer Service
              </CardTitle>
              <CardDescription>
                Handle support tickets and customer inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors" 
                onClick={() => navigate('/dashboard/customer-service')}
                aria-label="Navigate to customer service dashboard"
              >
                View Tickets
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-lg group" style={{ animationDelay: '0.7s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <DollarSign className="h-5 w-5" />
                Finance
              </CardTitle>
              <CardDescription>
                Manage revenue, payments, and commission tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors" 
                onClick={() => navigate('/finance')}
                aria-label="Navigate to finance dashboard"
              >
                Finance Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-lg group" style={{ animationDelay: '0.8s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <BarChart className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>
                Business insights, reports, and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors" 
                onClick={() => navigate('/insights')}
                aria-label="Navigate to analytics dashboard"
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-scale-in hover-scale transition-all duration-300 hover:shadow-lg group" style={{ animationDelay: '0.9s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <CheckSquare className="h-5 w-5" />
                Sales Dashboard
              </CardTitle>
              <CardDescription>
                Track sales performance, leads, and conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors" 
                onClick={() => navigate('/dashboard/sales')}
                aria-label="Navigate to sales dashboard"
              >
                Sales Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default Index;
