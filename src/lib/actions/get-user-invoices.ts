'use server';

import prisma from "../prisma";
import { Fatura } from "../types/faturas";


export async function getUserInvoices(userId: string): Promise<Fatura[]> {
  try {
    const invoices = await prisma.fatura.findMany({
      where: { userId: userId },
      orderBy: { criadoEm: 'desc' },
    });

    return invoices;
  } catch (error) {
    console.error('Erro ao buscar faturas do usuário:', error);
    return [];
  }
}
