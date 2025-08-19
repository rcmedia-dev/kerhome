// src/app/actions/getProperties.ts
'use server';

import { supabase } from '@/lib/supabase';

export interface PropertyOwner {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  description?: string;
  status: 'alugar' | 'comprar' | 'vendido';
  tipo: string;
  caracteristicas?: string[];
  endereco: string;
  created_at: Date | string;
  gallery: string[];
  video_url?: string;
  documents?: string[];
  aprovement_status: 'aprovado' | 'pending' | 'rejeitado';
  owner_id: PropertyOwner | null;
}

export async function getProperties(): Promise<Property[]> {
  try {
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        description,
        status,
        tipo,
        caracteristicas,
        endereco,
        created_at,
        gallery,
        video_url,
        documents,
        aprovement_status,
        owner_id:profiles!properties_owner_id_fkey (
          id,
          primeiro_nome,
          ultimo_nome
        )
      `)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Supabase error:', propertiesError);
      throw new Error('Error fetching properties');
    }

    // Aqui não precisamos de verificar length, já vem como objeto ou null
    const formattedData: Property[] = (propertiesData || []).map((p: any) => ({
      ...p,
      owner_id: p.owner_id ?? null
    }));

    console.log('Fetched properties:', formattedData);
    return formattedData;

  } catch (err) {
    console.error('Error in getProperties:', err);
    throw new Error('Failed to fetch properties');
  }
}
