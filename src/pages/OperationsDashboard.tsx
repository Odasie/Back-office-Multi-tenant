import { useAuth } from "@/contexts/AuthContext";
import { useOperations } from "@/contexts/OperationsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskListTable } from "@/components/dashboard/TaskListTable";
import { SupplierWidget } from "@/components/dashboard/SupplierWidget";
import { DepartmentHandoff } from "@/components/dashboard/DepartmentHandoff";
import { Clock, Play, Pause, Square, Timer } from "lucide-react";
import { useEffect } from "react";

export default function OperationsDashboard() {
  const { user } = useAuth();
  const { 
    tasks, 
    loading, 
    fetchTasks,
    activeTimer,
    startTimer,
    stopTimer,
    pauseTimer,
    getElapsedTime
  } = useOperations();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  const handleTimerAction = (taskId: string, action: 'start' | 'pause' | 'stop') => {
    switch (action) {
      case 'start':
        startTimer(taskId);
        break;
      case 'pause':
        pauseTimer();
        break;
      case 'stop':
        stopTimer(taskId);
        break;
    }
  };

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
              <h1 className="text-2xl font-semibold text-foreground">Operations Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage tasks, suppliers, and operational workflows
              </p>
            </div>
            <div className="flex items-center gap-4">
              {activeTimer && (
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {Math.floor(getElapsedTime() / 60)}:{(getElapsedTime() % 60).toString().padStart(2, '0')}
                      </span>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleTimerAction(activeTimer, 'pause')}
                          className="h-6 w-6 p-0"
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleTimerAction(activeTimer, 'stop')}
                          className="h-6 w-6 p-0"
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <DepartmentHandoff 
                currentDepartment="operations"
                entityType="task"
                onHandoff={(department) => console.log('Handoff to:', department)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{pendingTasks}</p>
                </div>
                <Badge variant="secondary">{pendingTasks}</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{inProgressTasks}</p>
                </div>
                <Badge variant="default">{inProgressTasks}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{completedTasks}</p>
                </div>
                <Badge variant="outline" className="border-green-500 text-green-600">
                  {completedTasks}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
                </div>
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Task List Table - 8 columns */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  Track and manage operational tasks with time tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskListTable 
                  tasks={tasks}
                  onTimerAction={handleTimerAction}
                  activeTimer={activeTimer ? { taskId: activeTimer, startTime: Date.now() } : null}
                />
              </CardContent>
            </Card>
          </div>

          {/* Supplier Widget - 4 columns */}
          <div className="lg:col-span-4">
            <SupplierWidget />
          </div>
        </div>
      </div>
    </div>
  );
}