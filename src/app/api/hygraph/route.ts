import { NextResponse } from "next/server";
import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_API_URL;
const token = process.env.NEXT_PUBLIC_HYGRAPH_TOKEN;

export async function POST(req: Request) {
  if (!endpoint) {
    console.error("NEXT_PUBLIC_HYGRAPH_API_URL não está definida no servidor");
    return NextResponse.json(
      { error: "Hygraph endpoint não configurado" },
      { status: 500 }
    );
  }

  try {
    const { query, variables } = await req.json();

    const client = new GraphQLClient(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await client.request(query, variables);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro na API Hygraph:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Erro ao comunicar com Hygraph" },
      { status: 500 }
    );
  }
}
