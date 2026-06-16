'use server';

const WORKER_URL = process.env.CF_WORKER_URL;

export interface PropertyHealthAnalysis {
  propertyId: string;
  title: string;
  score: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
}

export async function analyzePropertyHealth(propertyId: string): Promise<PropertyHealthAnalysis | null> {
  if (!WORKER_URL) return null;

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (!property) return null;

  const fields = [
    { label: 'Título', filled: !!(property.title && property.title.length >= 10), weight: 10 },
    { label: 'Descrição detalhada', filled: !!(property.description && property.description.length >= 100), weight: 15 },
    { label: 'Preço', filled: !!property.price && property.price > 0, weight: 10 },
    { label: 'Endereço completo', filled: !!(property.endereco && property.bairro && property.cidade), weight: 10 },
    { label: 'Foto de capa', filled: !!property.image, weight: 15 },
    { label: 'Galeria de fotos', filled: Array.isArray(property.gallery) && property.gallery.length >= 3, weight: 10 },
    { label: 'Tipo de imóvel', filled: !!property.tipo, weight: 5 },
    { label: 'Quartos', filled: !!property.bedrooms, weight: 5 },
    { label: 'Banheiros', filled: !!property.bathrooms, weight: 5 },
    { label: 'Área/terreno', filled: !!(property.size || property.area_terreno), weight: 5 },
    { label: 'Características', filled: Array.isArray(property.caracteristicas) && property.caracteristicas.length >= 3, weight: 5 },
    { label: 'Vídeo/Tour 360°', filled: !!(property.video_url || property.imagem_360_da_propriedade), weight: 5 },
  ];

  const rawScore = fields.reduce((acc, f) => acc + (f.filled ? f.weight : 0), 0);
  const score = Math.min(100, rawScore);

  const gaps = fields.filter(f => !f.filled).map(f => f.label);
  const filledLabels = fields.filter(f => f.filled).map(f => f.label);

  const strengths = filledLabels.length > 0
    ? [filledLabels.slice(0, 3).join(', ') + (filledLabels.length > 3 ? ` e mais ${filledLabels.length - 3}` : '')]
    : [];
  const improvements = gaps.slice(0, 5);

  const tips: string[] = [];
  if (!property.image) tips.push('Adicione uma foto de capa de alta qualidade — imóveis com foto de capa têm 3x mais visualizações');
  if (!property.description || property.description.length < 100) tips.push('Escreva uma descrição com pelo menos 100 caracteres, destacando diferenciais, estado de conservação e infraestrutura');
  if (!Array.isArray(property.gallery) || property.gallery.length < 3) tips.push('Adicione pelo menos 3 fotos ao álbum — imóveis com 5+ fotos geram 2x mais contactos');
  if (property.title && property.title.length < 20) tips.push('O título é curto. Inclua tipo, localização e diferencial principal (ex: "T3 Mobilado no Bairro Alvalade")');
  if (!property.bedrooms) tips.push('Indique o número de quartos — é o filtro mais usado pelos compradores');
  if (!property.size && !property.area_terreno) tips.push('Informe a área do imóvel — ajuda os compradores a terem noção do espaço');
  if (!Array.isArray(property.caracteristicas) || property.caracteristicas.length < 3) tips.push('Adicione características como piscina, segurança, ar condicionado, estacionamento');
  if (!property.video_url && !property.imagem_360_da_propriedade) tips.push('Adicione um vídeo tour — imóveis com vídeo vendem 40% mais rápido');
  if (!property.bairro) tips.push('Indique o bairro para aparecer nas pesquisas por localização');
  if (property.description && property.description.length < 200) tips.push('Expanda a descrição incluindo informações sobre o condomínio, vizinhança e estado de conservação');

  try {
    const prompt = `Analisa este anúncio imobiliário e dá 3 dicas personalizadas para o agente melhorar o anúncio e vender mais rápido.

Imóvel:
Título: ${property.title || ''}
Descrição: ${(property.description || '').substring(0, 300)}
Tipo: ${property.tipo || ''} | Finalidade: ${property.status || ''}
Preço: ${property.price || 0} ${property.unidade_preco || 'Kz'}
Área: ${property.size || property.area_terreno || 'n/d'} m²
Quartos: ${property.bedrooms || 'n/d'} | Banheiros: ${property.bathrooms || 'n/d'} | Garagens: ${property.garagens || 'n/d'}
Localização: ${property.cidade || ''}/${property.bairro || ''}/${property.provincia || ''}
Características: ${Array.isArray(property.caracteristicas) ? property.caracteristicas.join(', ') : 'n/d'}
Fotos: ${property.image ? '1 capa' : '0'} + ${Array.isArray(property.gallery) ? property.gallery.length : 0} galeria
Vídeo: ${property.video_url ? 'Sim' : 'Não'} | Tour 360°: ${property.imagem_360_da_propriedade ? 'Sim' : 'Não'}
Score do anúncio: ${score}/100

Responde APENAS com um array JSON de 3 objetos, cada um com "tip" (dica prática), "priority" ("urgente"|"importante"|"sugestao"). Nada mais.
Exemplo: [{"tip": "Adicione mais 4 fotos do interior do imóvel", "priority": "urgente"}]`;

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
          if (t.tip && !tips.includes(t.tip)) {
            if (t.priority === 'urgente') tips.unshift(t.tip);
            else tips.push(t.tip);
          }
        });
      }
    }
  } catch {}

  return { propertyId, title: property.title, score, strengths, improvements, tips };
}
