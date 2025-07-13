import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  Clock,
  ExternalLink,
  Edit,
  MessageSquare,
  Activity
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types/models';
import { format } from 'date-fns';

interface LeadDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-lead-new text-lead-new-foreground',
  contacted: 'bg-lead-contacted text-lead-contacted-foreground',
  qualified: 'bg-lead-qualified text-lead-qualified-foreground',
  proposal_sent: 'bg-warning text-warning-foreground',
  negotiating: 'bg-primary text-primary-foreground',
  awaiting_agency_confirm: 'bg-accent text-accent-foreground',
  confirmed: 'bg-success text-success-foreground',
  booked: 'bg-lead-converted text-lead-converted-foreground',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-muted text-muted-foreground',
  lost: 'bg-lead-lost text-lead-lost-foreground',
};

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  awaiting_agency_confirm: 'Agency Confirm',
  confirmed: 'Confirmed',
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
  lost: 'Lost',
};

function OverviewTab({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge className={statusColors[lead.status]} variant="secondary">
                  {statusLabels[lead.status]}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Source</label>
              <div className="mt-1">
                <Badge variant="outline" className="bg-background">
                  {lead.source || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Destination</label>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{lead.destination || 'Not specified'}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Estimated Value</label>
            <div className="mt-1 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-foreground font-medium">
                ฿{(lead.estimated_value || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Booking Type</label>
            <div className="mt-1">
              <Badge variant="outline" className="bg-background capitalize">
                {lead.booking_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Agent */}
      {lead.assigned_agent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={lead.assigned_agent.avatar_url} />
                <AvatarFallback>
                  {lead.assigned_agent.first_name?.charAt(0)}
                  {lead.assigned_agent.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-foreground">
                  {lead.assigned_agent.first_name} {lead.assigned_agent.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {lead.assigned_agent.email}
                </div>
                {lead.assigned_agent.phone && (
                  <div className="text-sm text-muted-foreground">
                    {lead.assigned_agent.phone}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {lead.metadata && Object.keys(lead.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(lead.metadata as Record<string, any>).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-muted-foreground capitalize">
                    {key.replace('_', ' ')}:
                  </span>
                  <span className="text-sm text-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CustomerTab({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <div className="mt-1 text-foreground font-medium">{lead.customer_name}</div>
          </div>

          {lead.customer_email && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${lead.customer_email}`}
                  className="text-primary hover:underline"
                >
                  {lead.customer_email}
                </a>
              </div>
            </div>
          )}

          {lead.customer_phone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <div className="mt-1 flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${lead.customer_phone}`}
                  className="text-primary hover:underline"
                >
                  {lead.customer_phone}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Phone className="mr-2 h-4 w-4" />
            Make Call
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NotesTab({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {lead.notes ? (
            <div className="text-foreground whitespace-pre-wrap">
              {lead.notes}
            </div>
          ) : (
            <div className="text-muted-foreground italic">
              No notes available for this lead.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Note</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[100px] p-3 border rounded-md bg-background text-foreground"
            placeholder="Add a note about this lead..."
          />
          <Button className="mt-3">
            <FileText className="mr-2 h-4 w-4" />
            Save Note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineTab({ lead }: { lead: Lead }) {
  // Mock timeline events - in real app, this would come from activity log
  const timelineEvents = [
    {
      id: '1',
      type: 'created',
      title: 'Lead Created',
      description: `Lead created from ${lead.source}`,
      timestamp: lead.created_at,
      icon: Activity,
    },
    {
      id: '2',
      type: 'updated',
      title: 'Status Updated',
      description: `Status changed to ${statusLabels[lead.status]}`,
      timestamp: lead.updated_at,
      icon: Edit,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <event.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  {index < timelineEvents.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="font-medium text-foreground">{event.title}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {event.description}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeadDetailDrawer({ isOpen, onClose, lead }: LeadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!lead) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] bg-background">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl font-semibold text-foreground">
                {lead.title}
              </SheetTitle>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={statusColors[lead.status]} variant="secondary">
                  {statusLabels[lead.status]}
                </Badge>
                <Badge variant="outline" className="bg-background">
                  {lead.source}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Itinerary
              </Button>
            </div>
          </div>

          <Separator className="mt-4" />
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab lead={lead} />
            </TabsContent>

            <TabsContent value="customer" className="mt-0">
              <CustomerTab lead={lead} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <NotesTab lead={lead} />
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <TimelineTab lead={lead} />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}