import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const { stats, ownerId, periodDays } = await req.json();

    if (!stats || !ownerId) {
      return Response.json({ erro: 'Dados insuficientes' }, { status: 400 });
    }

    const total = stats.total || 0;
    const contacts = stats.total_contacts || 0;
    const shares = stats.total_shares || 0;
    const summary = stats.summary || {};
    const convRate = total > 0 ? Math.round((contacts / total) * 100) : 0;
    const topEvent = Object.entries(summary).sort(([, a]: any, [, b]: any) => b - a)[0];
    const topEventName = topEvent ? topEvent[0].replace(/_/g, ' ') : 'nenhum';

    if (!WORKER_URL) {
      return Response.json({
        insight: `Nos últimos ${periodDays} dias, o teu perfil gerou ${total} interações. A principal fonte de tráfego foi "${topEventName}" com ${topEvent ? (topEvent[1] as any) : 0} ocorrências. A taxa de conversão em contactos foi de ${convRate}%.`,
        highlights: [
          `${total} interações totais`,
          `${contacts} contactos diretos`,
          `${convRate}% taxa de conversão`,
          `${shares} partilhas`,
        ],
        recommendation: topEventName.includes('whatsapp')
          ? 'O WhatsApp é o teu melhor canal. Responde rapidamente para maximizar conversões.'
          : topEventName.includes('chat')
            ? 'O chat do site está a gerar leads. Mantém-te disponível para responder em tempo real.'
            : 'Investe em melhorar as descrições e fotos dos teus imóveis para atrair mais contactos.',
      });
    }

    const prompt = `Analisa estas estatísticas de um agente imobiliário nos últimos ${periodDays} dias e gera um resumo de performance em português (pt-AO).

Dados:
- Total de interações: ${total}
- Contactos: ${contacts}
- Partilhas: ${shares}
- Taxa de conversão: ${convRate}%
- Eventos por tipo: ${JSON.stringify(summary)}

Responde APENAS com um objeto JSON (sem markdown):
{
  "insight": "Parágrafo curto com análise geral da performance.",
  "highlights": ["top 3 destaques"],
  "recommendation": "Uma recomendação prática para melhorar resultados."
}`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });

    if (!res.ok) throw new Error('Worker error');

    const data = await res.json();
    const answer = data.answer;
    let parsed: any;

    if (typeof answer === 'string') {
      try {
        parsed = JSON.parse(answer);
      } catch {
        throw new Error('Invalid JSON from worker');
      }
    } else if (typeof answer === 'object' && answer !== null) {
      parsed = answer;
    } else {
      throw new Error('Invalid answer from worker');
    }

    return Response.json({
      insight: parsed.insight || '',
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      recommendation: parsed.recommendation || '',
    });
  } catch {
    return Response.json({ erro: 'Erro ao gerar resumo' }, { status: 500 });
  }
}
