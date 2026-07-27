-- ============================================================
-- Migration: error_feedbacks
-- Tabela para feedback de erros reportados pelos utilizadores
-- ============================================================

CREATE TABLE IF NOT EXISTS error_feedbacks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email      TEXT,
  message         TEXT NOT NULL,
  severity        TEXT NOT NULL DEFAULT 'medium' 
                    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  error_message   TEXT,
  error_stack     TEXT,
  component_stack TEXT,
  url             TEXT NOT NULL,
  user_agent      TEXT,
  include_tech_info BOOLEAN NOT NULL DEFAULT TRUE,
  screenshots     JSONB NOT NULL DEFAULT '[]',
  metadata        JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes     TEXT,
  resolved_by     UUID REFERENCES auth.users(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_error_feedbacks_user_id    ON error_feedbacks (user_id);
CREATE INDEX IF NOT EXISTS idx_error_feedbacks_severity   ON error_feedbacks (severity);
CREATE INDEX IF NOT EXISTS idx_error_feedbacks_status     ON error_feedbacks (status);
CREATE INDEX IF NOT EXISTS idx_error_feedbacks_created_at ON error_feedbacks (created_at DESC);

-- RLS
ALTER TABLE error_feedbacks ENABLE ROW LEVEL SECURITY;

-- Utilizador pode ver os seus próprios feedbacks
CREATE POLICY "user_ve_seus_feedbacks"
  ON error_feedbacks
  FOR SELECT
  USING (user_id = auth.uid());

-- Qualquer pessoa pode inserir (utilizadores anónimos incluídos)
CREATE POLICY "qualquer_um_pode_inserir_feedback"
  ON error_feedbacks
  FOR INSERT
  WITH CHECK (true);

-- Admin pode ver tudo e actualizar
CREATE POLICY "admin_gera_feedbacks"
  ON error_feedbacks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
