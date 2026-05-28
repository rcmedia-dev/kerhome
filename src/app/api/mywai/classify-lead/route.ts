import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ temperature: 'none' });
    }

    const lastMessages = messages.slice(-6).map((m: any) =>
      `${m.sender_id === 'lead' ? 'Lead' : 'Agente'}: ${m.content?.slice(0, 200)}`
    ).join('\n');

    if (!WORKER_URL) {
      const text = messages.map((m: any) => m.content || '').join(' ').toLowerCase();
      if (text.includes('comprar') || text.includes('visitar') || text.includes('urgente') || text.includes('interessado')) {
        return Response.json({ temperature: 'hot' });
      }
      if (text.includes('preço') || text.includes('quanto') || text.includes('disp') || text.includes('info')) {
        return Response.json({ temperature: 'warm' });
      }
      return Response.json({ temperature: 'cold' });
    }

    const prompt = `Classifica a temperatura deste lead imobiliário como "hot", "warm" ou "cold" com base na conversa.

Regras:
- hot: Lead mostra urgência, quer comprar/visitar já, responde rápido
- warm: Lead pede informações, preços, condições, mostra interesse
- cold: Lead responde monossílabos, não demonstra interesse claro

Conversa:
${lastMessages}

Responde APENAS com uma palavra: hot, warm ou cold`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });

    if (!res.ok) return Response.json({ temperature: 'none' });

    const data = await res.json();
    const answer = data.answer;
    let extractedValue = '';

    if (typeof answer === 'string') {
      try {
        const parsed = JSON.parse(answer);
        extractedValue = parsed.type || parsed.classification || answer;
      } catch {
        extractedValue = answer;
      }
    } else if (typeof answer === 'object' && answer !== null) {
      extractedValue = answer.type || answer.classification || 'warm';
    }

    const normalized = extractedValue.trim().toLowerCase();
    const temp = ['hot', 'warm', 'cold'].includes(normalized) ? normalized : 'none';
    return Response.json({ temperature: temp });
  } catch {
    return Response.json({ temperature: 'none' });
  }
}
