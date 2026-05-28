import { NextRequest } from 'next/server';
import { predictPrice } from '@/lib/predict-engine';

export async function POST(req: NextRequest) {
  try {
    const { property } = await req.json();
    if (!property) {
      return Response.json({ erro: 'Dados do imóvel são obrigatórios' }, { status: 400 });
    }

    const predictedPrice = predictPrice(property);
    const currentPrice = Number(property.price) || 0;
    const diff = currentPrice > 0 && predictedPrice > 0 ? currentPrice - predictedPrice : 0;
    const diffPercent = currentPrice > 0 && predictedPrice > 0 ? Math.round((diff / predictedPrice) * 100) : 0;

    let verdict: string;
    if (diffPercent > 10) {
      verdict = 'acima do preço estimado de mercado';
    } else if (diffPercent < -10) {
      verdict = 'abaixo do preço estimado de mercado';
    } else {
      verdict = 'dentro do intervalo esperado para o mercado';
    }

    return Response.json({
      predictedPrice: Math.round(predictedPrice),
      currentPrice,
      diff: Math.round(diff),
      diffPercent,
      verdict,
      message: currentPrice > 0 && predictedPrice > 0
        ? `O preço actual (Kz ${currentPrice.toLocaleString()}) está ${diffPercent > 0 ? `${diffPercent}% acima` : `${Math.abs(diffPercent)}% abaixo`} do preço estimado de Kz ${Math.round(predictedPrice).toLocaleString()}.`
        : 'Não foi possível calcular a estimativa de mercado.',
    });
  } catch {
    return Response.json({ erro: 'Erro ao analisar preço' }, { status: 500 });
  }
}
