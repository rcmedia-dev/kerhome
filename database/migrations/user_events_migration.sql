-- ============================================================
-- Migration: user_events
-- Tabela única polimórfica para rastrear interações do utilizador
-- ============================================================

CREATE TABLE IF NOT EXISTS user_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Tipo de evento (o botão clicado)
  event_type  TEXT NOT NULL,

  -- Entidade envolvida (imóvel, imobiliária ou corretor)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('imovel', 'imobiliaria', 'corretor')),
  entity_id   TEXT NOT NULL,

  -- ID do dono/anunciante — usado para filtrar no dashboard
  owner_id    TEXT,

  -- Utilizador logado (opcional)
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Sessão anónima (gerada no cliente via localStorage)
  session_id  TEXT,

  -- Dados extras opcionais (ex: URL partilhada, plataforma, etc.)
  metadata    JSONB NOT NULL DEFAULT '{}',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para queries de dashboard rápidas
CREATE INDEX IF NOT EXISTS idx_user_events_owner_id   ON user_events (owner_id);
CREATE INDEX IF NOT EXISTS idx_user_events_entity      ON user_events (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type  ON user_events (event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at  ON user_events (created_at DESC);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Anunciante só lê os seus próprios eventos
CREATE POLICY "anunciante_le_seus_eventos"
  ON user_events
  FOR SELECT
  USING (owner_id = auth.uid()::text);

-- Qualquer pessoa pode inserir (visitantes anónimos incluídos)
CREATE POLICY "qualquer_um_pode_inserir_evento"
  ON user_events
  FOR INSERT
  WITH CHECK (true);

-- Admin pode ver tudo (necessário para relatórios globais futuros)
CREATE POLICY "admin_ve_todos_eventos"
  ON user_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
