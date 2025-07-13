import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Calendar, FileText, Upload, Download, Zap, Building2 } from 'lucide-react';
import { useLead } from '@/contexts/LeadContext';
import { useToast } from '@/hooks/use-toast';

export default function QuickActions() {
  const { createLead } = useLead();
  const { toast } = useToast();
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isB2BDialogOpen, setIsB2BDialogOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    title: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    source: '',
    destination: '',
    booking_type: 'domestic' as const,
    estimated_value: '',
    notes: '',
  });

  const handleCreateLead = async () => {
    try {
      const leadData = {
        ...newLeadData,
        estimated_value: newLeadData.estimated_value ? parseFloat(newLeadData.estimated_value) : undefined,
        department: 'sales' as const,
      };

      const result = await createLead(leadData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to create lead. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Lead created successfully!",
        });
        setIsNewLeadOpen(false);
        setNewLeadData({
          title: '',
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          source: '',
          destination: '',
          booking_type: 'domestic',
          estimated_value: '',
          notes: '',
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const quickActions = [
    {
      title: 'New Lead',
      description: 'Create a new lead',
      icon: Plus,
      action: () => setIsNewLeadOpen(true),
      color: 'bg-primary text-primary-foreground',
    },
    {
      title: 'B2B Booking',
      description: 'Create B2B group booking',
      icon: Building2,
      action: () => setIsB2BDialogOpen(true),
      color: 'bg-success text-success-foreground',
    },
    {
      title: 'Bulk Assign',
      description: 'Assign multiple leads',
      icon: Users,
      action: () => toast({ title: "Feature Coming Soon", description: "Bulk assignment feature is being developed." }),
      color: 'bg-warning text-warning-foreground',
    },
    {
      title: 'Schedule Follow-up',
      description: 'Schedule customer follow-up',
      icon: Calendar,
      action: () => toast({ title: "Feature Coming Soon", description: "Follow-up scheduling is being developed." }),
      color: 'bg-accent text-accent-foreground',
    },
    {
      title: 'Generate Report',
      description: 'Export sales report',
      icon: FileText,
      action: () => toast({ title: "Feature Coming Soon", description: "Report generation is being developed." }),
      color: 'bg-muted text-muted-foreground',
    },
    {
      title: 'Import Leads',
      description: 'Import from CSV',
      icon: Upload,
      action: () => toast({ title: "Feature Coming Soon", description: "Lead import feature is being developed." }),
      color: 'bg-secondary text-secondary-foreground',
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all duration-200 hover:scale-105 hover:border-primary/50 bg-card"
                onClick={action.action}
              >
                <div className={`p-2 rounded-md ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm text-foreground">
                    {action.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground">New Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">8</div>
                <div className="text-xs text-muted-foreground">Follow-ups Due</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">3</div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Lead Dialog */}
      <Dialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogDescription>
              Enter the details for the new lead. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Lead Title *</Label>
              <Input
                id="title"
                value={newLeadData.title}
                onChange={(e) => setNewLeadData({ ...newLeadData, title: e.target.value })}
                placeholder="e.g., Bangkok to Phuket Family Vacation"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={newLeadData.customer_name}
                  onChange={(e) => setNewLeadData({ ...newLeadData, customer_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={newLeadData.customer_email}
                  onChange={(e) => setNewLeadData({ ...newLeadData, customer_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_phone">Phone</Label>
                <Input
                  id="customer_phone"
                  value={newLeadData.customer_phone}
                  onChange={(e) => setNewLeadData({ ...newLeadData, customer_phone: e.target.value })}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">Source</Label>
                <Select value={newLeadData.source} onValueChange={(value) => setNewLeadData({ ...newLeadData, source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Partner Agency">Partner Agency</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={newLeadData.destination}
                  onChange={(e) => setNewLeadData({ ...newLeadData, destination: e.target.value })}
                  placeholder="e.g., Phuket, Bangkok"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="booking_type">Booking Type</Label>
                <Select value={newLeadData.booking_type} onValueChange={(value: any) => setNewLeadData({ ...newLeadData, booking_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Domestic</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="b2b">B2B</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estimated_value">Estimated Value (THB)</Label>
              <Input
                id="estimated_value"
                type="number"
                value={newLeadData.estimated_value}
                onChange={(e) => setNewLeadData({ ...newLeadData, estimated_value: e.target.value })}
                placeholder="50000"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newLeadData.notes}
                onChange={(e) => setNewLeadData({ ...newLeadData, notes: e.target.value })}
                placeholder="Additional information about the lead..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewLeadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLead} disabled={!newLeadData.title || !newLeadData.customer_name}>
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* B2B Dialog */}
      <Dialog open={isB2BDialogOpen} onOpenChange={setIsB2BDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>B2B Group Booking</DialogTitle>
            <DialogDescription>
              Create a B2B group booking for corporate clients and travel agencies.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center text-muted-foreground">
              B2B booking workflow coming soon...
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsB2BDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}