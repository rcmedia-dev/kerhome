-- Bucket used by the dashboard and profile card avatar uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view user avatars" ON storage.objects;
CREATE POLICY "Public can view user avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

DROP POLICY IF EXISTS "Users can upload their avatar" ON storage.objects;
CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name) LIKE (auth.uid()::text || '-%'))
);

DROP POLICY IF EXISTS "Users can update their avatar" ON storage.objects;
CREATE POLICY "Users can update their avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-avatars' AND owner_id = auth.uid()::text)
WITH CHECK (bucket_id = 'user-avatars' AND owner_id = auth.uid()::text);
