'use server';

import prisma from '@/lib/prisma';

export async function updateUserProfile(userId: string, data: any) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data,
    });

    return { success: true };
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return { success: false, error: 'Erro ao atualizar perfil.' };
  }
}
