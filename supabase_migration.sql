-- SCRIPT DE MIGRAÇÃO: ADICIONAR SUPORTE A CHAT MULTI-AGENTE (KERHOME)
-- Execute este script no SQL Editor do seu Supabase Dashboard

-- 1. Adicionar colunas necessárias à tabela 'conversations'
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS target_type text DEFAULT 'agent',
ADD COLUMN IF NOT EXISTS imobiliaria_id uuid REFERENCES imobiliarias(id),
ADD COLUMN IF NOT EXISTS atendido_por_agente_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';

-- 2. Garantir que o status é válido (opcional, mas recomendado)
-- ALTER TABLE conversations ADD CONSTRAINT check_status CHECK (status IN ('open', 'claimed', 'closed'));
-- ALTER TABLE conversations ADD CONSTRAINT check_target_type CHECK (target_type IN ('agent', 'agency'));

-- 3. Atualizar conversas existentes para o tipo 'agent'
UPDATE conversations SET target_type = 'agent' WHERE target_type IS NULL;
UPDATE conversations SET status = 'claimed' WHERE status IS NULL;

-- 4. Criar índices para busca rápida (performance)
CREATE INDEX IF NOT EXISTS idx_conversations_imobiliaria_id ON conversations(imobiliaria_id);
CREATE INDEX IF NOT EXISTS idx_conversations_target_type ON conversations(target_type);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- NOTA: O campo user2_id continuará a ser usado para compatibilidade com o store atual,
-- e será atualizado automaticamente quando um agente 'assumir' o ticket.
