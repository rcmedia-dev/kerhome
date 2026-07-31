-- Execute no Supabase SQL Editor para adicionar policies de admin
-- que estavam a faltar na migration original

-- Admins veem todos os feedbacks
CREATE POLICY "Admins can view all feedbacks"
  ON feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins podem atualizar qualquer feedback
CREATE POLICY "Admins can update all feedbacks"
  ON feedbacks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
