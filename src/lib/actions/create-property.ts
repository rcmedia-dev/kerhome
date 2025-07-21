'use server';

import { propriedadeSchema } from '../types/property';
import { getSupabaseClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

export async function createProperty(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());

  const caracteristicas = formData.getAll('caracteristicas') as string[];
  const detalhes = formData.getAll('detalhes') as string[];

  const rawComArrays = {
    ...raw,
    caracteristicas,
    detalhes,
  };

  const parse = propriedadeSchema.safeParse(rawComArrays);

  if (!parse.success) {
    return { error: parse.error.flatten() };
  }

  const data = parse.data;
  const ownerId = raw.ownerId as string;
  if (!ownerId) return { error: 'Usuário não autenticado.' };

  let imagem360Url = '';

  const imagem360 = formData.get('imagem_360_da_propriedade') as File | null;

  if (imagem360 && imagem360 instanceof File && imagem360.size > 0) {
    try {
      const supabase = getSupabaseClient();

      const fileExt = imagem360.name.split('.').pop();
      const fileName = `property-360-${Date.now()}.${fileExt}`;
      const filePath = `imoveis/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(filePath, imagem360, {
          contentType: imagem360.type,
          upsert: true,
        });

      if (uploadError) {
        return { error: 'Erro ao enviar imagem para o Supabase Storage.' };
      }

      const { data: publicUrlData } = supabase.storage
        .from('imoveis')
        .getPublicUrl(filePath);

      imagem360Url = publicUrlData?.publicUrl ?? '';
    } catch (e) {
      console.error('Erro no upload da imagem:', e);
      return { error: 'Erro inesperado no upload da imagem.' };
    }
  }

  try {
    await prisma.property.create({
      data: {
        ownerId,
        title: data.titulo_da_propriedade,
        description: data.descricao_da_propriedade,
        tipo: data.tipo_da_propriedade,
        status: data.estatus_da_propriedade,
        rotulo: data.rotulo_da_propriedade || '',
        price: data.preco_da_propriedade,
        unidade_preco: data.unidade_preco_da_propriedade || '',
        preco_chamada: data.preco_chamada_da_propriedade,
        caracteristicas,
        size: data.tamanho_da_propriedade || '',
        area_terreno: Number(data.area_terreno_da_propriedade) || 0,
        bedrooms: Number(data.quartos_da_propriedade) || 0,
        bathrooms: Number(data.casas_banho_da_propriedade) || 0,
        garagens: Number(data.garagens_da_propriedade) || 0,
        garagemtamanho: data.tamanho_garagen_da_propriedade,
        anoconstrucao: Number(data.ano_construcao_da_propriedade),
        notaprivada: data.nota_da_propriedade,
        endereco: data.endereco_da_propriedade,
        pais: data.pais_da_propriedade,
        provincia: data.provincia_da_propriedade,
        cidade: data.cidade_da_propriedade,
        bairro: data.bairro_da_propriedade,
        detalhesadicionais: detalhes,
        gallery: data.imagens_da_propriedade ,
      },
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Erro ao salvar o imóvel no banco de dados.' };
  }
}
