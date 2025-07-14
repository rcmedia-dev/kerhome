'use server';

import prisma from '@/lib/prisma';

export async function getUserProfile(userId?: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return {
      primeiro_nome: user.primeiro_nome || '',
      ultimo_nome: user.ultimo_nome || '',
      username: user.username || '',
      telefone: user.telefone || '',
      empresa: user.empresa || '',
      licenca: user.licenca || '',
      website: user.website || '',
      facebook: user.facebook || '',
      linkedin: user.linkedin || '',
      instagram: user.instagram || '',
      youtube: user.youtube || '',
      sobre_mim: user.sobre_mim || '',
    };
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return null;
  }
}
