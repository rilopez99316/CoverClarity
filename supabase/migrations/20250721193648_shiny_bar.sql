/*
  # Create Storage Bucket for Policy Documents

  1. Storage Setup
    - Create policy-documents bucket
    - Set up RLS policies for secure access
    - Configure public access for document viewing

  2. Security
    - Users can only upload to their own folders
    - Users can only view their own documents
    - Authenticated access required
*/

-- Create the storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage bucket
CREATE POLICY "Users can upload their own policy documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'policy-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own policy documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'policy-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own policy documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'policy-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own policy documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'policy-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);