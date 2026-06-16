import { createClient } from '@/lib/supabase/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export interface AIReviewResult {
  decision: 'approved' | 'rejected' | 'needs_review';
  confidence: number;
  score: number;
  reasons: string[];
}

export async function reviewPropertyAI(propertyId: string): Promise<AIReviewResult> {
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (!property) {
    return { decision: 'needs_review', confidence: 0, score: 0, reasons: ['Imóvel não encontrado'] };
  }

  if (!WORKER_URL) {
    return { decision: 'needs_review', confidence: 0, score: 50, reasons: ['Revisor de IA indisponível'] };
  }

  const prompt = buildReviewPrompt(property);

  const res = await fetch(`${WORKER_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
  });

  if (!res.ok) {
    return { decision: 'needs_review', confidence: 0, score: 50, reasons: ['Erro ao contactar o revisor de IA'] };
  }

  const data = await res.json();
  const answer = data.answer;

  let parsed: any;
  if (typeof answer === 'string') {
    try { parsed = JSON.parse(answer); } catch {}
  } else if (typeof answer === 'object' && answer !== null) {
    parsed = answer;
  }

  if (!parsed || !parsed.decision) {
    return { decision: 'needs_review', confidence: 0, score: 50, reasons: ['Resposta inválida do revisor de IA'] };
  }

  const result: AIReviewResult = {
    decision: ['approved', 'rejected', 'needs_review'].includes(parsed.decision) ? parsed.decision : 'needs_review',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
    score: typeof parsed.score === 'number' ? parsed.score : 50,
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
  };

  if (result.decision === 'approved' && result.confidence >= 0.7) {
    await supabase
      .from('properties')
      .update({ aprovement_status: 'approved' })
      .eq('id', propertyId);
  } else if (result.decision === 'rejected' && result.confidence >= 0.7) {
    await supabase
      .from('properties')
      .update({
        aprovement_status: 'rejected',
        rejection_reason: result.reasons.join('; '),
      })
      .eq('id', propertyId);

    // Notificar proprietário sobre rejeição com os motivos
    const { data: property } = await supabase
      .from('properties')
      .select('title, owner_id')
      .eq('id', propertyId)
      .single();

    if (property) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('primeiro_nome, ultimo_nome, email, telefone')
        .eq('id', property.owner_id)
        .single();

      if (owner) {
        const webhookUrl = 'https://n8n.srv1157846.hstgr.cloud/webhook/notificate';
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evento: 'imovel_rejeitado',
            dados: {
              nome: `${owner.primeiro_nome || ''} ${owner.ultimo_nome || ''}`.trim(),
              email: owner.email,
              telefone: owner.telefone || '',
              imovel_titulo: property.title,
              imovel_id: propertyId,
              motivos: result.reasons,
              score: result.score,
            },
          }),
        }).catch((err) => console.error('Erro ao notificar rejeição de imóvel:', err));
      }
    }
  }

  return result;
}

function buildReviewPrompt(property: any): string {
  return `Analisa este anúncio imobiliário como moderador da plataforma Kercasa e retorna uma decisão estruturada em JSON.

Imóvel:
Título: ${property.title || ''}
Descrição: ${property.description || ''}
Tipo: ${property.tipo || ''}
Finalidade: ${property.status || ''}
Preço: ${property.price || 0} ${property.unidade_preco || 'Kz'}
Área: ${property.size || 0} m²
Quartos: ${property.bedrooms || 0}
Banheiros: ${property.bathrooms || 0}
Garagem: ${property.garagens || 0}
Cidade: ${property.cidade || ''}
Bairro: ${property.bairro || ''}
Província: ${property.provincia || ''}
Características: ${Array.isArray(property.caracteristicas) ? property.caracteristicas.join(', ') : property.caracteristicas || ''}
Tem imagem de capa: ${property.image ? 'Sim' : 'Não'}
Quantidade de fotos: ${Array.isArray(property.gallery) ? property.gallery.length : 0}

Critérios de avaliação:
1. COMPLETUDE: Título, descrição, preço, endereço e imagem de capa estão preenchidos corretamente? (obrigatório)
2. CONSISTÊNCIA: O preço é realista para o tipo/tamanho/localização?
3. QUALIDADE: A descrição é detalhada e bem escrita? (não genérica ou spam)
4. LEGITIMIDADE: O anúncio parece genuíno e não é spam?

Regras de decisão:
- Aprovar automaticamente se: campos obrigatórios preenchidos + descrição coerente + anúncio genuíno
- Rejeitar automaticamente se: faltar título, descrição, preço, endereço ou imagem de capa, OU se for spam
- needs_review se: campos obrigatórios preenchidos mas preço ou descrição geram dúvida

Responde APENAS com um objeto JSON válido, sem markdown:
{
  "decision": "approved" | "rejected" | "needs_review",
  "confidence": 0.95,
  "score": 85,
  "reasons": ["Descrição completa e detalhada", "Preço compatível com o mercado"]
}`;
}
