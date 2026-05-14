-- ============================================================
-- Migration: visits
-- Tabela para gerir visitas agendadas pelos agentes
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

CREATE TABLE IF NOT EXISTS visits (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  property_id     TEXT,
  property_title  TEXT,
  agent_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_name       TEXT,
  scheduled_date  TEXT NOT NULL,
  scheduled_time  TEXT NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'done')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_visits_conversation_id ON visits(conversation_id);
CREATE INDEX IF NOT EXISTS idx_visits_agent_id ON visits(agent_id);
CREATE INDEX IF NOT EXISTS idx_visits_lead_id ON visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_date ON visits(scheduled_date);

-- RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_manage_their_visits"
  ON visits FOR ALL
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "leads_view_their_visits"
  ON visits FOR SELECT
  USING (lead_id = auth.uid());
