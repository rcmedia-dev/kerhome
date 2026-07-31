CREATE TABLE feedbacks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name       TEXT,
  user_email      TEXT,
  categoria       TEXT NOT NULL CHECK (categoria IN (
    'bug',
    'sugestao',
    'nova_funcionalidade',
    'elogio',
    'problema_acesso',
    'reportar_conteudo',
    'duvida',
    'outro'
  )),
  titulo          TEXT NOT NULL,
  mensagem        TEXT NOT NULL,
  url             TEXT,
  user_agent      TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir
CREATE POLICY "Anyone can insert feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (true);

-- Utilizadores veem os proprios
CREATE POLICY "Users can view own feedbacks"
  ON feedbacks FOR SELECT
  USING (auth.uid() = user_id);

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

-- Index
CREATE INDEX idx_feedbacks_categoria ON feedbacks(categoria);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);
