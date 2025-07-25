// lib/actions/toggle-favorito.ts
'use server';

import prisma from '../prisma';

export async function toggleFavoritoProperty(userId: string, propertyId: string) {
  if (!userId || !propertyId) {
    return { success: false, error: 'Parâmetros inválidos' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imoveisGuardados: true },
    });

    if (!user) return { success: false, error: 'Usuário não encontrado' };

    const alreadyFavorited = user.imoveisGuardados.some((p) => p.id === propertyId);

    if (alreadyFavorited) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          imoveisGuardados: {
            disconnect: { id: propertyId },
          },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          imoveisGuardados: {
            connect: { id: propertyId },
          },
        },
      });
    }

    return { success: true, favoritado: !alreadyFavorited };
  } catch (error) {
    console.error('Erro ao favoritar:', error);
    return { success: false, error: 'Erro interno ao favoritar' };
  }
}
