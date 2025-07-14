'use server';

import prisma from '@/lib/prisma';

export type Plano = 'Básico' | 'Professional' | 'Super Corretor';

const planoConfig = {
  Básico: {
    limite: 10,
    destaques: false,
    destaquesPermitidos: 1,
    valor: 0,
  },
  Professional: {
    limite: 100,
    destaques: true,
    destaquesPermitidos: 5,
    valor: 5000,
  },
  'Super Corretor': {
    limite: 9999,
    destaques: true,
    destaquesPermitidos: 9999,
    valor: 10000,
  },
};

export async function updateUserPlan(userId: string, newPlan: Plano) {
  const config = planoConfig[newPlan];

  try {
    const planoExistente = await prisma.planoAgente.findUnique({
      where: { userId },
    });

    if (!planoExistente) {
      await prisma.planoAgente.create({
        data: {
          nome: newPlan,
          limite: config.limite,
          restante: config.limite,
          destaques: config.destaques,
          destaquesPermitidos: config.destaquesPermitidos,
          userId,
        },
      });
    } else {
      await prisma.planoAgente.update({
        where: { userId },
        data: {
          nome: newPlan,
          limite: config.limite,
          restante: config.limite,
          destaques: config.destaques,
          destaquesPermitidos: config.destaquesPermitidos,
        },
      });
    }

    // Adicionar fatura com o nome do plano como "servico"
    await prisma.fatura.create({
      data: {
        userId,
        valor: config.valor,
        status: config.valor ? 'pago' : 'pendente',
        servico: `Plano ${newPlan}`, // ← aqui está o nome do serviço
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar plano:', error.message);
    return { success: false, error: error.message };
  }
}
