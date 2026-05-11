'use server';

import { createClient } from '@/lib/supabase/server';
import { type EventStatsResult, type EventSummary, type PropertyEventCount } from './track-event-types';

// Grupo de eventos que representam um contacto directo
const CONTACT_EVENTS = new Set([
  'chat', 'whatsapp', 'schedule_visit',
  'chat_profile', 'whatsapp_profile', 'schedule_visit_profile',
  'lets_talk', 'click_phone', 'click_email',
]);

// Grupo de eventos de partilha
const SHARE_EVENTS = new Set([
  'share_whatsapp', 'share_facebook', 'share_copy_link',
]);

// ============================================================
// Server Action — busca estatísticas do anunciante
// ============================================================
export async function getEventStats(
  ownerId: string,
  periodDays: number = 30
): Promise<EventStatsResult> {
  const supabase = await createClient();

  const since = new Date(
    Date.now() - periodDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from('user_events')
    .select('event_type')
    .eq('owner_id', ownerId)
    .gte('created_at', since);

  if (error || !data) {
    return { summary: {}, total: 0, total_contacts: 0, total_shares: 0, period_days: periodDays };
  }

  // Agrupa por event_type no servidor
  const summary: EventSummary = {};
  let total_contacts = 0;
  let total_shares = 0;

  for (const row of data) {
    summary[row.event_type] = (summary[row.event_type] ?? 0) + 1;
    if (CONTACT_EVENTS.has(row.event_type)) total_contacts++;
    if (SHARE_EVENTS.has(row.event_type))   total_shares++;
  }

  return {
    summary,
    total:          data.length,
    total_contacts,
    total_shares,
    period_days:    periodDays,
  };
}

// ============================================================
// Server Action — busca eventos por imóvel (top N)
// ============================================================
export async function getTopPropertiesByEvents(
  ownerId: string,
  periodDays: number = 30,
  limit: number = 5
): Promise<PropertyEventCount[]> {
  const supabase = await createClient();

  const since = new Date(
    Date.now() - periodDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from('user_events')
    .select('entity_id')
    .eq('owner_id', ownerId)
    .eq('entity_type', 'imovel')
    .gte('created_at', since);

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.entity_id] = (counts[row.entity_id] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([entity_id, count]) => ({ entity_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
