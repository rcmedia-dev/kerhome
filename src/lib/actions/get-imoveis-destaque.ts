'use server';

import prisma from '../prisma';

export async function getImoveisDestaque() {
  const imoveis = await prisma.property.findMany({
    take: 4,
    orderBy: {
      createdAt: 'desc', // ou 'id', se preferires
    },
    select: {
      id: true,
      title: true,
      cidade: true,
      price: true,
      unidade_preco: true,
      gallery: true,
      status: true, // 'para comprar' ou 'para alugar'
    },
  });

  return imoveis;
}
