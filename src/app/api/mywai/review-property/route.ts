import { NextRequest } from 'next/server';
import { reviewPropertyAI } from '@/lib/functions/supabase-actions/review-property-ai';

export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();
    if (!propertyId) {
      return Response.json({ error: 'propertyId is required' }, { status: 400 });
    }
    const result = await reviewPropertyAI(propertyId);
    return Response.json(result);
  } catch (err) {
    console.error('review-property API error:', err);
    return Response.json(
      { decision: 'needs_review', confidence: 0, score: 50, reasons: ['Erro interno'] },
      { status: 500 }
    );
  }
}
