'use server'

import prisma from '@/lib/prisma';

export async function getAgenteData(email: string) {
  const agente = await prisma.user.findUnique({
    where: { email },
    include: {
      properties: {
        take: 3,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!agente) return null;

  return {
    nome: `${agente.primeiro_nome ?? ''} ${agente.ultimo_nome ?? ''}`.trim(),
    email: agente.email,
    telefone: agente.telefone ?? '',
    titulo: 'Agente de Imóveis',
    descricao: agente.sobre_mim ?? '',
    imoveis: agente.properties.map((p) => ({
      id: p.id,
      titulo: p.title,
      local: `${p.cidade ?? ''} - ${p.bairro ?? ''}`,
      preco: `${p.price?.toLocaleString()} Kz`,
      imagem: p.image ?? '/placeholder.jpg',
    })),
  };
}
