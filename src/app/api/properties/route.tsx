
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            primeiro_nome: true,
            ultimo_nome: true,
            email: true,
          },
        },
        guardadoPor: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar propriedades:", error);
    return NextResponse.json({ message: "Erro ao buscar propriedades" }, { status: 500 });
  }
}
