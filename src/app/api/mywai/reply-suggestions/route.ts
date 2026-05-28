import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const { messages, propertyContext } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({
        suggestions: [
          'Olá! Obrigado pelo interesse. Gostaria de agendar uma visita?',
          'Sim, ainda está disponível. Posso enviar mais informações?',
          'Fazemos simulação de crédito sem compromisso. Tem interesse?',
        ],
      });
    }

    const context = messages.map((m: any) => `${m.role === 'user' ? 'Lead' : 'Agente'}: ${m.content}`).join('\n');
    const propInfo = propertyContext
      ? `Contexto do imóvel: ${propertyContext.title || ''} - ${propertyContext.cidade || ''} - Kz ${Number(propertyContext.price || 0).toLocaleString()}`
      : '';

    if (!WORKER_URL) {
      return Response.json({
        suggestions: [
          'Obrigado pelo seu interesse! Gostaria de agendar uma visita ao imóvel?',
          'Sim, o imóvel está disponível. Posso ajudar com mais informações?',
          'Podemos marcar uma chamada para discutir os detalhes?',
        ],
      });
    }

    const prompt = `Com base na conversa abaixo, sugere 3 respostas curtas e profissionais que o agente imobiliário pode usar para responder ao lead. As respostas devem ser em português (pt-AO).

${propInfo}

Conversa:
${context}

Responde APENAS com um objeto JSON (sem markdown):
{
  "suggestions": ["resposta 1", "resposta 2", "resposta 3"]
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
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    });
  } catch {
    return Response.json({
      suggestions: [
        'Obrigado pelo interesse! Quer agendar uma visita?',
        'Estou aqui para ajudar. O que gostaria de saber?',
        'Posso enviar mais detalhes por email?',
      ],
    });
  }
}
