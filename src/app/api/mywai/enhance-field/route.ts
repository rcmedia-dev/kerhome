import { NextRequest } from 'next/server';

const WORKER_URL = process.env.CF_WORKER_URL;

function localFallback(fieldName: string, currentValue: string, formData: Record<string, any>) {
  const { tipo, cidade, bairro, bedrooms, status } = formData || {};

  if (fieldName === 'title') {
    if (!currentValue || currentValue.length < 15) {
      const base = tipo || 'Imóvel';
      const location = cidade && bairro ? `${bairro}, ${cidade}` : cidade || bairro || '';
      return `${base} incrível${location ? ` em ${location}` : ''}${status === 'arrendar' ? ' para arrendar' : ''}`;
    }
    return currentValue;
  }

  if (fieldName === 'description') {
    const { bathrooms, garagens, size, caracteristicas } = formData || {};
    const parts = [
      `${tipo || 'Imóvel'} localizado em ${cidade || ''}${bairro ? `, ${bairro}` : ''},`,
    ];
    const specs: string[] = [];
    if (bedrooms) specs.push(`${bedrooms} quartos`);
    if (bathrooms) specs.push(`${bathrooms} banheiros`);
    if (garagens) specs.push(`${garagens} vagas de garagem`);
    if (size) specs.push(`${size} m²`);
    if (specs.length) parts.push(`com ${specs.join(', ')}`);
    parts.push(`${status === 'comprar' ? 'à venda' : 'para arrendar'}.`);
    if (caracteristicas?.length) parts.push(`Destaques: ${Array.isArray(caracteristicas) ? caracteristicas.join(', ') : caracteristicas}.`);
    return parts.join(' ');
  }

  return currentValue;
}

const enhancePrompts: Record<string, string> = {
  title: `Melhora o seguinte título de anúncio imobiliário em português (pt-AO). Deve ser atrativo, profissional e incluir informações relevantes (tipo, localização, estado).

Responde APENAS com um objeto JSON:
{ "enhancedValue": "título melhorado em pt-AO" }`,

  description: `Melhora a seguinte descrição de anúncio imobiliário em português (pt-AO). Deve ser profissional, persuasiva com 2-3 parágrafos destacando os pontos fortes.

Dados do imóvel:
{tipo, cidade, bairro, quartos, banheiros, garagens, área, preço, estado, características}

Responde APENAS com um objeto JSON:
{ "enhancedValue": "descrição melhorada em pt-AO" }`,
};

export async function POST(req: NextRequest) {
  let fieldName: string, currentValue: string, formData: Record<string, any>;

  try {
    const body = await req.json();
    fieldName = body.fieldName;
    currentValue = body.currentValue;
    formData = body.formData;
  } catch {
    return Response.json({ erro: 'Body inválido' }, { status: 400 });
  }

  if (!fieldName) {
    return Response.json({ erro: 'fieldName é obrigatório' }, { status: 400 });
  }

  if (!WORKER_URL) {
    return Response.json({ enhancedValue: localFallback(fieldName, currentValue, formData) });
  }

  try {
    const prompt = `${enhancePrompts[fieldName] || 'Melhora o seguinte texto em português (pt-AO). Responde APENAS com JSON: { "enhancedValue": "texto melhorado" }'}

Texto original: "${currentValue || ''}"

${fieldName === 'description' ? `
Tipo: ${formData?.tipo || ''}
Cidade: ${formData?.cidade || ''}
Bairro: ${formData?.bairro || ''}
Quartos: ${formData?.bedrooms || ''}
Banheiros: ${formData?.bathrooms || ''}
Garagens: ${formData?.garagens || ''}
Área: ${formData?.size || ''} m²
Preço: ${formData?.price || ''}
Estado: ${formData?.status || ''}
Características: ${Array.isArray(formData?.caracteristicas) ? formData.caracteristicas.join(', ') : formData?.caracteristicas || ''}
` : ''}`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });

    if (!res.ok) throw new Error('Worker error');

    const data = await res.json();
    const answer = data.answer;
    let enhancedValue = currentValue;

    if (typeof answer === 'string') {
      try {
        const parsed = JSON.parse(answer);
        enhancedValue = parsed.enhancedValue || answer;
      } catch {
        enhancedValue = answer;
      }
    } else if (answer && typeof answer === 'object') {
      enhancedValue = answer.enhancedValue || currentValue;
    }

    return Response.json({ enhancedValue });
  } catch {
    return Response.json({ enhancedValue: localFallback(fieldName, currentValue, formData) });
  }
}
