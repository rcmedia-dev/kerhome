'use server'

import prisma from '@/lib/prisma';
import { ownerSchema } from '../types/property';

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

export async function getAgentByPropertyId(propertyId: string) {
  try {
    // Busca a propriedade com o owner associado
    const propriedade = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: true,
      },
    });

    if (!propriedade || !propriedade.owner) {
      return null;
    }

    // Valida o owner com o schema do Zod
    const agenteValidado = ownerSchema.parse(propriedade.owner);

    return agenteValidado;
  } catch (error) {
    console.error("Erro ao buscar agente pelo ID da propriedade:", error);
    return null;
  }
}
