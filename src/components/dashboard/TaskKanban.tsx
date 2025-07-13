import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, User, Calendar, AlertTriangle, Timer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Task, TaskStatus, DragDropTask, TaskColumn } from '@/types/models';
import { useTasksQuery, useUpdateTaskMutation } from '@/hooks/api/useTasksQuery';
import { useOperations } from '@/contexts/OperationsContext';

interface TaskKanbanProps {
  onTaskSelect: (task: Task) => void;
}

const statusColumns: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: 'pending', title: 'Pending', color: 'bg-blue-100 text-blue-800' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100 text-green-800' },
  { id: 'cancelled', title: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-blue-50 border-blue-200',
  in_progress: 'bg-yellow-50 border-yellow-200',
  completed: 'bg-green-50 border-green-200',
  cancelled: 'bg-red-50 border-red-200',
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800',
};

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

function TaskCard({ task, index, onClick }: TaskCardProps) {
  const { activeTimer, startTimer, stopTimer, getElapsedTime } = useOperations();
  const isTimerActive = activeTimer === task.id;
  const elapsedTime = isTimerActive ? getElapsedTime() : 0;
  const totalTime = task.time_spent + elapsedTime;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const isOverdue = task.due_date && new Date() > new Date(task.due_date);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            mb-3 cursor-pointer transition-all duration-200 hover:shadow-md
            ${snapshot.isDragging ? 'rotate-3 shadow-lg' : ''}
            ${statusColors[task.status]}
            ${isOverdue ? 'border-red-300 bg-red-50' : ''}
          `}
          onClick={onClick}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium line-clamp-2">
                {task.title}
              </CardTitle>
              <div className="flex items-center gap-1 ml-2">
                <Badge variant="outline" className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                {isOverdue && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {task.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="space-y-2">
              {task.assignee && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignee.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.first_name?.[0]}{task.assignee.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {task.assignee.first_name} {task.assignee.last_name}
                  </span>
                </div>
              )}
              
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(totalTime)}
                  </span>
                  {isTimerActive && (
                    <Timer className="h-3 w-3 text-green-500 animate-pulse" />
                  )}
                </div>
                
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTimerActive) {
                        stopTimer(task.id);
                      } else {
                        startTimer(task.id);
                      }
                    }}
                  >
                    {isTimerActive ? 'Stop' : 'Start'}
                  </Button>
                )}
              </div>
              
              {task.related_lead && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {task.related_lead.title}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}

interface KanbanColumnProps {
  column: typeof statusColumns[0];
  tasks: DragDropTask[];
  onTaskSelect: (task: Task) => void;
}

function KanbanColumn({ column, tasks, onTaskSelect }: KanbanColumnProps) {
  const totalTime = tasks.reduce((sum, task) => sum + task.time_spent, 0);
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="flex flex-col h-full min-w-[300px]">
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
        {totalTime > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Total: {formatTime(totalTime)}
            </span>
          </div>
        )}
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 p-3 transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}
            `}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskSelect(task)}
              />
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No tasks in {column.title.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function TaskKanban({ onTaskSelect }: TaskKanbanProps) {
  const { data: tasksResponse } = useTasksQuery();
  const updateTask = useUpdateTaskMutation();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const tasks = tasksResponse?.data || [];

  // Group tasks by status
  const taskColumns: TaskColumn[] = statusColumns.map(column => ({
    ...column,
    tasks: tasks
      .filter(task => task.status === column.id)
      .map(task => ({ ...task, isDragging: task.id === draggedTaskId }))
  }));

  const onDragStart = (start: any) => {
    setDraggedTaskId(start.draggableId);
  };

  const onDragEnd = (result: DropResult) => {
    setDraggedTaskId(null);
    
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    
    // Update task status
    updateTask.mutate({
      id: draggableId,
      updates: { 
        status: newStatus,
        ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
      }
    });
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Task Board</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {tasks.length} Total Tasks
          </Badge>
        </div>
      </div>
      
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
          {taskColumns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={column.tasks}
              onTaskSelect={onTaskSelect}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}