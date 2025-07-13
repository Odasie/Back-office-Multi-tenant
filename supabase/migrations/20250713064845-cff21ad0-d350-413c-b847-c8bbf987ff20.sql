-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false);

-- Create storage policies for client documents
CREATE POLICY "Users can view documents in their tenant" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);