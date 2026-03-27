-- SCRIPT: SISTEMA DE CONVITES DE AGENTES
-- Objetivo: Criar tabela de convites com tokens e expiração

CREATE TABLE IF NOT EXISTS agency_invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    imobiliaria_id uuid NOT NULL REFERENCES imobiliarias(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '48 hours')
);

-- Ativar RLS
ALTER TABLE agency_invites ENABLE ROW LEVEL SECURITY;

-- Proprietários podem gerenciar convites da sua agência
-- Nota: Assume-se que a tabela imobiliarias tem o campo owner_id
CREATE POLICY "Owners can manage agency invites"
ON agency_invites
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM imobiliarias
        WHERE imobiliarias.id = agency_invites.imobiliaria_id
        AND imobiliarias.owner_id = auth.uid()
    )
);

-- Utilizadores convidados podem ver os seus convites baseado no e-mail do perfil
CREATE POLICY "Invited users can view their own invites"
ON agency_invites
FOR SELECT
TO authenticated
USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Permissão para ler a view de imobiliárias (se necessário para a página de aceitação)
GRANT SELECT ON agency_invites TO anon, authenticated;
