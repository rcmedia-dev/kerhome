import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

// Strip common AI greeting prefixes from responses
function stripGreeting(text: string): string {
  if (!text) return text;

  // Remove lines that are generic greetings/preambles about the property
  // e.g. "Olá! Agradecemos a sua pergunta sobre o Resort..."
  // e.g. "Claro! Com base nas informações disponíveis sobre..."
  const greetingPatterns = [
    /^(Olá[!,.]?\s*){1,2}(Agradecemos|Obrigado|Com base|Claro|Sim|Certamente|Com prazer)[^.!?]*[.!?]\s*/i,
    /^(Claro[!,.]?\s*)(Com base|Baseado|De acordo|Segundo)[^.!?]*[.!?]\s*/i,
    /^(Com base nas informações (disponíveis |fornecidas )?sobre[^,]*,?\s*)/i,
    /^(Baseado nas informações (disponíveis |fornecidas )?sobre[^,]*,?\s*)/i,
    /^(De acordo com as informações[^,]*,?\s*)/i,
    /^(Segundo as informações[^,]*,?\s*)/i,
    /^(Relativamente a(o|à) [^,]+,\s*)/i,
  ];

  let result = text.trim();
  for (const pattern of greetingPatterns) {
    result = result.replace(pattern, '').trim();
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { message, propertyContext, history = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ erro: 'Mensagem inválida' }, { status: 400 });
    }

    // Build a focused question with strict instructions to answer directly
    const questionWithContext = propertyContext
      ? `És um assistente de imobiliária. Responde de forma direta e objetiva, SEM saudações, SEM introduções como "Olá", "Agradecemos", "Com base nas informações", "Claro!" ou qualquer prefixo. Vai direto à resposta.

Informações do imóvel:
${propertyContext}

Pergunta: ${message}`
      : message;

    if (WORKER_URL) {
      const workerBody = {
        question: questionWithContext,
        history: history.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
        topK: 3,
      };

      const workerRes = await fetch(`${WORKER_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerBody),
      });

      if (!workerRes.ok) {
        return Response.json({ erro: 'Erro no servidor de IA' }, { status: workerRes.status });
      }

      const data = await workerRes.json();
      const rawAnswer = data.answer || data.resposta || '';
      return Response.json({ answer: stripGreeting(rawAnswer) });
    }

    // Fallback: no worker configured
    return Response.json({
      answer: 'Para informações detalhadas, contacta o anunciante diretamente ou visita a página completa do imóvel.',
    });
  } catch (err) {
    return Response.json({ erro: 'Erro interno', detalhe: String(err) }, { status: 500 });
  }
}
