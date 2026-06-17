import { createServiceClient } from '@/lib/supabase/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export interface AIReviewResult {
  decision: 'approved' | 'rejected' | 'needs_review';
  confidence: number;
  score: number;
  reasons: string[];
}

function fallbackReview(property: any): AIReviewResult {
  const hasTitle = !!property.title;
  const hasDescription = !!property.description;
  const hasPrice = !!property.price && property.price > 0;
  const hasAddress = !!(property.cidade || property.bairro || property.provincia);
  const hasCoverImage = !!property.image;

  const missing: string[] = [];
  if (!hasTitle) missing.push('Título não preenchido');
  if (!hasDescription) missing.push('Descrição não preenchida');
  if (!hasPrice) missing.push('Preço não preenchido ou inválido');
  if (!hasAddress) missing.push('Endereço (cidade/bairro) não preenchido');
  if (!hasCoverImage) missing.push('Imagem de capa não carregada');

  if (missing.length > 0) {
    return {
      decision: 'rejected',
      confidence: 0.9,
      score: Math.max(10, 100 - missing.length * 20),
      reasons: missing,
    };
  }

  return {
    decision: 'approved',
    confidence: 0.8,
    score: 70,
    reasons: ['Anúncio com campos obrigatórios preenchidos'],
  };
}

export async function reviewPropertyAI(propertyId: string): Promise<AIReviewResult> {
  const supabase = createServiceClient();

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (!property) {
    return { decision: 'needs_review', confidence: 0, score: 0, reasons: ['Imóvel não encontrado'] };
  }

  if (!WORKER_URL) {
    const result = fallbackReview(property);
    await applyPropertyDecision(supabase, propertyId, property, result);
    return result;
  }

  const prompt = buildReviewPrompt(property);

  let res: Response;
  try {
    res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });
  } catch {
    const result = fallbackReview(property);
    await applyPropertyDecision(supabase, propertyId, property, result);
    return result;
  }

  if (!res.ok) {
    const result = fallbackReview(property);
    await applyPropertyDecision(supabase, propertyId, property, result);
    return result;
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
    console.warn('reviewPropertyAI: invalid worker response, using fallback', parsed);
    const fb = fallbackReview(property);
    await applyPropertyDecision(supabase, propertyId, property, fb);
    return fb;
  }

  const result: AIReviewResult = {
    decision: ['approved', 'rejected'].includes(parsed.decision) ? parsed.decision : 'needs_review',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
    score: typeof parsed.score === 'number' ? parsed.score : 50,
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
  };

  // Se o worker não conseguiu decidir (needs_review ou baixa confiança), usa fallback local
  if (result.decision === 'needs_review' || result.confidence < 0.7) {
    console.log('reviewPropertyAI: worker needs_review, using fallback', result);
    const fb = fallbackReview(property);
    await applyPropertyDecision(supabase, propertyId, property, fb);
    return fb;
  }

  await applyPropertyDecision(supabase, propertyId, property, result);
  return result;
}

async function applyPropertyDecision(supabase: any, propertyId: string, property: any, result: AIReviewResult) {
  const { insertNotification } = await import('@/lib/functions/supabase-actions/notifications-actions');

  if (result.decision === 'approved' && result.confidence >= 0.7) {
    await supabase
      .from('properties')
      .update({ aprovement_status: 'approved' })
      .eq('id', propertyId);

    // Notificar proprietário do imóvel (usuário)
    if (property.owner_id) {
      try {
        await insertNotification({
          userId: property.owner_id,
          type: 'property_approved',
          title: `Imóvel aprovado! 🎉`,
          message: `O teu imóvel "${property.title || ''}" foi analisado e aprovado automaticamente pela nossa IA e já está publicado!`,
          data: { property_id: propertyId, score: result.score },
        });
      } catch (err) {
        console.error('Erro ao notificar proprietário sobre aprovação:', err);
      }
    }

    // Notificar todos os administradores da plataforma
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
      
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await insertNotification({
            userId: admin.id,
            type: 'ai_property_approved',
            title: `IA: Imóvel Aprovado`,
            message: `O imóvel "${property.title || ''}" foi aprovado automaticamente pela IA (Score: ${result.score}%). Motivos: ${result.reasons.join(', ')}`,
            data: { property_id: propertyId, score: result.score, reasons: result.reasons },
          });
        }
      }
    } catch (err) {
      console.error('Erro ao notificar administradores sobre aprovação:', err);
    }

  } else if (result.decision === 'rejected' && result.confidence >= 0.7) {
    await supabase
      .from('properties')
      .update({
        aprovement_status: 'rejected',
        rejection_reason: result.reasons.join('; '),
      })
      .eq('id', propertyId);

    // Notificar proprietário do imóvel (usuário) com motivos e dicas de melhoria
    if (property.owner_id) {
      try {
        const tips = '\n\nDicas para melhorar:\n- Certifica-te de preencher todos os campos obrigatórios (título, descrição, preço, localização).\n- Envia pelo menos uma foto de capa e adiciona mais imagens de boa qualidade à galeria.\n- Fornece uma descrição realista, detalhada e coerente com as características do imóvel.';
        await insertNotification({
          userId: property.owner_id,
          type: 'property_rejected',
          title: `Imóvel rejeitado: ${property.title || ''}`,
          message: `O teu imóvel foi rejeitado. Motivos: ${result.reasons.join(', ')}.${tips}`,
          data: { property_id: propertyId, score: result.score, reasons: result.reasons },
        });
      } catch (err) {
        console.error('Erro ao notificar proprietário sobre rejeição:', err);
      }
    }

    // Notificar todos os administradores
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
      
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await insertNotification({
            userId: admin.id,
            type: 'ai_property_rejected',
            title: `IA: Imóvel Rejeitado`,
            message: `O imóvel "${property.title || ''}" foi rejeitado automaticamente pela IA (Score: ${result.score}%). Motivos: ${result.reasons.join(', ')}`,
            data: { property_id: propertyId, score: result.score, reasons: result.reasons },
          });
        }
      }
    } catch (err) {
      console.error('Erro ao notificar administradores sobre rejeição:', err);
    }
  }
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
