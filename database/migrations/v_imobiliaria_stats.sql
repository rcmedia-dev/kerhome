-- SCRIPT: CRIAR VIEW DE ESTATISTÍCAS DE IMOBILIÁRIA
-- Objetivo: Contar imóveis vinculados à agência ou postados por seus agentes (modo pessoal)

CREATE OR REPLACE VIEW v_imobiliaria_stats AS
SELECT 
    i.id as imobiliaria_id,
    (
        SELECT count(*) 
        FROM properties p 
        WHERE p.aprovement_status = 'approved'
        AND (
            p.imobiliaria_id = i.id -- Postagem em nome da agência
            OR (
                p.imobiliaria_id IS NULL -- Postagem pessoal
                AND EXISTS (
                    SELECT 1 FROM profiles prof 
                    WHERE prof.id = p.owner_id 
                    AND prof.imobiliaria_id = i.id -- Agente atualmente vinculado
                )
            )
        )
    ) as total_imoveis
FROM imobiliarias i;

-- Garantir que a view tenha permissões de leitura para usuários autenticados/púbicos conforme necessário
GRANT SELECT ON v_imobiliaria_stats TO anon, authenticated;
