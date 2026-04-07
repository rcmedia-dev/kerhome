'use server';

import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { updateImobiliariaAction } from "./admin-imobiliaria-actions";
import { Imobiliaria } from "@/lib/types/imobiliaria";

export interface ImobiliariaSearchParams {
  cidade?: string;
  bairro?: string;
  tipo_imovel?: string; // Filtro por imobiliárias que tenham este tipo de imóvel
  verificada?: boolean;
  ordem?: string; // ordenamento: 'mais_imoveis', 'recentes', 'destaque'
  q?: string; // busca por nome
  page?: number;
  limit?: number;
}

/**
 * Busca imobiliárias com filtros
 */
export async function fetchImobiliarias(params: ImobiliariaSearchParams = {}) {
  const { cidade, bairro, tipo_imovel, verificada, ordem, q, page, limit } = params;

  let query = supabase
    .from("v_imobiliaria_stats")
    .select("*", { count: "exact" })
    .eq('status', 'approved');

  if (verificada !== undefined) {
    query = query.eq("verificada", verificada);
  }

  if (cidade) {
    query = query.ilike("cidade", `%${cidade}%`);
  }

  if (bairro) {
    query = query.ilike("bairro", `%${bairro}%`);
  }

  if (q) {
    query = query.ilike("nome", `%${q}%`);
  }

  // Ordenação no banco
  if (ordem === 'mais_imoveis') {
    query = query.order("total_imoveis", { ascending: false });
  } else if (ordem === 'destaque') {
    query = query.order("verificada", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (page !== undefined && limit !== undefined) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("❌ Erro detalhado Supabase fetchImobiliarias:", error.message, "| Code:", error.code, "| Details:", error.details);
    return { data: [], count: 0 };
  }

  // Mapear e aplicar transformações básicas se necessário
  let mapped = (data as any[]).map(item => ({
    ...item,
    _count_imoveis: item.total_imoveis || 0,
    propertyCount: item.total_imoveis || 0,
  }));

  // Filtrar por tipo_imovel 
  if (tipo_imovel) {
    mapped = mapped.filter(item => item._has_tipo);
  }

  // Ordenação
  if (ordem === 'mais_imoveis') {
    mapped.sort((a, b) => b._count_imoveis - a._count_imoveis);
  } else if (ordem === 'destaque') {
    mapped.sort((a, b) => {
      if (a.verificada === b.verificada) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.verificada ? -1 : 1;
    });
  } else {
    // Default: recentes
    mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Remover lixo
  mapped.forEach(item => {
    delete item.properties;
    delete item._has_tipo;
  });

  return { data: mapped as Imobiliaria[], count: count || 0 };
}

/**
 * Busca uma imobiliária pelo Slug
 */
export async function fetchImobiliariaBySlug(slug: string) {
  const { data, error } = await supabase
    .from("v_imobiliaria_stats")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(`Erro ao buscar imobiliária ${slug}:`, error);
    return null;
  }

  const result = data as any;
  const count = result.total_imoveis || 0;

  return {
    ...result,
    _count_imoveis: count,
    propertyCount: count
  } as Imobiliaria;
}

/**
 * Busca os imóveis de uma imobiliária específica
 */
export async function fetchPropertiesByAgency(imobiliaria_id: string) {
  // Passo A: Buscar IDs de agentes vinculados
  const { data: agentProfiles, error: agentError } = await supabase
    .from("profiles")
    .select("id")
    .eq("imobiliaria_id", imobiliaria_id);

  if (agentError) {
    console.error("Erro ao buscar agentes para listagem de imóveis:", agentError);
  }

  const agentIds = (agentProfiles || []).map(p => p.id);

  // Passo B: Buscar imóveis da agência ou dos agentes (modo pessoal)
  // Construir o filtro .or dinamicamente para evitar subqueries
  let orFilter = `imobiliaria_id.eq.${imobiliaria_id}`;
  if (agentIds.length > 0) {
    orFilter += `,and(imobiliaria_id.is.null,owner_id.in.(${agentIds.join(',')}))`;
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*, owner:owner_id(*)")
    .or(orFilter)
    .eq("aprovement_status", "approved");

  if (error) {
    console.error("Erro ao buscar imóveis da imobiliária (Step B):", error);
    return [];
  }

  return data || [];
}

/**
 * Busca localizações únicas das imobiliárias cadastradas (para os filtros inteligentes)
 */
export async function fetchImobiliariaLocations() {
  const { data, error } = await supabase
    .from("imobiliarias")
    .select("cidade, bairro");

  if (error) {
    console.error("Erro ao buscar localizações de imobiliárias:", error);
    return { cidades: [], bairros: [] };
  }

  const cidades = Array.from(new Set(data.map(i => i.cidade).filter(Boolean)));
  const bairros = Array.from(new Set(data.map(i => i.bairro).filter(Boolean)));

  return { cidades, bairros };
}

/**
 * Busca os agentes vinculados a uma imobiliária
 */
export async function fetchAgentsByAgency(imobiliaria_id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("imobiliaria_id", imobiliaria_id)
    .order("primeiro_nome", { ascending: true })
    .order("ultimo_nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar agentes da imobiliária:", error);
    return [];
  }

  return data || [];
}

/**
 * Busca imobiliárias em destaque para o Carrossel da Home
 */
export async function fetchFeaturedAgencies() {
  const { data, error } = await supabase
    .from("imobiliarias")
    .select("*")
    .eq("status", "approved")
    .order("verificada", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Erro ao buscar imobiliárias em destaque:", error);
    return [];
  }

  return data as Imobiliaria[];
}

/**
 * Busca imobiliárias semelhantes (mesma cidade)
 */
export async function fetchSimilarAgencies(localizacao: string, currentId: string) {
  let query = supabase
    .from("imobiliarias")
    .select("*")
    .eq("status", "approved")
    .neq("id", currentId);

  if (localizacao && localizacao.trim() !== '') {
    // Busca flexível sem sensibilidade a maiúsculas/minúsculas
    query = query.ilike("cidade", `%${localizacao.trim()}%`);
  } else {
    // Fallback inicial se não houver localização
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(4);

  if (error) {
    // Erro silencioso Server Side
    return [];
  }

  // Falback Secundário: se a busca por cidade retornar vazia, sugerir recentes gerais
  if ((!data || data.length === 0) && localizacao) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("imobiliarias")
      .select("*")
      .eq("status", "approved")
      .neq("id", currentId)
      .order("created_at", { ascending: false })
      .limit(4);

    if (!fallbackError && fallbackData) {
      return fallbackData as Imobiliaria[];
    }
  }

  return (data || []) as Imobiliaria[];
}

export async function getUserAgency(userId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Tentar encontrar a imobiliária onde o utilizador é o DONO
    const { data: ownerAgency } = await supabase
      .from('imobiliarias')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (ownerAgency) return ownerAgency;

    // 2. Se não for dono, verificar no perfil se ele é um MEMBRO vinculado
    const { data: profile } = await supabase
      .from('profiles')
      .select('imobiliaria_id')
      .eq('id', userId)
      .single();

    if (profile?.imobiliaria_id) {
      const { data: memberAgency } = await supabase
        .from('imobiliarias')
        .select('*')
        .eq('id', profile.imobiliaria_id)
        .maybeSingle();
      
      return memberAgency;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar agência do utilizador:', error);
    return null;
  }
}

export async function updateUserAgencyAction(id: string, data: any, originalData: any) {
  try {
    const sensitiveFields = ['nome', 'nif'];
    let shouldResetStatus = false;
    
    for (const field of sensitiveFields) {
      if (data[field] && data[field] !== originalData[field]) {
        shouldResetStatus = true;
        break;
      }
    }

    const updateData = {
      ...data,
      status: shouldResetStatus ? 'pending' : originalData.status,
    };

    const result = await updateImobiliariaAction(id, updateData);
    
    if (result.success) {
      return { 
        success: true, 
        resetStatus: shouldResetStatus 
      };
    }
    
    return result;
  } catch (error: any) {
    console.error('Erro ao atualizar agência do usuário:', error);
    return { success: false, error: error.message };
  }
}
