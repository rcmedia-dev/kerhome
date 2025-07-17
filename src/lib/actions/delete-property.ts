// src/lib/actions/delete-property.ts
'use server';

import prisma from '../prisma';

export async function deletePropertyById(id: string) {
  try {
    await prisma.property.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao eliminar propriedade:', error);
    return { success: false, error: 'Falha ao eliminar propriedade.' };
  }
}
