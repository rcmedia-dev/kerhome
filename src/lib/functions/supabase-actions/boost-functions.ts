'use server';

import { supabase } from "@/lib/supabase";
import { getDefaultPacotes } from "@/lib/types/utils";

// Funções de Tracking
export async function trackBoostView(propertyId: string) {
  try {
    const { error } = await supabase.rpc('increment_boost_view', {
      p_property_id: propertyId
    });

    if (error) {
      console.error('Erro ao incrementar visualização:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro no tracking de visualização:', error);
    return { success: false };
  }
}

export async function trackBoostClick(propertyId: string) {
  try {
    const { error } = await supabase.rpc("increment_boost_click", {
      p_property_id: propertyId,
    });

    if (error) {
      console.error("Erro ao incrementar clique:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro inesperado no tracking:", error);
    return { success: false, error: "Erro interno" };
  }
}

export async function fetchPacotesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('pacotes_destaque')
      .select('*')
      .order('preco', { ascending: true });

    if (error) {
      console.error('Erro ao buscar pacotes:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar pacotes do Supabase:', error);
    return null;
  }
}

export async function addPropertiesToBoost(
  propertyIds: string[],
  planId: string,
  userData?: {
    nome: string;
    email: string;
    user_id: string;
  }
) {
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    throw new Error("Nenhum imóvel selecionado para destaque.");
  }

  if (!planId || typeof planId !== "string") {
    throw new Error("ID de plano inválido.");
  }

  const pacote = getDefaultPacotes().find((p) => p.id === planId);
  if (!pacote) throw new Error(`Plano com ID "${planId}" não encontrado.`);

  const durationDays = Number(pacote.dias);
  if (isNaN(durationDays) || durationDays <= 0) {
    throw new Error(`Duração inválida no plano "${planId}".`);
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  try {
    // 1️⃣ Buscar boosts ativos existentes
    const { data: existingBoosts, error: fetchError } = await supabase
      .from("properties_to_boost")
      .select("property_id, boost_end, status")
      .in("property_id", propertyIds)
      .eq("status", "active");

    if (fetchError) throw new Error("Erro ao verificar boosts existentes.");

    // 2️⃣ Filtrar imóveis já com boost ativo
    const activeIds = new Set(
      (existingBoosts || [])
        .filter((b) => new Date(b.boost_end) > now)
        .map((b) => b.property_id)
    );

    const propertiesToInsert = propertyIds.filter((id) => !activeIds.has(id));

    if (propertiesToInsert.length === 0) {
      return { message: "Todos os imóveis já têm um destaque ativo.", inserted: 0 };
    }

    // 3️⃣ Criar novos boosts
    const boostData = propertiesToInsert.map((propertyId) => ({
      property_id: propertyId,
      plan_id: planId,
      boost_start: now.toISOString(),
      boost_end: endDate.toISOString(),
      status: "active",
      views: 0,
      clicks: 0,
    }));

    // 4️⃣ Inserir
    const { data, error: insertError } = await supabase
      .from("properties_to_boost")
      .insert(boostData)
      .select();

    if (insertError) throw insertError;

    // 5️⃣ Enviar webhook POST notificando o destaque
    try {
      await fetch("https://n8n.srv1157846.hstgr.cloud/webhook/notificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evento: "destaque_imovel",
          dados: {
            nome: userData?.nome ?? "Usuário Desconhecido",
            email: userData?.email ?? "",
            user_id: userData?.user_id ?? "",
            propriedades_impulsionadas: propertiesToInsert,
            plano: pacote.nome,
            data_destaque: now.toISOString(),
          },
        }),
      });

      console.log("Notificação enviada ao webhook.");
    } catch (notifyErr) {
      console.warn("Falha ao enviar notificação ao webhook:", notifyErr);
    }

    return {
      message: `Foram destacados ${data?.length || 0} imóveis.`,
      inserted: data,
      skipped: Array.from(activeIds),
    };
  } catch (err: any) {
    console.error("[Boost Error Context]", {
      planId,
      propertyCount: propertyIds.length,
      error: err.message || err,
    });

    throw new Error("Não foi possível processar o destaque no momento.");
  }
}


