'use server';

const WORKER_URL = process.env.CF_WORKER_URL;

export interface AgentProfileAnalysis {
  score: number;
  completeness: { field: string; filled: boolean; weight: number }[];
  strengths: string[];
  improvements: string[];
  tips: string[];
}

export async function analyzeAgentProfile(userId: string): Promise<AgentProfileAnalysis | null> {
  if (!WORKER_URL) return null;

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  const fields = [
    { field: 'Foto de perfil', filled: !!profile.avatar_url, weight: 15 },
    { field: 'Nome completo', filled: !!(profile.primeiro_nome && profile.ultimo_nome), weight: 10 },
    { field: 'Email', filled: !!profile.email, weight: 10 },
    { field: 'Telefone', filled: !!profile.telefone, weight: 10 },
    { field: 'Biografia (sobre_mim)', filled: !!(profile.sobre_mim && profile.sobre_mim.length > 50), weight: 15 },
    { field: 'Empresa', filled: !!profile.empresa, weight: 10 },
    { field: 'Licença imobiliária', filled: !!profile.licenca, weight: 10 },
    { field: 'Website', filled: !!profile.website, weight: 5 },
    { field: 'Redes sociais', filled: !!(profile.facebook || profile.linkedin || profile.instagram || profile.youtube), weight: 5 },
    { field: 'LinkedIn', filled: !!profile.linkedin, weight: 5 },
    { field: 'Instagram', filled: !!profile.instagram, weight: 5 },
  ];

  const rawScore = fields.reduce((acc, f) => acc + (f.filled ? f.weight : 0), 0);
  const score = Math.min(100, rawScore);

  const gaps = fields.filter(f => !f.filled).map(f => f.field);
  const filledLabels = fields.filter(f => f.filled).map(f => f.field);

  const strengths = filledLabels.length > 0
    ? [filledLabels.slice(0, 3).join(', ') + (filledLabels.length > 3 ? ` e mais ${filledLabels.length - 3}` : '')]
    : [];
  const improvements = gaps.slice(0, 5);

  const tips: string[] = [];
  if (!profile.avatar_url) tips.push('Adicione uma foto profissional de rosto com fundo neutro');
  if (!profile.sobre_mim || profile.sobre_mim.length < 50) tips.push('Escreva uma biografia com pelo menos 50 caracteres destacando sua experiência e especialidade');
  if (!profile.empresa) tips.push('Indique a sua empresa ou imobiliária para gerar mais credibilidade');
  if (!profile.licenca) tips.push('Adicione o número da sua licença imobiliária — agentes licenciados geram mais confiança');
  if (!profile.linkedin) tips.push('Vincule o seu LinkedIn profissional — aumenta a credibilidade em 40%');
  if (!profile.instagram) tips.push('Conecte o Instagram para mostrar imóveis com fotos e stories');
  if (!profile.telefone) tips.push('Adicione um telefone visível para os clientes entrarem em contacto');
  if (!profile.website) tips.push('Tenha um website profissional com as suas propriedades em destaque');
  if (profile.sobre_mim && profile.sobre_mim.length < 100) tips.push('A sua biografia é curta. Inclua anos de experiência, áreas de atuação e diferenciais');

  try {
    const prompt = `Analisa este perfil de agente imobiliário na Kercasa e dá 3 dicas personalizadas para ele melhorar o perfil e vender mais.

Perfil:
Nome: ${profile.primeiro_nome || ''} ${profile.ultimo_nome || ''}
Email: ${profile.email || ''}
Telefone: ${profile.telefone || ''}
Empresa: ${profile.empresa || ''}
Licença: ${profile.licenca || ''}
Website: ${profile.website || ''}
Sobre mim: ${profile.sobre_mim || ''}
Redes sociais: ${['Facebook', 'Instagram', 'LinkedIn', 'YouTube'].filter(s => profile[s.toLowerCase()]).join(', ') || 'Nenhuma'}
Foto: ${profile.avatar_url ? 'Sim' : 'Não'}
Score do perfil: ${score}/100

Completo: ${filledLabels.join(', ') || 'Nada'}
Em falta: ${gaps.join(', ') || 'Tudo completo'}

Responde APENAS com um array JSON de 3 objetos, cada um com "tip" (string com a dica) e "impact" ("alto"|"medio"|"baixo"). Nada mais.
Exemplo: [{"tip": "Adicione fotos profissionais aos seus imóveis", "impact": "alto"}]`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });

    if (res.ok) {
      const data = await res.json();
      const answer = data.answer;
      let parsed: any[] | undefined;
      if (typeof answer === 'string') { try { parsed = JSON.parse(answer); } catch {} }
      else if (Array.isArray(answer)) { parsed = answer; }
      if (parsed && Array.isArray(parsed)) {
        parsed.forEach((t: any) => {
          if (t.tip && !tips.includes(t.tip)) tips.push(t.tip);
        });
      }
    }
  } catch {}

  return { score, completeness: fields, strengths, improvements, tips };
}
