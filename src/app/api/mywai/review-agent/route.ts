import { NextRequest } from 'next/server';
import { reviewAgentAI } from '@/lib/functions/supabase-actions/review-agent-ai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }
    const result = await reviewAgentAI(userId);
    return Response.json(result);
  } catch (err) {
    console.error('review-agent API error:', err);
    return Response.json(
      { decision: 'needs_review', confidence: 0, score: 50, reasons: ['Erro interno'] },
      { status: 500 }
    );
  }
}
