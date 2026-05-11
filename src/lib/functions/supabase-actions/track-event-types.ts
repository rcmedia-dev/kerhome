import { z } from 'zod';

// ============================================================
// Tipos e Constantes — Ficheiro sem 'use server' para permitir
// exportação de objetos e tipos para o lado cliente
// ============================================================

export const EVENT_TYPES = [
  // Imóvel
  'share_whatsapp',
  'share_facebook',
  'share_copy_link',
  'chat',
  'schedule_visit',
  'whatsapp',
  // Imobiliária (via perfil)
  'view_profile',
  'chat_profile',
  'schedule_visit_profile',
  'whatsapp_profile',
  // Corretor
  'lets_talk',
  'click_phone',
  'click_email',
  'view_story',
  // Visualizações (Page Views)
  'view_property',
  'view_agency',
  'view_agent',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const ENTITY_TYPES = ['imovel', 'imobiliaria', 'corretor'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const trackEventSchema = z.object({
  event_type:  z.enum(EVENT_TYPES),
  entity_type: z.enum(ENTITY_TYPES),
  entity_id:   z.string().min(1),
  owner_id:    z.string().optional(),
  session_id:  z.string().optional(),
  metadata:    z.record(z.string(), z.unknown()).optional(),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;

// ============================================================
// Tipos para Estatísticas
// ============================================================
export type EventSummary = Record<string, number>;

export type EventStatsResult = {
  summary:      EventSummary;
  total:        number;
  total_contacts: number;
  total_shares:   number;
  period_days:  number;
};

export type PropertyEventCount = {
  entity_id: string;
  count:     number;
};
