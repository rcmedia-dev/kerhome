'use server';

import { propriedadeSchema } from '../types/property';
import prisma from '@/lib/prisma';

export async function createProperty(formData: FormData, ownerId: string | null) {
  const raw = Object.fromEntries(formData.entries());
  console.log('Dados recebidos para criação de propriedade:', raw);

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
  if (!ownerId) return { error: 'Usuário não autenticado.' };

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
        unidade_preco: data.unidade_preco_da_propriedade.toLocaleString() || '',
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
        gallery: [data.imagens_da_propriedade], // Placeholder, handle file uploads separately
      },
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Erro ao salvar o imóvel no banco de dados.' };
  }
}
