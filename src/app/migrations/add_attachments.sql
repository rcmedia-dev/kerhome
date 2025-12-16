-- Run this in your Supabase SQL Editor
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type TEXT; -- 'image' | 'document'

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-uploads', 'chat-uploads', true) ON CONFLICT DO NOTHING;

-- Policy to allow authenticated uploads (adjust as needed)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-uploads');

CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-uploads');
