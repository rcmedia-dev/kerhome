'use server';

import { supabase } from '@/lib/supabase';
import { Property } from '@/app/admin/dashboard/actions/get-properties';

interface Profile {
  id: string;
  primeiro_nome: string | null;
  ultimo_nome: string | null;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        status,
        description,
        tipo,
        endereco,
        created_at,
        gallery,
        caracteristicas,
        aprovement_status,
        video_url,
        documents,
        profiles:profiles!properties_owner_id_fkey(
          id, 
          primeiro_nome, 
          ultimo_nome
        )
      `)
      .eq('id', id)
      .single();

    if (propertyError) {
      console.error('Supabase error:', propertyError);
      throw new Error('Error fetching property');
    }

    if (!propertyData) {
      return null;
    }

    // Tratamento seguro do perfil do proprietário
    let ownerProfile = null;
    if (propertyData.profiles) {
      ownerProfile = Array.isArray(propertyData.profiles) 
        ? propertyData.profiles[0] 
        : propertyData.profiles;
    }

    const property: Property = {
      id: propertyData.id,
      title: propertyData.title,
      price: propertyData.price,
      status: propertyData.status,
      description: propertyData.description || '',
      tipo: propertyData.tipo,
      endereco: propertyData.endereco,
      created_at: propertyData.created_at,
      gallery: propertyData.gallery || [],
      caracteristicas: propertyData.caracteristicas || [],
      aprovement_status: propertyData.aprovement_status,
      video_url: propertyData.video_url || '',
      documents: propertyData.documents || [],
      owner_id: ownerProfile ? {
        id: ownerProfile.id,
        primeiro_nome: ownerProfile.primeiro_nome || '',
        ultimo_nome: ownerProfile.ultimo_nome || ''
      } : null
    };

    console.log('Fetched property:', property);
    return property;

  } catch (error) {
    console.error('Error in getPropertyById:', error);
    throw new Error('Failed to fetch property');
  }
}