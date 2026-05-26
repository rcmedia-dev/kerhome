import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mensagens = body.mensagens as { role: string; content: string }[];
    const stream = !!body.stream;

    if (WORKER_URL) {
      const lastUserMsg = mensagens.filter(m => m.role === 'user').pop();
      const workerBody = {
        question: lastUserMsg?.content || '',
        history: mensagens.filter(m => m.role !== 'system'),
        stream,
        topK: 5,
      };

      const workerRes = await fetch(`${WORKER_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerBody),
      });

      if (!workerRes.ok) {
        return Response.json({ erro: 'Erro no servidor de IA' }, { status: workerRes.status });
      }

      if (stream) {
        return new Response(workerRes.body, {
          headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' },
        });
      }

      const data = await workerRes.json();
      return Response.json({ resposta: data.answer, modelo: 'cloudflare-ai' });
    }

    return Response.json({ erro: 'CF_WORKER_URL not set' }, { status: 500 });
  } catch (err) {
    return Response.json({ erro: 'Erro interno', detalhe: String(err) }, { status: 500 });
  }
}
