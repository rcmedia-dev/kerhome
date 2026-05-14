-- SCRIPT: ATUALIZAR VIEW DE IMOBILIÁRIAS COM ESTATISTÍCAS COMPLETAS
-- Objetivo: Fornecer todos os dados da imobiliária + contagem de imóveis em uma única fonte

DROP VIEW IF EXISTS v_imobiliaria_stats;

CREATE VIEW v_imobiliaria_stats AS
SELECT 
    i.*, -- Todos os campos da tabela original
    (
        SELECT count(*) 
        FROM properties p 
        WHERE p.aprovement_status = 'approved'
        AND (
            p.imobiliaria_id = i.id -- Postagem institucional
            OR (
                p.imobiliaria_id IS NULL -- Postagem pessoal de agente vinculado
                AND EXISTS (
                    SELECT 1 FROM profiles prof 
                    WHERE prof.id = p.owner_id 
                    AND prof.imobiliaria_id = i.id
                )
            )
        )
    ) as total_imoveis
FROM imobiliarias i;

-- Garantir permissões
GRANT SELECT ON v_imobiliaria_stats TO anon, authenticated;