export async function createFatura(userId: string, total: number, servico: string) {
  try {
    const { data, error } = await supabase
      .from('faturas')
      .insert([
        {
          user_id: userId,
          valor: total,
          status: 'paga',
          servico
        }
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao registrar fatura:', error);
    throw error;
  }
}

export interface BoostedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  images?: string[];
  aprovement_status: 'pending' | 'approved' | 'rejected';
  boost_plan: string;
  boost_expires_at: string;
  boost_started_at: string;
  boost_type: 'featured' | 'premium' | 'standard';
  views: number;
  clicks: number;
  property_id: string;
  plan_id: string;
  created_at: string;
  boost_status: string;
  click_through_rate?: number;
  last_click_at?: string;
  last_view_at?: string;
}

export interface PerformanceMetrics {
  total_impressions: number;
  total_clicks: number;
  click_through_rate: number;
  average_time_remaining: string;
  total_revenue: number;
}

export async function getBoostedProperties(userId: string): Promise<BoostedProperty[]> {
  try {
    const { data, error } = await supabase
      .from('properties_to_boost')
      .select(`
        *,
        properties!inner (
          id,
          title,
          description,
          price,
          endereco,
          bairro,
          cidade,
          provincia,
          image,
          aprovement_status,
          owner_id
        )
      `)
      .eq('properties.owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar propriedades impulsionadas:', error);
      return [];
    }

    if (!data) return [];

    // Mapear os dados para o formato esperado
    return data.map(item => {
      const property = item.properties;
      
      // Construir location a partir dos campos de endereço
      const locationParts = [
        property?.endereco,
        property?.bairro,
        property?.cidade,
        property?.provincia
      ].filter(Boolean);
      
      const location = locationParts.length > 0 
        ? locationParts.join(', ') 
        : 'Localização não informada';

      // Calcular CTR (Click Through Rate)
      const views = Number(item.views) || 0;
      const clicks = Number(item.clicks) || 0;
      const click_through_rate = views > 0 ? (clicks / views) * 100 : 0;

      return {
        id: item.id.toString(),
        title: property?.title || 'Propriedade sem título',
        location: location,
        price: Number(property?.price) || 0,
        images: property?.image ? [property.image] : undefined,
        aprovement_status: property?.aprovement_status as 'pending' | 'approved' | 'rejected' || 'pending',
        boost_plan: getBoostPlanName(item.plan_id),
        boost_expires_at: item.boost_end || new Date().toISOString(),
        boost_started_at: item.boost_start || new Date().toISOString(),
        boost_type: getBoostType(item.plan_id),
        views: views,
        clicks: clicks,
        click_through_rate: parseFloat(click_through_rate.toFixed(2)),
        property_id: item.property_id,
        plan_id: item.plan_id || '',
        created_at: item.created_at,
        boost_status: (item.status as 'approved' | 'pending' | 'rejected') || 'pending',
        last_click_at: item.last_click_at,
        last_view_at: item.last_view_at
      };
    });

  } catch (error) {
    console.error('Erro ao buscar propriedades impulsionadas:', error);
    return [];
  }
}

