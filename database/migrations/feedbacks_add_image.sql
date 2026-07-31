ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-images', 'feedback-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable real-time replication for the feedbacks table
ALTER PUBLICATION supabase_realtime ADD TABLE feedbacks;
