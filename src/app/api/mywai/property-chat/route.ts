import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const { message, propertyContext, history = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ erro: 'Mensagem inválida' }, { status: 400 });
    }

    // Build a question that includes the property context so the AI can answer specifically
    const questionWithContext = propertyContext
      ? `Contexto do imóvel:\n${propertyContext}\n\nPergunta do utilizador: ${message}`
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
      return Response.json({ answer: data.answer || data.resposta || '' });
    }

    // Fallback: no worker configured, give a generic helpful response
    return Response.json({
      answer: `Sobre este imóvel: ${message} — Para informações detalhadas, contacta o anunciante diretamente ou visita a página completa do imóvel.`,
    });
  } catch (err) {
    return Response.json({ erro: 'Erro interno', detalhe: String(err) }, { status: 500 });
  }
}
