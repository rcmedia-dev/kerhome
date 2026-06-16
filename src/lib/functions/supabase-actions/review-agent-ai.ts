'use server';

import { createClient } from '@/lib/supabase/server';

const WORKER_URL = process.env.CF_WORKER_URL;

export interface AIAgentReviewResult {
  decision: 'approved' | 'rejected' | 'needs_review';
  confidence: number;
  score: number;
  reasons: string[];
}

export async function reviewAgentAI(userId: string): Promise<AIAgentReviewResult> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { decision: 'needs_review', confidence: 0, score: 0, reasons: ['Perfil não encontrado'] };
  }

  if (!WORKER_URL) {
    return { decision: 'needs_review', confidence: 0, score: 50, reasons: ['Revisor de IA indisponível'] };
  }

  const prompt = buildAgentReviewPrompt(profile);

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

  const result: AIAgentReviewResult = {
    decision: ['approved', 'rejected', 'needs_review'].includes(parsed.decision) ? parsed.decision : 'needs_review',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
    score: typeof parsed.score === 'number' ? parsed.score : 50,
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
  };

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
  } else if (result.decision === 'rejected' && result.confidence >= 0.7) {
    await supabase
      .from('agente_requests')
      .update({ status: 'rejected' })
      .eq('user_id', userId)
      .eq('status', 'pending');

    // Notificar agente sobre rejeição com os motivos
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('primeiro_nome, ultimo_nome, email, telefone')
      .eq('id', userId)
      .single();

    if (userProfile) {
      const webhookUrl = 'https://n8n.srv1157846.hstgr.cloud/webhook/notificate';
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'agente_rejeitado',
          dados: {
            nome: `${userProfile.primeiro_nome || ''} ${userProfile.ultimo_nome || ''}`.trim(),
            email: userProfile.email,
            telefone: userProfile.telefone || '',
            user_id: userId,
            motivos: result.reasons,
            score: result.score,
          },
        }),
      }).catch((err) => console.error('Erro ao notificar rejeição de agente:', err));
    }
  }

  return result;
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
