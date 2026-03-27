import { NextRequest, NextResponse } from 'next/server';
import { predictPrice } from '@/lib/predict-engine';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Ensure area_known is set (1 if area is provided)
        const inputData = {
            ...body,
            tier: body.classificacao, // Pass tier for fallback mapping
            area_known: body.area_util_m2 ? 1 : 0,
            // Convert booleans to 0/1 as expected by the model
            tem_piscina: body.tem_piscina ? 1 : 0,
            tem_garagem: body.tem_garagem ? 1 : 0,
            tem_seguranca: body.tem_seguranca ? 1 : 0,
            tem_climatizacao: body.tem_climatizacao ? 1 : 0,
        };

        const precoFinal = predictPrice(inputData);

        if (isNaN(precoFinal)) {
            return NextResponse.json({ error: 'Falha ao calcular o preço.' }, { status: 400 });
        }

        // Return the same structure as the Python bridge did
        return NextResponse.json({
            preco_akz: precoFinal,
            moeda: 'AKZ',
            confianca: 0.85 // Placeholder, maybe derived from tree variance later
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Erro interno ao processar a predição.' }, { status: 500 });
    }
}

