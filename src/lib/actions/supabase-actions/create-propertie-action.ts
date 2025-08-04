// actions/property.ts
'use server';

import { supabase } from "@/lib/supabase";


export async function createProperty(formData: FormData) {


  try {
    // Processar dados do formulário
    const data = {
      owner_id: formData.get('owner_id'),
      title: formData.get('titulo_da_propriedade'),
      description: formData.get('descricao_da_propriedade'),
      endereco: formData.get('endereco_da_propriedade'),
      pais: formData.get('pais_da_propriedade'),
      provincia: formData.get('provincia_da_propriedade'),
      cidade: String(formData.get('cidade_da_propriedade')?.toString() || ''), // Corrigido para aceitar string vazia
      bairro: formData.get('bairro_da_propriedade'),
      tipo: formData.get('tipo_da_propriedade'),
      status: formData.get('estatus_da_propriedade'),
      rotulo: formData.get('rotulo_da_propriedade'),
      price: formData.get('preco_da_propriedade'),
      unidade_preco: formData.get('unidade_preco_da_propriedade'),
      preco_chamada: formData.get('preco_chamada_da_propriedade'),
      caracteristicas: formData.getAll('caracteristicas'),
      size: formData.get('tamanho_da_propriedade'),
      area_terreno: formData.get('area_terreno_da_propriedade'),
      bedrooms: formData.get('quartos_da_propriedade'),
      bathrooms: formData.get('casas_banho_da_propriedade'),
      garagens: formData.get('garagens_da_propriedade'),
      garagem_tamanho: formData.get('tamanho_garagen_da_propriedade'),
      ano_construcao: formData.get('ano_construcao_da_propriedade'),
      propertyid: formData.get('id_da_propriedade'),
      gallery: formData.getAll('imagens_da_propriedade'),
      nota_privada: formData.get('nota_da_propriedade'),
      detalhes_adicionais: Array.from(formData.entries())
        .filter(([key]) => key.startsWith('detalhes'))
        .reduce((acc: any[], [key, value]) => {
          const match = key.match(/detalhes\.(\d+)\.(titulo|valor)/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2];
            if (!acc[index]) acc[index] = { titulo: '', valor: '' };
            acc[index][field] = value.toString();
          }
          return acc;
        }, [])
    };

    // Processar uploads de arquivos
    const imageUrls = await processFileUploads(
      supabase, 
      'images/images', 
      formData.getAll('imagens_da_propriedade') as File[]
    );

    const documentUrls = await processFileUploads(
      supabase,
      'files/docs',
      formData.getAll('documentos_da_propriedade') as File[]
    );

    const videoUrl = await processSingleFileUpload(
      supabase,
      'files/images',
      formData.get('video_da_propriedade') as File | null
    );

    const image360Url = await processSingleFileUpload(
      supabase,
      'images/images',
      formData.get('imagem_360_da_propriedade') as File | null
    );

    // Inserir no banco de dados
    const { data: insertedData, error } = await supabase.from('properties').insert({
      ...data,
      gallery: imageUrls,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).select();

    if (error) throw error;

    return {
      success: true,
      message: 'Imóvel cadastrado com sucesso!',
      propertyId: insertedData?.[0]?.id
    };

  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Erro ao cadastrar imóvel. Por favor, tente novamente.',
      errors: {}
    };
  }
}

// Funções auxiliares para upload de arquivos
async function processFileUploads(supabase: any, bucket: string, files: File[]) {
  const urls = [];
  for (const file of files) {
    if (file.size > 0) {
      const filePath = `${bucket}/${Date.now()}-${file.name}`;
      const { data: uploadData, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);
      
      urls.push(urlData.publicUrl);
    }
  }
  return urls;
}

async function processSingleFileUpload(supabase: any, bucket: string, file: File | null) {
  if (!file || file.size === 0) return null;
  
  const filePath = `${bucket}/${Date.now()}-${file.name}`;
  const { data: uploadData, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(uploadData.path);
  
  return urlData.publicUrl;
}