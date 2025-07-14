// lib/actions/get-user-plan.ts
'use server';

import prisma from "../prisma";


export async function getUserPlan(userId: string) {
  return await prisma.planoAgente.findUnique({
    where: { userId },
  });
}
