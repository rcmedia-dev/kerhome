'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';

type DetalheAdicional = { titulo: string; valor: string };

interface PropertyInput {
  ownerId: string;
  title: string;
  description: string;
  tipo: string;
  status: string;
  rotulo?: string;
  price?: number;
  unidade_preco?: string;
  preco_antes?: number;
  preco_depois?: number;
  preco_chamada?: string;
  caracteristicas?: string[];
  size?: string;
  area_terreno?: number;
  bedrooms?: number;
  bathrooms?: number;
  garagens?: number;
  garagemtamanho?: string;
  anoconstrucao?: number;
  propertyid?: string;
  detalhesadicionais?: DetalheAdicional[];
  endereco?: string;
  bairro?: string;
  cidade?: string;
  provincia?: string;
  pais?: string;
  notaprivada?: string;
  gallery: string[];
  image?: string;
}

export async function createProperty(input: PropertyInput) {
  try {
    const property = await prisma.property.create({
      data: {
        ownerId: input.ownerId,
        title: input.title,
        description: input.description,
        tipo: input.tipo,
        status: input.status,
        rotulo: input.rotulo,
        price: input.price,
        unidade_preco: input.unidade_preco,
        preco_antes: input.preco_antes,
        preco_depois: input.preco_depois,
        preco_chamada: input.preco_chamada,
        caracteristicas: input.caracteristicas as any, // Prisma aceita Json
        size: input.size,
        area_terreno: input.area_terreno,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        garagens: input.garagens,
        garagemtamanho: input.garagemtamanho,
        anoconstrucao: input.anoconstrucao,
        propertyid: input.propertyid,
        detalhesadicionais: input.detalhesadicionais as any, // também Json
        endereco: input.endereco,
        bairro: input.bairro,
        cidade: input.cidade,
        provincia: input.provincia,
        pais: input.pais,
        notaprivada: input.notaprivada,
        gallery: input.gallery,
        image: input.image,
      },
    });

    revalidatePath('/dashboard'); // Opcional: refaz cache

    return { success: true, data: property };
  } catch (error) {
    console.error('[CREATE_PROPERTY_ERROR]', error);
    return { success: false, error: 'Erro ao cadastrar imóvel.' };
  }
}
