import { AIResponse, SearchParams } from '@/types/ai-actions';
import { NLPProcessor } from './nlp-processor';
import { PropertyMatcher } from './property-matcher';

const WORKER_URL = process.env.CF_WORKER_URL;

export class AIEngine {
  private nlp = new NLPProcessor();
  private matcher = new PropertyMatcher();

  async processMessage(mensagem: string): Promise<AIResponse> {
    const nlpParams = this.nlp.extractParams(mensagem);
    const hasNlpParams = Object.keys(nlpParams).length > 0;

    let intent = hasNlpParams ? 'property_search' : 'chat';
    let finalParams = nlpParams;
    let description = '';
    let confidence = hasNlpParams ? 0.6 : 0.3;

    try {
      const aiResult = await this.callAI(mensagem, nlpParams);
      if (aiResult) {
        if (aiResult.intent === 'chat' && !hasNlpParams) {
          intent = 'chat';
          finalParams = {};
          confidence = 0.7;
        } else if (aiResult.intent === 'property_search' || hasNlpParams) {
          intent = 'property_search';
          finalParams = this.mergeParams(nlpParams, aiResult.params || {});
          description = aiResult.description || '';
          confidence = 0.9;
        }
      }
    } catch {}

    if (intent === 'chat') {
      return {
        intent: 'chat',
        action: { type: 'CHAT' },
        message: description || 'Como posso ajudar-te a encontrar imóveis?',
        description: description || '',
        confidence,
        suggestions: [
          'Apartamentos T3 em Luanda',
          'Casas até 30 milhões',
          'Imóveis no Talatona',
        ],
      };
    }

    return {
      intent: 'property_search',
      action: { type: 'SEARCH_PROPERTIES', params: finalParams, description },
      message: description || 'Pesquisa de imóveis',
      description,
      confidence,
      count: 0,
    };
  }

  private async callAI(mensagem: string, nlpParams: SearchParams): Promise<{ intent: string; params?: SearchParams; description?: string } | null> {
    if (!WORKER_URL) return null;

    const prompt = `És um assistente imobiliário angolano. Analisa a mensagem do utilizador.

Mensagem: "${mensagem}"

Parâmetros já extraídos localmente: ${JSON.stringify(nlpParams)}

Tarefas:
1. Confirma se a mensagem é sobre imóveis. Se NÃO for, intent:"chat"
2. Se for sobre imóveis, intent:"property_search"
3. Gera uma descrição amigável do que foi encontrado
4. Remove parâmetros que NÃO correspondem à mensagem original
5. REGRA ABSOLUTA: NUNCA adiciones parâmetros que não foram mencionados na mensagem
6. Se a mensagem não menciona preço, NÃO incluas preco_max ou preco_min
7. Se a mensagem não menciona localização, NÃO incluas cidade ou bairro
8. Se "q" (keyword) for igual ao tipo ou muito genérica, remove-a

Exemplos:
- "quero casas" → {"intent":"property_search","params":{"tipo":"Casa"},"description":"A procurar casas"}
- "quero um T3" → {"intent":"property_search","params":{"quartos":3},"description":"A procurar imóveis T3"}
- "olá" → {"intent":"chat","params":{},"description":""}

Responde APENAS com JSON válido:
{"intent":"property_search","params":{"tipo":"Casa","cidade":"Luanda"},"description":"Casas em Luanda"}`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: prompt,
        history: [],
        stream: false,
        topK: 1,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const answer = data.answer;

    if (typeof answer === 'string') {
      try { return JSON.parse(answer); } catch {}
      const m = answer.match(/\{[\s\S]*\}/);
      if (m) { try { return JSON.parse(m[0]); } catch {} }
    } else if (answer && typeof answer === 'object') {
      return answer;
    }

    return null;
  }

  private mergeParams(nlp: SearchParams, ai: SearchParams): SearchParams {
    const result: SearchParams = { ...nlp };

    for (const key of Object.keys(ai) as (keyof SearchParams)[]) {
      const aiVal = ai[key];
      const nlpHasKey = key in nlp && nlp[key] !== undefined;

      if (aiVal === undefined || aiVal === null || aiVal === '') {
        if (nlpHasKey) delete result[key];
      } else if (nlpHasKey) {
        (result as any)[key] = typeof nlp[key] === 'number' ? Number(aiVal) : aiVal;
      }
    }

    if (result.q && result.tipo) {
      const keywords = result.q.toLowerCase().split(/\s+/);
      const tipoLower = result.tipo.toLowerCase();
      const filtered = keywords.filter(k => k !== tipoLower && k !== tipoLower + 's');
      if (filtered.length === 0) delete result.q;
      else result.q = filtered.join(' ');
    }

    return result;
  }
}
