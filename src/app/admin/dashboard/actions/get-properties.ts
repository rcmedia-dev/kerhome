// src/app/admin/dashboard/actions/get-properties.ts
'use server';

import { createClient } from '@/lib/supabase/server';

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
  image: string | null;   // imagem de capa
  gallery: string[];
  video_url?: string;
  documents?: string[];
  aprovement_status: 'approved' | 'pending' | 'rejected';
  owner_id: PropertyOwner | null;
}

export async function getProperties(): Promise<Property[]> {
  const supabase = await createClient();
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
        image,
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

    return formattedData;

  } catch (err) {
    console.error('Error in getProperties:', err);
    throw new Error('Failed to fetch properties');
  }
}
