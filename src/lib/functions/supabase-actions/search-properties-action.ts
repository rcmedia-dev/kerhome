import { supabase } from "@/lib/supabase";

export interface SearchParams {
    q?: string;
    status?: "para alugar" | "para comprar";
    cidade?: string;
    tipo?: string;
    banheiros?: string | number;
    quartos?: string | number;
    garagens?: string | number;
    preco_max?: string | number;
    tamanho_min?: string | number;
}

export async function searchProperties(params: SearchParams) {
    const {
        q,
        status,
        cidade,
        tipo,
        banheiros,
        quartos,
        garagens,
        preco_max,
        tamanho_min
    } = params;

    let query = supabase
        .from("properties")
        .select("*", { count: "exact" });

    // ðŸ” Filtro por título
    if (q) {
        query = query.ilike("title", `%${q}%`);
    }

    // ðŸ“ Status
    if (status) {
        query = query.eq("status", status);
    }

    // ðŸ“ Cidade
    if (cidade) {
        query = query.ilike("cidade", `%${cidade}%`);
    }

    // ðŸ  Tipo de imóvel
    if (tipo) {
        query = query.ilike("tipo", `%${tipo}%`);
    }

    // ðŸš¿ Banheiros
    if (banheiros) {
        query = query.gte("banheiros", Number(banheiros));
    }

    // ðŸ› Quartos
    if (quartos) {
        query = query.gte("quartos", Number(quartos));
    }

    // ðŸš— Garagens
    if (garagens) {
        query = query.gte("garagens", Number(garagens));
    }

    // ðŸ’° Preço máximo
    if (preco_max) {
        query = query.lte("preco", Number(preco_max));
    }

    // ðŸ“ Tamanho mínimo
    if (tamanho_min) {
        query = query.gte("tamanho", Number(tamanho_min));
    }

    const { data: propertiesFoundData, error: propertiesFoundError } = await query;

    if (propertiesFoundError) {
        console.error("Erro ao buscar propriedades:", propertiesFoundError);
        return [];
    }

    return propertiesFoundData || [];
}

