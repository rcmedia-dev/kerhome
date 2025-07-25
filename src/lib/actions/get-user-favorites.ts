'use server';

import prisma from "../prisma";
import { favoritedPropertyResponseSchema, TFavoritedPropertyResponseSchema } from "../types/user";


export async function getUserFavorites(userId: string): Promise<TFavoritedPropertyResponseSchema[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        imoveisGuardados: true, // essa é a relação definida no modelo
      },
    });

    console.log('getUserFavorites user', user);

     const imoveisGuardadosValidados = user?.imoveisGuardados.map((imovel) =>
          favoritedPropertyResponseSchema.parse(imovel)
        );


      console.log('getUserFavorites', imoveisGuardadosValidados);
      return imoveisGuardadosValidados ?? [];
  } catch (error) {
    console.error('Erro ao buscar imóveis favoritos do usuário:', error);
    return [];
  }
}
