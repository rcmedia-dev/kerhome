// actions/property.ts
'use server';

import { supabase } from "@/lib/supabase";
import { propriedadeSchema } from "@/lib/types/property";


export async function createProperty(formData: FormData) {

  try {
    // Processar dados do formulário
    const data = {
      titulo_da_propriedade: formData.get('titulo_da_propriedade'),
      descricao_da_propriedade: formData.get('descricao_da_propriedade'),
      endereco_da_propriedade: formData.get('endereco_da_propriedade'),
      pais_da_propriedade: formData.get('pais_da_propriedade'),
      provincia_da_propriedade: formData.get('provincia_da_propriedade'),
      cidade_da_propriedade: formData.get('cidade_da_propriedade'),
      bairro_da_propriedade: formData.get('bairro_da_propriedade'),
      tipo_da_propriedade: formData.get('tipo_da_propriedade'),
      estatus_da_propriedade: formData.get('estatus_da_propriedade'),
      rotulo_da_propriedade: formData.get('rotulo_da_propriedade'),
      preco_da_propriedade: formData.get('preco_da_propriedade'),
      unidade_preco_da_propriedade: formData.get('unidade_preco_da_propriedade'),
      preco_chamada_da_propriedade: formData.get('preco_chamada_da_propriedade'),
      caracteristicas: formData.getAll('caracteristicas'),
      tamanho_da_propriedade: formData.get('tamanho_da_propriedade'),
      area_terreno_da_propriedade: formData.get('area_terreno_da_propriedade'),
      quartos_da_propriedade: formData.get('quartos_da_propriedade'),
      casas_banho_da_propriedade: formData.get('casas_banho_da_propriedade'),
      garagens_da_propriedade: formData.get('garagens_da_propriedade'),
      tamanho_garagen_da_propriedade: formData.get('tamanho_garagen_da_propriedade'),
      ano_construcao_da_propriedade: formData.get('ano_construcao_da_propriedade'),
      id_da_propriedade: formData.get('id_da_propriedade'),
      nota_da_propriedade: formData.get('nota_da_propriedade'),
      imagem_360_da_propriedade: formData.get('imagem_360_da_propriedade'),
      detalhes: Array.from(formData.entries())
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

    // Validar os dados
    const validatedData = propriedadeSchema.safeParse(data);
    
    if (!validatedData.success) {
      return {
        errors: validatedData.error.flatten().fieldErrors,
        message: 'Por favor, corrija os erros no formulário.',
      };
    }

    // Processar uploads de arquivos
    const imageUrls = await processFileUploads(
      supabase, 
      'property-images', 
      formData.getAll('imagens_da_propriedade') as File[]
    );

    const documentUrls = await processFileUploads(
      supabase,
      'property-documents',
      formData.getAll('documentos_da_propriedade') as File[]
    );

    const videoUrl = await processSingleFileUpload(
      supabase,
      'property-videos',
      formData.get('video_da_propriedade') as File | null
    );

    const image360Url = await processSingleFileUpload(
      supabase,
      'property-360-images',
      formData.get('imagem_360_da_propriedade') as File | null
    );

    // Inserir no banco de dados
    const { data: insertedData, error } = await supabase.from('properties').insert({
      ...validatedData.data,
      imagens_da_propriedade: imageUrls,
      documentos_da_propriedade: documentUrls,
      video_da_propriedade: videoUrl,
      imagem_360_da_propriedade: image360Url,
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