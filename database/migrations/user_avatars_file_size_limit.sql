-- Raise file size limit for profile avatars (default may be 1MB).
-- Safe to run multiple times.
UPDATE storage.buckets
SET file_size_limit = 5242880  -- 5MB
WHERE id = 'user-avatars';
