import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Mail, Clock, AlertTriangle, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "confirmation_request",
    name: "Confirmation Request",
    subject: "Booking Confirmation Required - {booking_reference}",
    body: "Dear Partner,\n\nWe need confirmation for booking {booking_reference} for {destination}.\n\nPlease confirm within 2 business days.\n\nBest regards,\nOperations Team"
  },
  {
    id: "overdue_follow_up",
    name: "Overdue Follow-up",
    subject: "URGENT: Overdue Confirmation - {booking_reference}",
    body: "Dear Partner,\n\nThis is a follow-up regarding the overdue confirmation for booking {booking_reference}.\n\nImmediate action required.\n\nBest regards,\nOperations Team"
  },
  {
    id: "document_request",
    name: "Document Request",
    subject: "Documents Required - {booking_reference}",
    body: "Dear Partner,\n\nWe require the following documents for booking {booking_reference}:\n\n- Vouchers\n- Itinerary\n- Terms & Conditions\n\nPlease upload to our portal.\n\nBest regards,\nOperations Team"
  }
];

export function SupplierWidget() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `client-documents/${fileName}`;

      const { error } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (error) throw error;

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded to client documents.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const sendEmail = () => {
    if (!emailSubject || !emailBody) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and email body.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would integrate with an email service
    toast({
      title: "Email sent",
      description: "Email has been sent to the supplier.",
    });

    // Reset form
    setSelectedTemplate("");
    setEmailSubject("");
    setEmailBody("");
    setBookingReference("");
  };

  const processEmailContent = (content: string) => {
    return content
      .replace(/\{booking_reference\}/g, bookingReference || '[Booking Reference]')
      .replace(/\{destination\}/g, '[Destination]');
  };

  return (
    <div className="space-y-4">
      {/* Timer Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">Timer Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div>
              <p className="text-sm font-medium">2-Day Rule Active</p>
              <p className="text-xs text-muted-foreground">Auto-notify CS on overdue confirmations</p>
            </div>
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              <Clock className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Pending Confirmations</span>
              <Badge variant="secondary">3</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Overdue (&gt;2 days)</span>
              <Badge variant="destructive">1</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Communications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Supplier Communications
          </CardTitle>
          <CardDescription>
            Send emails using templates or upload documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email Templates</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="booking-ref">Booking Reference</Label>
                  <Input
                    id="booking-ref"
                    value={bookingReference}
                    onChange={(e) => setBookingReference(e.target.value)}
                    placeholder="Enter booking reference"
                  />
                </div>

                <div>
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={processEmailContent(emailSubject)}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    value={processEmailContent(emailBody)}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Email body"
                    rows={6}
                  />
                </div>

                <Button onClick={sendEmail} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium">Upload Documents</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX up to 10MB
                  </span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={uploading}
                />
                {uploading && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Recent uploads will appear here</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}