'use server';

import prisma from "../prisma";
import { PrismaProperty } from "../types/property";


export async function getUserFavorites(userId: string): Promise<PrismaProperty[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        imoveisGuardados: true, // essa é a relação definida no modelo
      },
    });

    return user?.imoveisGuardados ?? [];
  } catch (error) {
    console.error('Erro ao buscar imóveis favoritos do usuário:', error);
    return [];
  }
}
