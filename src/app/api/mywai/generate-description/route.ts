import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const { property } = await req.json();
    if (!property) {
      return Response.json({ erro: 'Dados do imóvel são obrigatórios' }, { status: 400 });
    }

    const { tipo, cidade, bairro, bedrooms, bathrooms, garagens, size, price, status, caracteristicas } = property;

    if (!WORKER_URL) {
      return Response.json({
        description: `${tipo || 'Imóvel'} localizado em ${cidade || ''}${bairro ? `, ${bairro}` : ''}, com ${bedrooms || '?'} quartos, ${bathrooms || '?'} banheiros e ${garagens || '?'} vagas de garagem. Área útil de ${size || '?'} m². ${status === 'comprar' ? 'À venda' : 'Para arrendar'} por Kz ${Number(price || 0).toLocaleString()}.${caracteristicas?.length ? ` Destaques: ${caracteristicas.join(', ')}.` : ''}`,
      });
    }

    const prompt = `Gera uma descrição profissional e atrativa para um imóvel em português (pt-AO). A descrição deve ter 2-3 parágrafos, ser persuasiva e destacar os pontos fortes.

Dados do imóvel:
Tipo: ${tipo || 'Imóvel'}
Cidade: ${cidade || ''}
Bairro: ${bairro || ''}
Quartos: ${bedrooms || '?'}
Banheiros: ${bathrooms || '?'}
Garagens: ${garagens || '?'}
Área: ${size || '?'} m²
Preço: Kz ${Number(price || 0).toLocaleString()}
Estado: ${status === 'comprar' ? 'Venda' : 'Arrendamento'}
Características: ${caracteristicas?.join(', ') || 'Não especificadas'}

Responde APENAS com um objeto JSON (sem markdown):
{
  "description": "Descrição completa do imóvel em pt-AO."
}`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });

    if (!res.ok) throw new Error('Worker error');

    const data = await res.json();
    const answer = data.answer;
    let description = '';

    if (typeof answer === 'string') {
      try {
        const parsed = JSON.parse(answer);
        description = parsed.description || answer;
      } catch {
        description = answer;
      }
    } else if (answer && typeof answer === 'object') {
      description = answer.description || '';
    }

    return Response.json({ description });
  } catch {
    return Response.json({ erro: 'Erro ao gerar descrição' }, { status: 500 });
  }
}
