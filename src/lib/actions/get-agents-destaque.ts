'use server'

import prisma from "../prisma";

export async function getAgentesDestaque(limit = 3) {
  const agentes = await prisma.user.findMany({
    take: limit,
    orderBy: {
      properties: {
        _count: 'desc',
      },
    },
    include: {
      properties: true,
    },
  });

  return agentes.map(a => ({
    nome: `${a.primeiro_nome ?? ''} ${a.ultimo_nome ?? ''}`.trim(),
    email: a.email,
    vendas: a.properties.length,
  }));
}
