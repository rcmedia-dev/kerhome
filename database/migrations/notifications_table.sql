-- ============================================================
-- Migration: notifications
-- Tabela de notificações in-app para utilizadores
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id     ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read   ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at  ON notifications (created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Utilizador vê apenas as suas próprias notificações
CREATE POLICY "user_ve_suas_notificacoes"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Servidor pode inserir (via service_role)
CREATE POLICY "servidor_pode_inserir"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Utilizador pode marcar como lida
CREATE POLICY "user_pode_marcar_lida"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());
