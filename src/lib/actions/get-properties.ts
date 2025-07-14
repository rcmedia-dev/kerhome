'use server';

import prisma from "../prisma";
import { PropertyResponse } from "../types/property";


// Buscar lista de imóveis com Prisma
export async function getProperties(limit: number = 50): Promise<PropertyResponse[]> {
  try {
    const properties = await prisma.property.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc', // opcional
      },
    });

    return properties as PropertyResponse[];
  } catch (error: any) {
    console.error('Erro ao buscar propriedades:', error.message);
    return [];
  }
}

// Buscar imóvel por ID com Prisma
export async function getPropertyById(id: string): Promise<PropertyResponse | null> {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id,
      },
    });

    return property as PropertyResponse | null;
  } catch (error: any) {
    console.error('Erro ao buscar imóvel por ID:', error.message);
    return null;
  }
}

export async function getPropertiesByOwner(ownerId: string): Promise<PropertyResponse[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return properties;
  } catch (error: any) {
    console.error('Erro ao buscar propriedades:', error.message);
    return [];
  }
}