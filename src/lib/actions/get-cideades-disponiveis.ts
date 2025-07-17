// lib/actions/get-cidades-disponiveis.ts
'use server';

import prisma from '../prisma';

export async function getCidadesDisponiveis() {
  const result = await prisma.property.groupBy({
    by: ['provincia'],
    _count: { provincia: true },
    where: {
      provincia: { not: null },
    },
  });

  // Retorna no formato { nome: string, quantidade: number }[]
  return result.map((item) => ({
    nome: item.provincia || 'Desconhecida',
    quantidade: item._count.provincia,
  }));
}
