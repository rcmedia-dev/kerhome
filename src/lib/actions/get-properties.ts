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
    .map((p) => {
      const parsedCaracteristicas =
        typeof p.caracteristicas === 'string'
          ? JSON.parse(p.caracteristicas)
          : p.caracteristicas;

      return propertyResponseSchema.parse({
        ...p,
        caracteristicas: parsedCaracteristicas,
      });
    });

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
   const propriedadesValidas: TPropertyResponseSchema[] = propriedades
  .filter((p) => p.propertyid !== null && p.propertyid !== undefined)
  .map((propriedade, index) => {
    try {
      const caracteristicasCorrigidas =
        typeof propriedade.caracteristicas === 'string'
          ? JSON.parse(propriedade.caracteristicas)
          : propriedade.caracteristicas;

      return propertyResponseSchema.parse({
        ...propriedade,
        caracteristicas: caracteristicasCorrigidas,
      });
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

    const propriedadesValidas = propriedade.map((propriedade: TPropertyResponseSchema, index: number) => {
      try {
        const caracteristicasCorrigidas =
          typeof propriedade.caracteristicas === 'string'
            ? JSON.parse(propriedade.caracteristicas)
            : propriedade.caracteristicas;

        const propriedadeCorrigida = {
          ...propriedade,
          caracteristicas: caracteristicasCorrigidas,
        };

        console.log('Propriedade recebida Map:', propriedadeCorrigida);

        return propertyResponseSchema.parse(propriedadeCorrigida);
      } catch (error) {
        console.error(`Erro ao validar propriedade #${index}`, propriedade);
        throw error;
      }
    });



    return propriedadesValidas;
  } catch (error) {
    console.error('Erro ao buscar propriedades do usuário:', error);
    return [];
  }
}
