import { NextRequest } from 'next/server';
import { AIEngine } from '@/lib/ai-engine';

const engine = new AIEngine();

export async function POST(req: NextRequest) {
  try {
    const { mensagem } = await req.json();
    if (!mensagem || typeof mensagem !== 'string') {
      return Response.json({ erro: 'Mensagem inválida' }, { status: 400 });
    }

    const result = await engine.processMessage(mensagem);
    return Response.json(result);
  } catch (err) {
    return Response.json({
      intent: 'chat',
      action: { type: 'CHAT' },
      message: 'Desculpa, ocorreu um erro. Tenta novamente.',
      description: '',
      confidence: 0,
      suggestions: ['Apartamentos T3 em Luanda', 'Casas até 30 milhões', 'Imóveis no Talatona'],
    });
  }
}
