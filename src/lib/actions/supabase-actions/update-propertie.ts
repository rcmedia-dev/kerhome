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
  size?: string | null;
  area_terreno?: number | null;
  garagens?: number | null;
  garagem_tamanho?: string;
  ano_construcao?: number | null;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  provincia?: string;
  pais?: string;
  rotulo?: string;
  unidade_preco?: string;
  preco_chamada?: string;
  caracteristicas?: string[];
  detalhes_adicionais?: { titulo: string; valor: string }[];
  coverFile?: File | null;
  galleryFiles?: File[] | null;
  image?: string | null;
  gallery?: string[] | null;
  video_url?: string;
  is_featured?: boolean;
  nota_privada?: string;
}

// Upload de arquivo para o Supabase Storage
async function uploadFileToSupabase(file: File, bucket: string, path: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${path}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const fileBuffer = await file.arrayBuffer();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Erro no upload: ${error.message}`);
  }

  // Obter URL pública do arquivo
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

// Deletar arquivo do Supabase Storage
async function deleteFileFromSupabase(bucket: string, filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw new Error(`Erro ao deletar arquivo: ${error.message}`);
  }
}

// Extrair caminho do arquivo a partir da URL pública
function extractFilePathFromUrl(url: string, bucket: string): string {
  const baseUrl = `${supabase.storage.from(bucket).getPublicUrl('').data.publicUrl}`;
  return url.replace(baseUrl, '').replace(/^\//, '');
}

// Processar uploads de arquivos para uma propriedade
async function processPropertyUploads(formData: PropertyData, existingProperty?: any) {
  const processedData: any = {};

  // Processar imagem de capa
  if (formData.coverFile instanceof File && formData.coverFile.size > 0) {
    // Se havia uma imagem anterior, deletá-la
    if (existingProperty?.image) {
      try {
        const oldFilePath = extractFilePathFromUrl(existingProperty.image, 'properties');
        await deleteFileFromSupabase('properties', oldFilePath);
      } catch (error) {
        console.error('Erro ao deletar imagem anterior:', error);
      }
    }
    
    processedData.image = await uploadFileToSupabase(
      formData.coverFile, 
      'files', 
      'images'
    );
  } else if (formData.image) {
    processedData.image = formData.image;
  } else {
    processedData.image = null;
  }

  // Processar galeria de imagens
  if (Array.isArray(formData.galleryFiles) && formData.galleryFiles.length > 0) {
    const galleryUrls: string[] = existingProperty?.gallery || [];
    
    for (const file of formData.galleryFiles) {
      if (file instanceof File && file.size > 0) {
        const url = await uploadFileToSupabase(file, 'files', 'gallery');
        galleryUrls.push(url);
      }
    }
    
    processedData.gallery = galleryUrls;
  } else if (formData.gallery) {
    processedData.gallery = formData.gallery;
  } else {
    processedData.gallery = [];
  }

  return processedData;
}

// Atualizar propriedade com suporte a upload de imagens
export async function updateProperty(id: string, formData: PropertyData) {
  try {
    // Buscar propriedade existente para gerenciar exclusão de arquivos antigos
    const { data: existingProperty } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    // Processar uploads de arquivos
    const uploadedData = await processPropertyUploads(formData, existingProperty);

    // Converter valores numéricos vazios para null
    const sanitizedData = {
      ...formData,
      price: formData.price ?? null,
      bedrooms: formData.bedrooms ?? null,
      bathrooms: formData.bathrooms ?? null,
      area_terreno: formData.area_terreno ?? null,
      garagens: formData.garagens ?? null,
      ano_construcao: formData.ano_construcao ?? null,
      ...uploadedData
    };

    // Preparar os dados para o Supabase
    const { detalhes_adicionais, coverFile, galleryFiles, ...propertyData } = sanitizedData;
    
    // Converter detalhes_adicionais para JSON
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

// Deletar imagem da galeria
export async function deleteGalleryImage(propertyId: string, imageUrl: string) {
  try {
    // Extrair caminho do arquivo a partir da URL
    const filePath = extractFilePathFromUrl(imageUrl, 'properties');
    
    // Deletar do storage
    await deleteFileFromSupabase('properties', filePath);
    
    // Remover da lista de imagens da propriedade
    const { data: property } = await supabase
      .from('properties')
      .select('gallery')
      .eq('id', propertyId)
      .single();
    
    if (property) {
      const updatedGallery = property.gallery.filter((img: string) => img !== imageUrl);
      
      await supabase
        .from('properties')
        .update({ gallery: updatedGallery })
        .eq('id', propertyId);
    }
    
    revalidatePath(`/dashboard/editar-imovel/${propertyId}`);
    
    return { success: true, message: 'Imagem deletada com sucesso!' };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao deletar imagem'
    };
  }
}