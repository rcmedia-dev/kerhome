-- Migração: Diretório de Imobiliárias (Versão Simplificada)

-- 1. Criar tabela de imobiliárias (Se não existir)
CREATE TABLE IF NOT EXISTS imobiliarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descricao TEXT,
    logo TEXT,
    telefone TEXT,
    email TEXT,
    website TEXT,
    whatsapp TEXT,
    cidade TEXT,
    bairro TEXT,
    endereco TEXT,
    ano_fundacao INTEGER,
    verificada BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna se já existia sem ela
ALTER TABLE imobiliarias ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE imobiliarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE imobiliarias NO FORCE ROW LEVEL SECURITY; -- Garante que Service Role/System não são bloqueados

-- 3. Limpar políticas antigas completamente
DROP POLICY IF EXISTS "Leitura pública para imobiliarias" ON imobiliarias;
DROP POLICY IF EXISTS "Permite inserção para usuários autenticados" ON imobiliarias;
DROP POLICY IF EXISTS "Permite atualização para usuários autenticados" ON imobiliarias;
DROP POLICY IF EXISTS "Permite exclusão para usuários autenticados" ON imobiliarias;
DROP POLICY IF EXISTS "Leitura publica" ON imobiliarias;
DROP POLICY IF EXISTS "Acesso total para usuarios autenticados" ON imobiliarias;
DROP POLICY IF EXISTS "Service_Role_Full_Access" ON imobiliarias;

-- 4. Criar políticas super simplificadas
-- Permite leitura de qualquer lado (site público não logado)
CREATE POLICY "Leitura_publica" ON imobiliarias 
FOR SELECT USING (true);

-- Permite Tudo (Insert, Update, Delete) para qualquer utilizador Autenticado (no Admin)
CREATE POLICY "Acesso_total_para_autenticados" ON imobiliarias 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permite acesso total e incondicional para o ambiente de servidor (Service Role Key)
CREATE POLICY "Service_Role_Full_Access" ON imobiliarias 
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Adicionar relacionamento na tabela de imóveis
ALTER TABLE properties ADD COLUMN IF NOT EXISTS imobiliaria_id UUID REFERENCES imobiliarias(id) ON DELETE SET NULL;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_imobiliarias_slug ON imobiliarias(slug);
CREATE INDEX IF NOT EXISTS idx_properties_imobiliaria_id ON properties(imobiliaria_id);
