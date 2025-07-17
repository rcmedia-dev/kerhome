'use server';

import prisma from "../prisma";

export async function getAgentByPropertyId(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      ownerId: true,
    },
  });

  if (!property) {
    console.warn(`⚠️ Propriedade com id "${propertyId}" não encontrada.`);
    return null;
  }

  if (!property.ownerId) {
    console.warn(`⚠️ Propriedade "${propertyId}" não tem ownerId.`);
    return null;
  }

  const agent = await prisma.user.findUnique({
    where: {
      id: property.ownerId,
    },
    select: {
      id: true,
      primeiro_nome: true,
      ultimo_nome: true,
      email: true,
    },
  });

  if (!agent) {
    console.warn(`⚠️ Usuário com id "${property.ownerId}" não encontrado.`);
    return null;
  }

  return {
    primeiro_nome: agent.primeiro_nome,
    ultimo_nome: agent.ultimo_nome,
    email: agent.email,
  };
}