export async function getPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
  try {
    // Primeiro busca os IDs das propriedades do usuário
    const { data: userProperties, error: propsError } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', userId);

    console.log('Propriedades do usuário:', userProperties);

    if (propsError) {
      console.error('Erro ao buscar propriedades do usuário:', propsError);
      return getDefaultMetrics();
    }

    const propertyIds = (userProperties || []).map((p: any) => p.id);

    if (propertyIds.length === 0) {
      return getDefaultMetrics();
    }

    // Busca métricas das propriedades impulsionadas do usuário
    const { data: boostedProperties, error } = await supabase
      .from('properties_to_boost')
      .select('views, clicks, plan_id, status, boost_end')
      .eq('status', 'active')
      .in('property_id', propertyIds);

    if (error) {
      console.error('Erro ao buscar métricas:', error);
      return getDefaultMetrics();
    }

    if (!boostedProperties || boostedProperties.length === 0) {
      return getDefaultMetrics();
    }

    const total_impressions = boostedProperties.reduce((sum, p) => sum + (p.views || 0), 0);
    const total_clicks = boostedProperties.reduce((sum, p) => sum + (p.clicks || 0), 0);
    const click_through_rate = total_impressions > 0 ? (total_clicks / total_impressions) * 100 : 0;
    
    const total_revenue = boostedProperties.reduce((sum, p) => {
      const planPrice = getPlanPrice(p.plan_id);
      return sum + planPrice;
    }, 0);

    const average_time_remaining = calculateAverageTimeRemaining(boostedProperties);

    return {
      total_impressions,
      total_clicks,
      click_through_rate: parseFloat(click_through_rate.toFixed(2)),
      average_time_remaining,
      total_revenue
    };

  } catch (error) {
    console.error('Erro ao calcular métricas:', error);
    return getDefaultMetrics();
  }
}

// Função para obter estatísticas de uma propriedade específica
export async function getBoostedPropertyStats(propertyId: string) {
  try {
    const { data, error } = await supabase
      .from('properties_to_boost')
      .select('views, clicks, last_click_at, last_view_at, boost_start, boost_end')
      .eq('property_id', propertyId)
      .single();

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }

    const views = data?.views || 0;
    const clicks = data?.clicks || 0;
    const click_through_rate = views > 0 ? (clicks / views) * 100 : 0;

    return {
      views,
      clicks,
      click_through_rate: parseFloat(click_through_rate.toFixed(2)),
      last_click_at: data?.last_click_at,
      last_view_at: data?.last_view_at,
      boost_start: data?.boost_start,
      boost_end: data?.boost_end
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return null;
  }
}

// Função para verificar se uma propriedade está impulsionada
export async function checkIfPropertyIsBoosted(propertyId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('properties_to_boost')
      .select('id')
      .eq('property_id', propertyId)
      .eq('status', 'active')
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar impulsionamento:', error);
    return false;
  }
}

// Funções auxiliares
function getBoostPlanName(planId: string): string {
  const plans: { [key: string]: string } = {
    'basico': 'Destaque Básico - 7 dias',
    'popular': 'Destaque Popular - 15 dias',
    'premium': 'Destaque Premium - 30 dias',
    'turbo': 'Destaque Turbo - 60 dias'
  };
  return plans[planId] || `Destaque - ${planId}`;
}

function getBoostType(planId: string): 'featured' | 'premium' | 'standard' {
  const types: { [key: string]: 'featured' | 'premium' | 'standard' } = {
    'basico': 'standard',
    'popular': 'featured',
    'premium': 'premium',
    'turbo': 'premium'
  };
  return types[planId] || 'standard';
}

function getPlanPrice(planId: string): number {
  const prices: { [key: string]: number } = {
    'basico': 10000,
    'popular': 18000,
    'premium': 30000,
    'turbo': 50000
  };
  return prices[planId] || 0;
}

function calculateAverageTimeRemaining(properties: any[]): string {
  const now = new Date();
  const activeProperties = properties.filter(p => p.status === 'active');
  
  if (activeProperties.length === 0) return '0 dias';

  const totalDays = activeProperties.reduce((sum, p) => {
    const expiry = new Date(p.boost_end);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    return sum + days;
  }, 0);

  const averageDays = Math.round(totalDays / activeProperties.length);
  return `${averageDays} dias`;
}

function getDefaultMetrics(): PerformanceMetrics {
  return {
    total_impressions: 0,
    total_clicks: 0,
    click_through_rate: 0,
    average_time_remaining: '0 dias',
    total_revenue: 0
  };
}


