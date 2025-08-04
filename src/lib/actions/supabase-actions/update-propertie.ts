'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

interface PropertyData {
  id: string;
  title?: string;
  description?: string;
  tipo?: string;
  status?: string;
  price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  endereco?: string;
  cidade?: string;
  bairro?: string;
  caracteristicas?: string[];
  detalhes_adicionais?: { titulo: string; valor: string }[];
  ano_construcao?: number | null;
  area_terreno?: number | null;
  garagens?: number | null;
  garagem_tamanho?: string;
  pais?: string;
  provincia?: string;
  rotulo?: string;
  preco_chamada?: string;
  unidade_preco?: string;
}

export async function updateProperty(id: string, formData: PropertyData) {
  try {
    // Converter valores numéricos vazios para null
    const sanitizedData = {
      ...formData,
      price: formData.price ?? null,
      bedrooms: formData.bedrooms ?? null,
      bathrooms: formData.bathrooms ?? null,
      size: formData.size ?? null,
      ano_construcao: formData.ano_construcao ?? null,
      area_terreno: formData.area_terreno ?? null,
      garagens: formData.garagens ?? null,
    };

    // Preparar os dados para o Supabase
    const { detalhes_adicionais, ...propertyData } = sanitizedData;
    
    // Converter detalhes_adicionais para JSON string
    const detailsJson = detalhes_adicionais ? 
      JSON.stringify(detalhes_adicionais) : null;
    
    // Garantir que características seja um array válido
    const featuresArray = Array.isArray(formData.caracteristicas) 
      ? formData.caracteristicas.filter(Boolean)
      : [];

    // Atualizar a propriedade no Supabase
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...propertyData,
        caracteristicas: featuresArray,
        detalhes_adicionais: detailsJson,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Erro ao atualizar propriedade: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Nenhum dado retornado ao atualizar propriedade');
    }

    // Revalidar cache
    revalidatePath('/dashboard/properties');
    revalidatePath(`/dashboard/editar-imovel/${id}`);
    
    return {
      success: true,
      message: 'Propriedade atualizada com sucesso!',
      property: data[0]
    };

  } catch (error) {
    console.error('Error in updateProperty:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao atualizar propriedade'
    };
  }
}