import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const { properties } = await req.json();
    if (!Array.isArray(properties) || properties.length < 2) {
      return Response.json({ erro: 'São necessários pelo menos 2 imóveis' }, { status: 400 });
    }

    if (!WORKER_URL) {
      const p = properties.map((x: any, i: number) => `${i + 1}. ${x.title} — Kz ${Number(x.price).toLocaleString()}`).join('\n');
      return Response.json({
        summary: `Comparação de ${properties.length} imóveis:\n${p}\n\nCada imóvel tem características diferentes em termos de preço, localização e tipo. Recomendo analisar a tabela comparativa para decidir.`,
      });
    }

    const list = properties.map((p: any, i: number) =>
      `Imóvel ${i + 1}: "${p.title}" | ${p.tipo} | ${p.cidade}${p.bairro ? `, ${p.bairro}` : ''} | ${p.bedrooms || '?'} quartos | ${p.bathrooms || '?'} banheiros | ${p.garagens || '?'} garagens | ${p.size || '?'} m² | Kz ${Number(p.price).toLocaleString()} | ${p.status}`
    ).join('\n');

    const prompt = `Analisa estes imóveis e faz um resumo comparativo destacando as principais diferenças e qual pode ser a melhor escolha em diferentes cenários (ex: melhor para família, melhor custo-benefício, melhor localização).

Imóveis:
${list}

Responde em português (pt-AO), num parágrafo curto e direto.`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });

    if (!res.ok) {
      return Response.json({ summary: 'Compra estes imóveis lado a lado na tabela abaixo.' });
    }

    const data = await res.json();
    return Response.json({ summary: data.answer || '' });
  } catch {
    return Response.json({ summary: 'Compara os imóveis na tabela abaixo.' });
  }
}
