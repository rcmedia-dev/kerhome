-- Update imobiliarias table to add owner_id and update RLS
-- 1. Add owner_id column
ALTER TABLE imobiliarias 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Update RLS policies
-- Drop old versions first to avoid conflicts
DROP POLICY IF EXISTS "Permitir atualização para proprietários" ON imobiliarias;
DROP POLICY IF EXISTS "Permitir exclusão para proprietários" ON imobiliarias;

-- Allow owners to update their own agency
CREATE POLICY "Permitir atualização para proprietários" ON imobiliarias
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Allow owners to delete their own agency (optional, but good for completeness)
CREATE POLICY "Permitir exclusão para proprietários" ON imobiliarias
FOR DELETE TO authenticated
USING (auth.uid() = owner_id);

-- Ensure public reading still works (should already exist from previous migrations)
-- DROP POLICY IF EXISTS "Leitura_publica" ON imobiliarias;
-- CREATE POLICY "Leitura_publica" ON imobiliarias FOR SELECT USING (true);

-- Ensure service role has full access
-- DROP POLICY IF EXISTS "Service_Role_Full_Access" ON imobiliarias;
-- CREATE POLICY "Service_Role_Full_Access" ON imobiliarias FOR ALL TO service_role USING (true) WITH CHECK (true);
