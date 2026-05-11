'use server';

import { createClient } from '@/lib/supabase/server';
import { trackEventSchema, type TrackEventInput } from './track-event-types';

// ============================================================
// Server Action — fire-and-forget, nunca lança erro para o UI
// ============================================================
export async function trackEvent(input: TrackEventInput): Promise<void> {
  const parsed = trackEventSchema.safeParse(input);

  // Falha silenciosa: tracking nunca deve quebrar a experiência do utilizador
  if (!parsed.success) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[trackEvent] Input inválido:', parsed.error.flatten());
    }
    return;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('user_events').insert({
      event_type:  parsed.data.event_type,
      entity_type: parsed.data.entity_type,
      entity_id:   parsed.data.entity_id,
      owner_id:    parsed.data.owner_id ?? null,
      user_id:     user?.id ?? null,
      session_id:  parsed.data.session_id ?? null,
      metadata:    parsed.data.metadata ?? {},
    });
  } catch (err) {
    // Log em dev, silêncio em produção
    if (process.env.NODE_ENV === 'development') {
      console.error('[trackEvent] Erro ao registar evento:', err);
    }
  }
}
