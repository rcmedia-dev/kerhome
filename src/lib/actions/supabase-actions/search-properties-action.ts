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

    console.log("searchProperties params:", params);

    let query = supabase
        .from("properties")
        .select("*", { count: "exact" });

    // 🔍 Filtro por título
    if (q) {
        query = query.ilike("title", `%${q}%`);
    }

    // 📍 Status
    if (status) {
        query = query.eq("status", status);
    }

    // 📍 Cidade
    if (cidade) {
        query = query.ilike("cidade", `%${cidade}%`);
    }

    // 🏠 Tipo de imóvel
    if (tipo) {
        query = query.ilike("tipo", `%${tipo}%`);
    }

    // 🚿 Banheiros
    if (banheiros) {
        query = query.gte("banheiros", Number(banheiros));
    }

    // 🛏 Quartos
    if (quartos) {
        query = query.gte("quartos", Number(quartos));
    }

    // 🚗 Garagens
    if (garagens) {
        query = query.gte("garagens", Number(garagens));
    }

    // 💰 Preço máximo
    if (preco_max) {
        query = query.lte("preco", Number(preco_max));
    }

    // 📏 Tamanho mínimo
    if (tamanho_min) {
        query = query.gte("tamanho", Number(tamanho_min));
    }

    const { data: propertiesFoundData, error: propertiesFoundError } = await query;

    console.log("propertiesFoundData:", propertiesFoundData);

    if (propertiesFoundError) {
        console.error("Erro ao buscar propriedades:", propertiesFoundError);
        return [];
    }

    return propertiesFoundData || [];
}
