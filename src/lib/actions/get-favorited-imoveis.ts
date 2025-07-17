// lib/actions/get-imoveis-favoritos.ts
'use server';

import prisma from '../prisma';

export async function getImoveisFavoritos(userId: string) {
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

    return user?.imoveisGuardados ?? [];
  } catch (error) {
    console.error("Erro ao buscar imóveis guardados:", error);
    return [];
  }
}
