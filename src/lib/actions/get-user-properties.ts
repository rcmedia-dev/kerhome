'use server'

import prisma from '../prisma';
import { PropertyResponse } from '../types/property';

export async function getUserProperties(userId: string): Promise<PropertyResponse[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Propriedades:', properties);
    return properties
  } catch (error) {
    console.error('Erro ao buscar propriedades do usuário:', error);
    return [];
  }
}

