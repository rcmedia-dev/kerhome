'use server';

import prisma from "../prisma";
import { Fatura } from "../types/agent";

export async function getUserInvoices(userId: string): Promise<Fatura[]> {
  try {
    const invoices = await prisma.fatura.findMany({
      where: { userId: userId },
      orderBy: { criadoEm: 'desc' },
    });

    // Converter Date -> string (ISO)
    const invoicesCorrigidas: Fatura[] = invoices.map((fatura) => ({
      ...fatura,
      criadoEm: fatura.criadoEm.toISOString(),
    }));

    return invoicesCorrigidas;
  } catch (error) {
    console.error('Erro ao buscar faturas do usuário:', error);
    return [];
  }
}
