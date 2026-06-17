import { createServiceClient } from '@/lib/supabase/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export interface AIAgentReviewResult {
  decision: 'approved' | 'rejected' | 'needs_review';
  confidence: number;
  score: number;
  reasons: string[];
}

function fallbackReview(profile: any): AIAgentReviewResult {
  const nome = `${profile.primeiro_nome || ''} ${profile.ultimo_nome || ''}`.trim();
  const hasNome = nome.length > 0;
  const hasEmail = !!profile.email;
  const hasPhoto = !!profile.avatar_url;

  if (!hasNome || !hasEmail) {
    return {
      decision: 'rejected',
      confidence: 0.9,
      score: 20,
      reasons: [
        !hasNome ? 'Nome não preenchido' : null,
        !hasEmail ? 'Email não preenchido' : null,
        !hasPhoto ? 'Foto de perfil não carregada' : null,
      ].filter(Boolean) as string[],
    };
  }

  if (!hasPhoto) {
    return {
      decision: 'rejected',
      confidence: 0.85,
      score: 40,
      reasons: ['Foto de perfil é obrigatória para ser agente'],
    };
  }

  return {
    decision: 'approved',
    confidence: 0.8,
    score: 75,
    reasons: ['Perfil com campos obrigatórios preenchidos'],
  };
}

