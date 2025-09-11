// src/lib/actions/get-properties.ts

'use server';

import { supabase } from '../supabase';
import { TPropertyResponseSchema, TPropriedadeFormData } from '../types/property';

export async function getProperties(): Promise<TPropertyResponseSchema[]> {
  try {
    const properties = await supabase.from('properties')
      .select('*')
      .eq('aprovement_status', 'aprovado') // Filtro adicionado aqui
      .order('created_at', { ascending: false });

    return properties.data as TPropertyResponseSchema[];
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    throw new Error('Erro ao buscar propriedades');
  }
}

export async function getLimitedProperties(limit: number): Promise<TPropertyResponseSchema[]> {
  try {
    const properties = await supabase.from('properties')
      .select('*')
      .eq('aprovement_status', 'aprovado') // Filtro adicionado aqui
      .order('created_at', { ascending: false })
      .limit(limit);

    return properties.data as TPropertyResponseSchema[];
    } catch (e) {
      console.error(`Erro na propriedade:`, e);
      throw e;
    }
}

export async function getPropertyById(id: string | null): Promise<TPropertyResponseSchema | null> {
  try {
    const propertieById = await supabase.from('properties')
      .select('*')
      .eq('id', id)
      .eq('aprovement_status', 'aprovado') // Filtro adicionado aqui
      .single();

    return propertieById.data as TPropertyResponseSchema;
  } catch (error) {
    console.error("Erro ao buscar propriedade por ID:", error);
    return null;
  }
}

export async function getSupabaseUserProperties(userId?: string): Promise<TPropertyResponseSchema[]> {
  const {data: propertiesData, error} = await supabase.from('properties')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar propriedades do usuário:', error);
    return [];
  }

  return propertiesData;
}