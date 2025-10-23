'use server';

import { supabase } from "@/lib/supabase";
import { getDefaultPacotes } from "@/lib/types/utils";


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

export async function addPropertiesToBoost(propertyIds: string[], planId: string) {
  try {

    // Busca o plano escolhido
    const pacote = getDefaultPacotes().find((p) => p.id === planId);
    if (!pacote) throw new Error("Plano inválido");

    const durationDays = pacote.dias;

    const boostData = propertyIds.map((propertyId) => ({
      property_id: propertyId,
      plan_id: planId,
      boost_start: new Date().toISOString(),
      boost_end: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
      views: 0,
    }));

    const { data, error } = await supabase
      .from("properties_to_boost")
      .insert(boostData)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Erro ao processar destaque:", error);
    throw error;
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

    console.log('Dados das propriedades impulsionadas:', data);

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
        views: Number(item.views) || 0,
        clicks: Number(item.clicks) || 0,
        property_id: item.property_id,
        plan_id: item.plan_id || '',
        created_at: item.created_at,
        boost_status: (item.status as 'approved' | 'pending' | 'rejected') || 'pending'
      };
    });

  } catch (error) {
    console.error('Erro ao buscar propriedades impulsionadas:', error);
    return [];
  }
}

export async function getPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
  try {
    // Primeiro busca as propriedades do usuário
    const { data: userProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', userId);

    if (propertiesError || !userProperties) {
      return getDefaultMetrics();
    }

    const userPropertyIds = userProperties.map(prop => prop.id);

    // Busca métricas apenas das propriedades do usuário
    const { data: boostedProperties, error } = await supabase
      .from('properties_to_boost')
      .select('views, plan_id, status')
      .in('property_id', userPropertyIds);

    if (error) {
      console.error('Erro ao buscar métricas:', error);
      return getDefaultMetrics();
    }

    if (!boostedProperties || boostedProperties.length === 0) {
      return getDefaultMetrics();
    }

    const activeProperties = boostedProperties.filter(p => p.status === 'active');
    
    const total_impressions = activeProperties.reduce((sum, p) => sum + (p.views || 0), 0);
    
    // Calcular receita total baseada nos planos
    const total_revenue = activeProperties.reduce((sum, p) => {
      const planPrice = getPlanPrice(p.plan_id);
      return sum + planPrice;
    }, 0);

    // Calcular tempo médio restante (simplificado)
    const average_time_remaining = calculateAverageTimeRemaining(boostedProperties);

    return {
      total_impressions,
      total_clicks: 0,
      click_through_rate: 0,
      average_time_remaining,
      total_revenue
    };

  } catch (error) {
    console.error('Erro ao calcular métricas:', error);
    return getDefaultMetrics();
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