export async function reviewAgentAI(userId: string): Promise<AIAgentReviewResult> {
  try {
    const supabase = createServiceClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('reviewAgentAI: profile not found', profileError);
      return { decision: 'needs_review', confidence: 0, score: 0, reasons: ['Perfil não encontrado'] };
    }

    if (!WORKER_URL) {
      console.log('reviewAgentAI: no WORKER_URL, using fallback');
      const result = fallbackReview(profile);
      await applyAgentDecision(supabase, userId, result);
      return result;
    }

    const prompt = buildAgentReviewPrompt(profile);

    let res: Response;
    try {
      res = await fetch(`${WORKER_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
      });
    } catch (fetchErr) {
      console.warn('reviewAgentAI: worker fetch failed, using fallback', fetchErr);
      const result = fallbackReview(profile);
      await applyAgentDecision(supabase, userId, result);
      return result;
    }

    if (!res.ok) {
      console.warn(`reviewAgentAI: worker returned ${res.status}, using fallback`);
      const result = fallbackReview(profile);
      await applyAgentDecision(supabase, userId, result);
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
      console.warn('reviewAgentAI: invalid worker response, using fallback', parsed);
      const result = fallbackReview(profile);
      await applyAgentDecision(supabase, userId, result);
      return result;
    }

    const result: AIAgentReviewResult = {
      decision: ['approved', 'rejected'].includes(parsed.decision) ? parsed.decision : 'needs_review',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      score: typeof parsed.score === 'number' ? parsed.score : 50,
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
    };

    // Se o worker não conseguiu decidir (needs_review ou baixa confiança), usa fallback local
    if (result.decision === 'needs_review' || result.confidence < 0.7) {
      console.log('reviewAgentAI: worker needs_review, using fallback', result);
      const fb = fallbackReview(profile);
      await applyAgentDecision(supabase, userId, fb);
      return fb;
    }

    await applyAgentDecision(supabase, userId, result);
    return result;
  } catch (err) {
    console.error('reviewAgentAI: UNEXPECTED ERROR — trying fallback', err instanceof Error ? err.message : err);
    // Fallback: tenta revisão local mesmo após erro inesperado
    try {
      const supabase = createServiceClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profile) {
        const result = fallbackReview(profile);
        await applyAgentDecision(supabase, userId, result);
        return result;
      }
    } catch (fallbackErr) {
      console.error('reviewAgentAI: fallback also failed', fallbackErr);
    }
    return { decision: 'needs_review', confidence: 0, score: 50, reasons: ['Erro interno ao analisar perfil'] };
  }
}

async function applyAgentDecision(supabase: any, userId: string, result: AIAgentReviewResult) {
  const { insertNotification } = await import('@/lib/functions/supabase-actions/notifications-actions');

  // Obter nome do candidato para as notificações
  let nome = 'Novo Candidato';
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('primeiro_nome, ultimo_nome')
      .eq('id', userId)
      .single();
    if (profile) {
      nome = `${profile.primeiro_nome || ''} ${profile.ultimo_nome || ''}`.trim() || 'Novo Candidato';
    }
  } catch (profileErr) {
    console.error('Erro ao buscar dados do perfil do agente:', profileErr);
  }

  if (result.decision === 'approved' && result.confidence >= 0.7) {
    await supabase
      .from('agente_requests')
      .update({ status: 'approved' })
      .eq('user_id', userId)
      .eq('status', 'pending');

    await supabase
      .from('profiles')
      .update({ role: 'agent' })
      .eq('id', userId);

    // Notificar o candidato (usuário) sobre aprovação
    try {
      await insertNotification({
        userId,
        type: 'agent_approved',
        title: `Pedido de agente aprovado! 🎉`,
        message: `Parabéns! O teu pedido para te tornares agente foi analisado e aprovado automaticamente pela nossa IA. Já podes gerir os teus imóveis.`,
        data: { score: result.score },
      });
    } catch (err) {
      console.error('Erro ao notificar agente sobre aprovação:', err);
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
            type: 'ai_agent_approved',
            title: `IA: Agente Aprovado`,
            message: `O candidato a agente "${nome}" foi aprovado automaticamente pela IA (Score: ${result.score}%). Motivos: ${result.reasons.join(', ')}`,
            data: { candidate_id: userId, score: result.score, reasons: result.reasons },
          });
        }
      }
    } catch (err) {
      console.error('Erro ao notificar administradores sobre aprovação de agente:', err);
    }

  } else if (result.decision === 'rejected' && result.confidence >= 0.7) {
    await supabase
      .from('agente_requests')
      .update({ status: 'rejected' })
      .eq('user_id', userId)
      .eq('status', 'pending');

    // Notificar o candidato (usuário) sobre rejeição com motivos e dicas de melhoria
    try {
      const tips = '\n\nDicas para melhorar:\n- Certifica-te de carregar uma foto de perfil profissional e nítida.\n- Preenche o teu nome completo, e-mail e telefone válidos.\n- Adiciona uma breve descrição sobre o teu percurso profissional no campo "Sobre Mim".';
      await insertNotification({
        userId,
        type: 'agent_rejected',
        title: 'Pedido de agente rejeitado',
        message: `O teu pedido para ser agente foi rejeitado. Motivos: ${result.reasons.join(', ')}.${tips}`,
        data: { score: result.score, reasons: result.reasons },
      });
    } catch (err) {
      console.error('Erro ao notificar agente sobre rejeição:', err);
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
            type: 'ai_agent_rejected',
            title: `IA: Agente Rejeitado`,
            message: `O candidato a agente "${nome}" foi rejeitado automaticamente pela IA (Score: ${result.score}%). Motivos: ${result.reasons.join(', ')}`,
            data: { candidate_id: userId, score: result.score, reasons: result.reasons },
          });
        }
      }
    } catch (err) {
      console.error('Erro ao notificar administradores sobre rejeição de agente:', err);
    }
  }
}

function buildAgentReviewPrompt(profile: any): string {
  return `Analisa este pedido de agente imobiliário na plataforma Kercasa e retorna uma decisão estruturada em JSON.

Candidato a Agente:
Nome: ${profile.primeiro_nome || ''} ${profile.ultimo_nome || ''}
Email: ${profile.email || ''}
Telefone: ${profile.telefone || ''}
Empresa: ${profile.empresa || ''}
Licença: ${profile.licenca || ''}
Website: ${profile.website || ''}
Sobre Mim: ${profile.sobre_mim || ''}
Tem foto de perfil: ${profile.avatar_url ? 'Sim' : 'Não'}
Tem redes sociais: ${[profile.facebook, profile.linkedin, profile.instagram, profile.youtube].filter(Boolean).length > 0 ? 'Sim' : 'Não'}

Critérios de avaliação:
1. COMPLETUDE: Nome, email, telefone e foto de perfil estão preenchidos corretamente? (obrigatório)
2. PROFISSIONALISMO: Tem bio, empresa ou licença imobiliária? (opcional — valoriza o perfil, mas não bloqueia)
3. PRESENÇA ONLINE: Tem website ou redes sociais profissionais? (opcional — valoriza o perfil, mas não bloqueia)
4. LEGITIMIDADE: O perfil parece genuíno e não é spam ou bot?

Regras de decisão:
- Aprovar automaticamente se: campos obrigatórios preenchidos + perfil parece genuíno
- Rejeitar automaticamente se: faltar nome, email, telefone ou foto de perfil, OU se o perfil for claramente spam/bot
- needs_review se: campos obrigatórios preenchidos mas faltam detalhes que gerem dúvida

Responde APENAS com um objeto JSON válido, sem markdown:
{
  "decision": "approved" | "rejected" | "needs_review",
  "confidence": 0.95,
  "score": 85,
  "reasons": ["Perfil completo com dados profissionais", "Tem licença imobiliária"]
}`;
}
