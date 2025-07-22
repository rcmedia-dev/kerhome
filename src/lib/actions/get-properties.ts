// src/lib/actions/get-properties.ts

'use server';

import prisma from '../prisma';
import { propertyResponseSchema, TPropertyResponseSchema } from '../types/property';

export async function getProperties(): Promise<TPropertyResponseSchema[]> {
  try {
    const propriedades = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' }, // ordena por data de criação
      include: {
        // Se quiser incluir relações (ex: dono, categoria, etc.)
        owner: true,
        // outros relacionamentos aqui, se houver
      },
    });

    const propriedadesValidas = propriedades
      .filter((p) => p.propertyid !== null && p.propertyid !== undefined)
      .map((propriedade) => propertyResponseSchema.parse(propriedade));


    return propriedadesValidas;
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    throw new Error('Erro ao buscar propriedades');
  }
}

export async function getLimitedProperties(limit: number): Promise<TPropertyResponseSchema[]> {
  try {
    const propriedades = await prisma.property.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        owner: true, // inclui dados do dono da propriedade
      },
    });

    // Validação com Zod
    const propriedadesValidas = propriedades
      .filter((p) => p.propertyid !== null && p.propertyid !== undefined)
      .map((propriedade, index) => {
        try {
          return propertyResponseSchema.parse(propriedade);
        } catch (e) {
          console.error(`Erro na propriedade #${index}:`, propriedade);
          throw e;
        }
      });

    return propriedadesValidas;
  } catch (error) {
    console.error('Erro ao buscar propriedades limitadas:', error);
    throw new Error('Erro ao buscar propriedades limitadas');
  }
};


export async function getPropertyById(id: string): Promise<TPropertyResponseSchema | null> {
  try {
    const propriedade = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });

    if (!propriedade) return null;

    const propriedadeValidada = propertyResponseSchema.parse(propriedade);
    return propriedadeValidada;
  } catch (error) {
    console.error("Erro ao buscar propriedade por ID:", error);
    return null;
  }
}


export async function getUserProperties(userId?: string): Promise<TPropertyResponseSchema[]> {

  try {
    const propriedade = await prisma.property.findMany({
      where: {
        ownerId: userId, // ou 'autorId', dependendo do seu modelo
      },
      include: {
        owner: true, // inclui dados do dono da propriedade
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const propriedadesValidas = propriedade
      .map((propriedade) => propertyResponseSchema.parse(propriedade));

    console.log('Propriedades do usuário:', propriedadesValidas);
    return propriedadesValidas;
  } catch (error) {
    console.error('Erro ao buscar propriedades do usuário:', error);
    return [];
  }
}
