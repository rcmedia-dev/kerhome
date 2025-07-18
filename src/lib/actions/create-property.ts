'use server';

import prisma from '@/lib/prisma';
import { upPropertySchema } from '../types/property';

export async function createProperty(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parse = upPropertySchema.safeParse(raw);

  if (!parse.success) {
    return { error: parse.error.flatten() };
  }

  const data = parse.data;
  const ownerId = formData.get('ownerId') as string;

  if (!ownerId) return { error: "Usuário não autenticado." };

  try {
    await prisma.property.create({
      data: {
        ownerId,
        title: data.titulo,
        description: data.descricao,
        tipo: data.tipo,
        status: data.status,
        rotulo: data.rotulo || "",
        price: data.preco,
        unidade_preco: data.unidade_preco || "",
        preco_antes: data.preco_antes,
        preco_depois: data.preco_depois,
        preco_chamada: data.preco_chamada,
        caracteristicas: data.caracteristicas || [],
        size: data.size || "",
        area_terreno: data.area_terreno,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        garagens: data.garagens,
        garagemtamanho: data.garagemtamanho,
        anoconstrucao: data.anoconstrucao,
        notaprivada: data.notaprivada,
        endereco: data.endereco,
        pais: data.pais,
        provincia: data.provincia,
        cidade: data.cidade,
        bairro: data.bairro,
        detalhesadicionais: data.detalhesadicionais || [],
      },
    });

    return { success: true };
  } catch (e) {
    console.error("[ERRO AO CRIAR IMÓVEL]", e);
    return { error: "Erro ao salvar o imóvel no banco de dados." };
  }
}
