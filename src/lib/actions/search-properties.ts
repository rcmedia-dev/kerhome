'use server';

import { parsePrismaProperties } from '../parse-propertie';
import prisma from '../prisma';
import { PropertyResponse } from '../types/property';

interface SearchPropertiesParams {
  q?: string;
  status?: string;
  tipo?: string;
  banhos?: number;
  quartos?: number;
  garagens?: number;
  preco?: number;
  tamanho?: number;
}

export async function searchProperties({
  q,
  status,
  tipo,
  banhos,
  quartos,
  garagens,
  preco,
  tamanho,
}: SearchPropertiesParams): Promise<PropertyResponse[]> {
  try {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (banhos !== undefined) {
      where.banhos = banhos;
    }

    if (quartos !== undefined) {
      where.quartos = quartos;
    }

    if (garagens !== undefined) {
      where.garagens = garagens;
    }

    if (preco !== undefined) {
      where.preco = {
        lte: preco,
      };
    }

    if (tamanho !== undefined) {
      where.tamanho = {
        gte: tamanho,
      };
    }

    if (q) {
      const search = {
        contains: q,
        mode: 'insensitive' as const,
      };

      where.OR = [
        { title: search },
        { endereco: search },
        { bairro: search },
        { cidade: search },
        { provincia: search },
        { pais: search },
        { descricao: search },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedProperties: PropertyResponse[] = parsePrismaProperties(properties)

    return formattedProperties;
  } catch (error: any) {
    console.error('Erro ao buscar propriedades:', error.message);
    return [];
  }
}
