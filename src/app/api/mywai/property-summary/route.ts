import { NextRequest } from 'next/server';
import { TPropertyResponseSchema } from '@/lib/types/property';

const WORKER_URL = process.env.CF_WORKER_URL;

export async function POST(req: NextRequest) {
  try {
    const { property } = await req.json() as { property: TPropertyResponseSchema };

    if (!property) {
      return Response.json({ erro: 'Imóvel não fornecido' }, { status: 400 });
    }

    if (!WORKER_URL) {
      return Response.json(buildFallback(property));
    }

    const prompt = `Analisa este imóvel e fornece uma análise estruturada.

Imóvel:
Título: ${property.title || ''}
Tipo: ${property.tipo || ''}
Cidade: ${property.cidade || ''}
Bairro: ${property.bairro || ''}
Quartos: ${property.bedrooms || '?'}
Banheiros: ${property.bathrooms || '?'}
Garagens: ${property.garagens || '?'}
Área: ${property.size || '?'} m²
Preço: Kz ${Number(property.price).toLocaleString()}
Estado: ${property.status || ''}
Descrição: ${property.description || ''}
Características: ${property.caracteristicas?.join(', ') || ''}

Responde APENAS com um objeto JSON válido, sem formatação markdown:
{
  "summary": "Parágrafo curto descrevendo o imóvel e seu diferencial.",
  "highlights": ["Destaque 1", "Destaque 2", "Destaque 3"],
  "idealFor": "Perfil de comprador ideal para este imóvel.",
  "priceContext": "Análise do preço em relação ao mercado."
}`;

    const res = await fetch(`${WORKER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, history: [], stream: false, topK: 1 }),
    });

    if (!res.ok) {
      return Response.json(buildFallback(property));
    }

    const data = await res.json();
    const answer = data.answer;
    let parsed: any;

    if (typeof answer === 'string') {
      try {
        parsed = JSON.parse(answer);
      } catch {
        return Response.json(buildFallback(property));
      }
    } else if (typeof answer === 'object' && answer !== null) {
      parsed = answer;
    } else {
      return Response.json(buildFallback(property));
    }

    return Response.json({
      summary: parsed.summary || '',
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      idealFor: parsed.idealFor || '',
      priceContext: parsed.priceContext || '',
    });
  } catch {
    return Response.json({ erro: 'Erro ao processar pedido' }, { status: 500 });
  }
}

function buildFallback(property: TPropertyResponseSchema) {
  const price = Number(property.price).toLocaleString();
  return {
    summary: `${property.tipo || 'Imóvel'} localizado em ${property.cidade || ''}${property.bairro ? `, ${property.bairro}` : ''}, com ${property.bedrooms || '?'} quartos e ${property.size || '?'} m². Disponível por Kz ${price}.`,
    highlights: [
      property.bedrooms ? `${property.bedrooms} quarto${Number(property.bedrooms) > 1 ? 's' : ''}` : null,
      property.size ? `${property.size} m²` : null,
      property.status ? `Estado: ${property.status}` : null,
      property.bairro ? `Localizado em ${property.bairro}` : null,
    ].filter(Boolean) as string[],
    idealFor: !property.tipo
      ? 'Consulte os detalhes para mais informações.'
      : property.tipo === 'Apartamento'
        ? 'Ideal para solteiros ou casais sem filhos que buscam praticidade.'
        : Number(property.bedrooms || 0) >= 3
          ? 'Ideal para famílias que precisam de espaço.'
          : 'Ideal para casais ou pequenas famílias.',
    priceContext: `Preço de Kz ${price}${property.cidade ? ` para imóvel em ${property.cidade}.` : '.'}`,
  };
}
