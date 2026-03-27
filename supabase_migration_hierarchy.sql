-- Adicionar owner_id à tabela imobiliarias
ALTER TABLE imobiliarias ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);

-- Criar índice para busca rápida por proprietário
CREATE INDEX IF NOT EXISTS idx_imobiliarias_owner_id ON imobiliarias(owner_id);

-- Política de RLS para que o dono possa editar sua própria imobiliária (mesmo pendente)
CREATE POLICY "Donos podem gerir suas imobiliarias" 
ON imobiliarias 
FOR ALL 
TO authenticated 
USING (auth.uid() = owner_id) 
WITH CHECK (auth.uid() = owner_id);

-- Nota: O papel 'pending_agency' será atribuído via Server Action no campo 'role' da tabela 'profiles'
