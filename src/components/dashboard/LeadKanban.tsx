import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Calendar, User } from 'lucide-react';
import { useLead } from '@/contexts/LeadContext';
import { Lead, LeadStatus } from '@/types/models';
import { format } from 'date-fns';

interface LeadKanbanProps {
  onLeadSelect: (lead: Lead) => void;
}

const statusColumns = [
  { id: 'new', title: 'New Leads', color: 'border-lead-new' },
  { id: 'contacted', title: 'Contacted', color: 'border-lead-contacted' },
  { id: 'qualified', title: 'Qualified', color: 'border-lead-qualified' },
  { id: 'proposal_sent', title: 'Proposal Sent', color: 'border-warning' },
  { id: 'negotiating', title: 'Negotiating', color: 'border-primary' },
  { id: 'confirmed', title: 'Confirmed', color: 'border-success' },
  { id: 'booked', title: 'Booked', color: 'border-lead-converted' },
];

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-lead-new/10 border-lead-new',
  contacted: 'bg-lead-contacted/10 border-lead-contacted',
  qualified: 'bg-lead-qualified/10 border-lead-qualified',
  proposal_sent: 'bg-warning/10 border-warning',
  negotiating: 'bg-primary/10 border-primary',
  awaiting_agency_confirm: 'bg-accent/10 border-accent',
  confirmed: 'bg-success/10 border-success',
  booked: 'bg-lead-converted/10 border-lead-converted',
  completed: 'bg-success/10 border-success',
  cancelled: 'bg-muted/10 border-muted',
  lost: 'bg-lead-lost/10 border-lead-lost',
};

interface LeadCardProps {
  lead: Lead;
  index: number;
  onClick: () => void;
}

function LeadCard({ lead, index, onClick }: LeadCardProps) {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card 
            className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
              statusColors[lead.status]
            } ${snapshot.isDragging ? 'rotate-3 shadow-xl' : ''}`}
            onClick={onClick}
          >
            <CardContent className="p-4">
              {/* Lead Title */}
              <h4 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">
                {lead.title}
              </h4>

              {/* Customer Info */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {lead.customer_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground font-medium">
                  {lead.customer_name}
                </span>
              </div>

              {/* Destination */}
              {lead.destination && (
                <div className="flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {lead.destination}
                  </span>
                </div>
              )}

              {/* Value */}
              {lead.estimated_value && (
                <div className="flex items-center gap-1 mb-2">
                  <DollarSign className="h-3 w-3 text-success" />
                  <span className="text-xs font-medium text-success">
                    ฿{lead.estimated_value.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Source */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs bg-background">
                  {lead.source || 'Unknown'}
                </Badge>
              </div>

              {/* Agent & Date */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>
                    {lead.assigned_agent 
                      ? `${lead.assigned_agent.first_name} ${lead.assigned_agent.last_name}` 
                      : 'Unassigned'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(lead.created_at), 'MMM dd')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

interface KanbanColumnProps {
  column: typeof statusColumns[0];
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
}

function KanbanColumn({ column, leads, onLeadSelect }: KanbanColumnProps) {
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground">
            {column.title}
          </CardTitle>
          <Badge variant="secondary" className="bg-accent">
            {leads.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <div className="text-xs text-muted-foreground">
            ฿{totalValue.toLocaleString()} total value
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[200px] transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-accent/50 rounded-lg' : ''
              }`}
            >
              {leads.map((lead, index) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  index={index}
                  onClick={() => onLeadSelect(lead)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
}

export default function LeadKanban({ onLeadSelect }: LeadKanbanProps) {
  const { leads, handleDrop, handleDragStart, handleDragEnd } = useLead();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      handleDragEnd();
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      handleDragEnd();
      return;
    }

    handleDrop(draggableId, destination.droppableId as LeadStatus);
  };

  const onDragStart = (start: any) => {
    handleDragStart(start.draggableId);
  };

  // Group leads by status
  const groupedLeads = statusColumns.reduce((acc, column) => {
    acc[column.id] = leads.filter(lead => lead.status === column.id);
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lead Pipeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag and drop leads to update their status
        </p>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <div className="grid grid-cols-7 gap-4">
            {statusColumns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                leads={groupedLeads[column.id] || []}
                onLeadSelect={onLeadSelect}
              />
            ))}
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}