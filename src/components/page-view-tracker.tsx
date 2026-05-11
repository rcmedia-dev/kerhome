'use client';

import { useEffect, useRef } from 'react';
import { useTrackEvent } from '@/hooks/use-track-event';
import { EntityType, EventType } from '@/lib/functions/supabase-actions/track-event-types';

interface PageViewTrackerProps {
  eventType: EventType;
  entityType: EntityType;
  entityId: string;
  ownerId?: string;
  metadata?: Record<string, any>;
}

/**
 * Componente utilitário para rastrear visualizações de página (Page Views).
 * Pode ser usado em Server Components para disparar o tracking no lado cliente.
 */
export function PageViewTracker({
  eventType,
  entityType,
  entityId,
  ownerId,
  metadata
}: PageViewTrackerProps) {
  const { track } = useTrackEvent();
  const tracked = useRef(false);

  useEffect(() => {
    // Evitar track duplicado em modo StrictMode / re-renders
    if (tracked.current) return;
    
    track({
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      owner_id: ownerId,
      metadata: metadata || {}
    });
    
    tracked.current = true;
  }, [eventType, entityType, entityId, ownerId, metadata, track]);

  return null;
}
