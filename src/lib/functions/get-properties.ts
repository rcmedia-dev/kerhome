// src/lib/actions/get-properties.ts

'use server';

import z from 'zod';
import { createClient } from '@/lib/supabase/server';
import { propertyResponseSchema, TPropertyResponseSchema } from '@/lib/types/property';

export async function getProperties(): Promise<TPropertyResponseSchema[]> {
  const supabase = await createClient();
  try {
    const properties = await supabase.from('properties')
      .select('*')
      .eq('aprovement_status', 'approved')
      .order('created_at', { ascending: false });

    return properties.data as TPropertyResponseSchema[];
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    throw new Error('Erro ao buscar propriedades');
  }
}

export async function getMixedProperties(): Promise<{
  properties: z.infer<typeof propertyResponseSchema>[];
  stats: {
    total_boosted: number;
    premium_count: number;
    standard_count: number;
    basic_count: number;
    expired_count: number;
    total_properties: number;
  };
}> {
  const supabase = await createClient();
  try {
    console.log("🔍 Buscando propriedades com critérios corretos...");

    // Buscar propriedades principais
    const { data: propertiesData, error: propertiesError } = await supabase
      .from("properties")
      .select(`
        *,
        owner:profiles!owner_id (
          id,
          primeiro_nome,
          ultimo_nome,
          email,
          telefone,
          avatar_url,
          created_at
        ),
        imobiliarias (
          id,
          nome,
          slug,
          logo,
          verificada,
          telefone,
          whatsapp
        )
      `)
      .eq("aprovement_status", "approved")
      .in("status", ["comprar", "arrendar"])
      .order("created_at", { ascending: false });

    if (propertiesError) {
      console.error("❌ Erro ao buscar propriedades:", propertiesError);
      throw propertiesError;
    }

    console.log("📦 Propriedades encontradas:", propertiesData?.length);

    if (!propertiesData || propertiesData.length === 0) {
      return {
        properties: [],
        stats: {
          total_boosted: 0,
          premium_count: 0,
          standard_count: 0,
          basic_count: 0,
          expired_count: 0,
          total_properties: 0,
        },
      };
    }

    // Buscar boosts
    const propertyIds = propertiesData.map((p) => p.id);
    const { data: boostsData } = await supabase
      .from("properties_to_boost")
      .select("*")
      .in("property_id", propertyIds)
      .eq("status", "active");

    console.log("🚀 Boosts ativos encontrados:", boostsData?.length);

    // Aplicar lógica de mixing (priorizar impulsionados)
    const mixedProperties = propertiesData
      .map((property) => {
        const boost = boostsData?.find((b) => b.property_id === property.id);
        const isBoosted =
          boost && boost.status === "active" && boost.boost_end && new Date(boost.boost_end) > new Date();

        // Propriedades impulsionadas têm peso maior
        const weight = isBoosted ? Math.random() * 2 + 1 : Math.random();

        return {
          ...property,
          weight,
          is_boosted: isBoosted,
          boost_data: boost,
        };
      })
      .sort((a, b) => b.weight - a.weight);

    console.log("🎯 Propriedades misturadas:", mixedProperties.length);

    // Validação e transformação final
    const validatedProperties = mixedProperties
      .map((item) => {
        try {
          let detalhesadicionais = item.detalhes_adicionais || null;
          if (typeof detalhesadicionais === "string") {
            try {
              detalhesadicionais = JSON.parse(detalhesadicionais);
            } catch {
              detalhesadicionais = null;
            }
          }

          const ownerData = item.owner || {};
          const safeOwner = {
            id: ownerData.id || item.owner_id || "",
            email: ownerData.email || "",
            password: "",
            createdAt:
              ownerData.created_at && typeof ownerData.created_at === "string"
                ? ownerData.created_at
                : new Date().toISOString(),
            updatedAt:
              ownerData.created_at && typeof ownerData.created_at === "string"
                ? ownerData.created_at
                : new Date().toISOString(),
            primeiro_nome: ownerData.primeiro_nome || "",
            ultimo_nome: ownerData.ultimo_nome || "",
            username: "",
            telefone: ownerData.telefone || "",
            empresa: "",
            licenca: "",
            website: "",
            facebook: "",
            linkedin: "",
            instagram: "",
            youtube: "",
            sobre_mim: "",
          };

          const transformedData = {
            ...item,
            caracteristicas: item.caracteristicas || null,
            detalhesadicionais,
            garagemtamanho: item.garagem_tamanho || null,
            anoconstrucao: item.ano_construcao || null,
            notaprivada: item.nota_privada || null,
            createdAt: item.created_at,
            owner: safeOwner,
          };

          return propertyResponseSchema.parse(transformedData);
        } catch (validationError) {
          console.error("❌ Erro de validação na propriedade:", item.id);
          return null;
        }
      })
      .filter(
        (item): item is z.infer<typeof propertyResponseSchema> => item !== null
      );

    console.log("✅ Propriedades validadas:", validatedProperties.length);

    // Estatísticas
    const stats = {
      total_boosted: mixedProperties.filter((p) => p.is_boosted).length,
      premium_count: mixedProperties.filter(
        (p) => p.is_boosted && p.boost_data?.plan_id === "premium"
      ).length,
      standard_count: mixedProperties.filter(
        (p) => p.is_boosted && p.boost_data?.plan_id === "standard"
      ).length,
      basic_count: mixedProperties.filter(
        (p) => p.is_boosted && p.boost_data?.plan_id === "basic"
      ).length,
      expired_count:
        boostsData?.filter(
          (b) => b.status === "active" && b.boost_end && new Date(b.boost_end) <= new Date()
        ).length || 0,
      total_properties: validatedProperties.length,
    };

    console.log("📊 Estatísticas finais:", stats);

    return {
      properties: validatedProperties,
      stats,
    };
  } catch (error) {
    console.error("❌ Erro em getMixedProperties:", error);
    return {
      properties: [],
      stats: {
        total_boosted: 0,
        premium_count: 0,
        standard_count: 0,
        basic_count: 0,
        expired_count: 0,
        total_properties: 0,
      },
    };
  }
}

