import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

// Mock itinerary updates - in real app, this would come from API
const mockItineraryUpdates = [
  {
    id: '1',
    leadId: 'lead-1',
    customerName: 'Robert Johnson',
    destination: 'Phuket',
    status: 'draft',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    activities: ['Resort Check-in', 'Island Hopping', 'Spa Treatment'],
    agent: {
      name: 'Sarah Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=150&h=150&fit=crop&crop=face'
    },
    priority: 'high'
  },
  {
    id: '2',
    leadId: 'lead-2',
    customerName: 'Maria Rodriguez',
    destination: 'Singapore',
    status: 'sent',
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    activities: ['Business Meeting Venues', 'Airport Transfer', 'Hotel Booking'],
    agent: {
      name: 'Sarah Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=150&h=150&fit=crop&crop=face'
    },
    priority: 'medium'
  },
  {
    id: '3',
    leadId: 'lead-5',
    customerName: 'Michael & Lisa Thompson',
    destination: 'Krabi',
    status: 'approved',
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    activities: ['Romantic Dinner', 'Beach Activities', 'Couple Spa'],
    agent: {
      name: 'Sarah Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=150&h=150&fit=crop&crop=face'
    },
    priority: 'low'
  },
  {
    id: '4',
    leadId: 'lead-6',
    customerName: 'Tech Innovations Ltd',
    destination: 'Koh Samui',
    status: 'confirmed',
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    activities: ['Team Building', 'Conference Room', 'Group Accommodation'],
    agent: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    priority: 'high'
  }
];

const statusConfig = {
  draft: { 
    label: 'Draft', 
    color: 'bg-muted text-muted-foreground',
    icon: Clock 
  },
  sent: { 
    label: 'Sent', 
    color: 'bg-warning text-warning-foreground',
    icon: ExternalLink 
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-success text-success-foreground',
    icon: CheckCircle 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-primary text-primary-foreground',
    icon: CheckCircle 
  }
};

const priorityColors = {
  high: 'border-l-destructive',
  medium: 'border-l-warning',
  low: 'border-l-success'
};

function formatUpdateTime(date: Date) {
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM dd');
  }
}

interface ItineraryUpdateItemProps {
  update: typeof mockItineraryUpdates[0];
}

function ItineraryUpdateItem({ update }: ItineraryUpdateItemProps) {
  const statusInfo = statusConfig[update.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`p-4 rounded-lg border-l-4 bg-card hover:shadow-md transition-all duration-200 ${priorityColors[update.priority as keyof typeof priorityColors]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-foreground">{update.customerName}</h4>
            <Badge className={statusInfo.color} variant="secondary">
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            {update.destination}
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatUpdateTime(update.lastUpdated)}
        </div>
      </div>

      {/* Activities */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-1">Activities:</div>
        <div className="flex flex-wrap gap-1">
          {update.activities.slice(0, 2).map((activity, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-background">
              {activity}
            </Badge>
          ))}
          {update.activities.length > 2 && (
            <Badge variant="outline" className="text-xs bg-background">
              +{update.activities.length - 2} more
            </Badge>
          )}
        </div>
      </div>

      {/* Agent & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={update.agent.avatar} />
            <AvatarFallback className="text-xs">
              {update.agent.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{update.agent.name}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-accent">
          <ExternalLink className="h-3 w-3 mr-1" />
          View
        </Button>
      </div>
    </div>
  );
}

export default function ItineraryUpdates() {
  // Sort by priority and time
  const sortedUpdates = mockItineraryUpdates.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return b.lastUpdated.getTime() - a.lastUpdated.getTime();
  });

  const pendingCount = mockItineraryUpdates.filter(u => u.status === 'draft' || u.status === 'sent').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Itinerary Updates
          </CardTitle>
          {pendingCount > 0 && (
            <Badge className="bg-warning text-warning-foreground">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedUpdates.length > 0 ? (
            sortedUpdates.map((update) => (
              <ItineraryUpdateItem key={update.id} update={update} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No itinerary updates</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Itinerary Builder
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}