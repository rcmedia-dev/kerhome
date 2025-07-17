'use server';

import prisma from "../prisma";


export async function enviarMensagem({
  deId,
  paraId,
  conteudo,
}: {
  deId: string;
  paraId: string;
  conteudo: string;
}) {
  try {
    const nova = await prisma.mensagem.create({
      data: {
        deId,
        paraId,
        conteudo,
      },
    });

    return { sucesso: true, mensagem: nova };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return { sucesso: false, erro: 'Erro ao enviar a mensagem.' };
  }
}

export async function listarUsuariosQueMeEnviaramMensagens(userId?: string) {
  const mensagens = await prisma.mensagem.findMany({
    where: { paraId: userId },
    include: { de: true },
    distinct: ['deId'],
  });

  const remetentes = mensagens.map((msg) => ({
    id: msg.de.id,
    nome: msg.de.primeiro_nome ?? msg.de.username ?? 'Sem nome',
    avatar: '',
    status: 'offline',
    lastSeen: '',
  }));

  return remetentes;
}

export async function obterHistoricoMensagens(userA?: string, userB?: string) {
  return await prisma.mensagem.findMany({
    where: {
      OR: [
        { deId: userA, paraId: userB },
        { deId: userB, paraId: userA },
      ],
    },
    orderBy: { criadoEm: 'asc' },
  });
}