export async function getLimitedProperties(limit: number): Promise<TPropertyResponseSchema[]> {
  const supabase = await createClient();
  try {
    const properties = await supabase.from('properties')
      .select('*')
      .eq('aprovement_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    return properties.data as TPropertyResponseSchema[];
  } catch (e) {
    console.error(`Erro na propriedade:`, e);
    throw e;
  }
}

export async function getPropertyById(id: string | null): Promise<TPropertyResponseSchema | null> {
  const supabase = await createClient();
  try {
    const propertieById = await supabase.from('properties')
      .select(`
        *,
        owner:profiles!owner_id (
          id,
          primeiro_nome,
          ultimo_nome,
          email,
          telefone,
          avatar_url,
          created_at
        ),
        imobiliarias (
          id,
          nome,
          slug,
          logo,
          verificada,
          telefone,
          whatsapp
        )
      `)
      .eq('id', id)
      .eq('aprovement_status', 'approved')
      .single();

    return propertieById.data as TPropertyResponseSchema;
  } catch (error) {
    console.error("Erro ao buscar propriedade por ID:", error);
    return null;
  }
}

export async function getSupabaseUserProperties(userId?: string): Promise<TPropertyResponseSchema[]> {
  const supabase = await createClient();
  // Buscar propriedades do usuário
  const { data: propertiesData, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar propriedades do usuário:', error);
    return [];
  }

  if (!propertiesData || propertiesData.length === 0) {
    return [];
  }

  // Buscar informações de boost para as propriedades
  const propertyIds = propertiesData.map(prop => prop.id);

  const { data: boostsData, error: boostsError } = await supabase
    .from('properties_to_boost')
    .select('id, property_id, status, rejected_reason, created_at, plan_id')
    .in('property_id', propertyIds);

  if (boostsError) {
    console.error('Erro ao buscar informações de boost:', boostsError);
    // Retorna as propriedades mesmo sem as informações de boost
    return propertiesData;
  }

  // Criar um mapa para acesso rápido aos boosts por property_id
  const boostsMap = new Map();
  boostsData?.forEach(boost => {
    boostsMap.set(boost.property_id, {
      boost_id: boost.id,
      boost_status: boost.status,
      rejected_reason: boost.rejected_reason,
      boost_created_at: boost.created_at,
      plan_id: boost.plan_id
    });
  });

  // Combinar as informações
  const propertiesWithBoost = propertiesData.map(property => {
    const boostInfo = boostsMap.get(property.id);

    return {
      ...property,
      // Informações de boost (se existirem)
      boost_id: boostInfo?.boost_id || null,
      boost_status: boostInfo?.boost_status || null,
      rejected_reason: boostInfo?.rejected_reason || null,
      boost_created_at: boostInfo?.boost_created_at || null,
      plan_id: boostInfo?.plan_id || null,
      // Campo calculado para facilitar
      is_boosted: !!boostInfo && boostInfo.boost_status === 'active',
      is_boost_suspended: !!boostInfo && boostInfo.boost_status === 'rejected' && boostInfo.rejected_reason === 'suspicious'
    };
  });

  return propertiesWithBoost;
}
