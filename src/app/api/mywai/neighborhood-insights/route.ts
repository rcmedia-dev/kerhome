import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const { cidade, bairro, provincia } = await req.json();

    if (!cidade && !bairro) {
      return Response.json({ erro: 'Cidade ou bairro são obrigatórios' }, { status: 400 });
    }

    if (!WORKER_URL) {
      return Response.json(buildFallback(cidade, bairro, provincia));
    }

    const prompt = `Fornece uma análise do bairro/vizinhança para potenciais compradores de imóveis.

Localização:
Cidade: ${cidade || 'Não informada'}
Bairro: ${bairro || 'Não informado'}
Província: ${provincia || 'Não informada'}

Responde APENAS com um objeto JSON válido, sem formatação markdown:
{
  "overview": "Descrição geral do bairro, ambiente e perfil.",
  "pros": ["Vantagem 1", "Vantagem 2", "Vantagem 3"],
  "cons": ["Desvantagem 1", "Desvantagem 2"],
  "infrastructure": "Informações sobre transportes, comércio, escolas e saúde nas proximidades.",
  "investmentTip": "Dica sobre potencial de valorização ou cuidado ao investir nesta zona."
}`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });

    if (!res.ok) {
      return Response.json(buildFallback(cidade, bairro, provincia));
    }

    const data = await res.json();
    const answer = data.answer;
    let parsed: any;

    if (typeof answer === 'string') {
      try {
        parsed = JSON.parse(answer);
      } catch {
        return Response.json(buildFallback(cidade, bairro, provincia));
      }
    } else if (typeof answer === 'object' && answer !== null) {
      parsed = answer;
    } else {
      return Response.json(buildFallback(cidade, bairro, provincia));
    }

    return Response.json({
      overview: parsed.overview || '',
      pros: Array.isArray(parsed.pros) ? parsed.pros : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons : [],
      infrastructure: parsed.infrastructure || '',
      investmentTip: parsed.investmentTip || '',
    });
  } catch {
    return Response.json({ erro: 'Erro ao processar pedido' }, { status: 500 });
  }
}

function buildFallback(cidade?: string, bairro?: string, provincia?: string) {
  const location = [bairro, cidade, provincia].filter(Boolean).join(', ') || 'esta localização';
  return {
    overview: `${location} — sem informações detalhadas disponíveis no momento. Consulte o mapa da região para mais detalhes.`,
    pros: ['Consulte o agente imobiliário para mais informações sobre a região'],
    cons: [],
    infrastructure: 'Informações sobre infraestrutura não disponíveis para esta localização.',
    investmentTip: 'Recomenda-se visitar o bairro pessoalmente e conversar com moradores locais.',
  };
}
