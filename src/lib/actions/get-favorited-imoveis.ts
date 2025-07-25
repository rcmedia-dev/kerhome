// lib/actions/get-imoveis-favoritos.ts
'use server';

import prisma from '../prisma';
import { favoritedPropertyResponseSchema, TFavoritedPropertyResponseSchema } from '../types/user';

export async function getImoveisFavoritos(userId?: string): Promise<TFavoritedPropertyResponseSchema[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        imoveisGuardados: {
          include: {
            owner: true,
          },
        },
      },
    });

    const imoveisGuardadosValidados = user?.imoveisGuardados.map((imovel) =>
      favoritedPropertyResponseSchema.parse(imovel)
    );

    console.log('getImoveisFavoritos', imoveisGuardadosValidados);

    return imoveisGuardadosValidados ?? [];

    return imoveisGuardadosValidados ?? [];
  } catch (error) {
    console.error("Erro ao buscar imóveis guardados:", error);
    return [];
  }
}
