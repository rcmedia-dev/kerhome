'use client';

import { useTransition, useCallback, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/functions/supabase-actions/track-event-action';
import { type TrackEventInput } from '@/lib/functions/supabase-actions/track-event-types';

// ============================================================
// Session ID — gerado uma vez por sessão de browser
// Persiste em sessionStorage para não criar novo ID por navegação
// ============================================================
function getOrCreateSessionId(): string {
  try {
    const key = 'kercasa_session_id';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    // Fallback para ambientes sem sessionStorage (SSR, etc.)
    return crypto.randomUUID();
  }
}

// ============================================================
// Hook — reutilizável em qualquer componente client-side
// Usa useTransition para não bloquear o UI (padrão do dashboard)
// ============================================================
export function useTrackEvent() {
  const [, startTransition] = useTransition();
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  const track = useCallback(
    (input: Omit<TrackEventInput, 'session_id'>) => {
      startTransition(() => {
        trackEvent({
          ...input,
          session_id: sessionIdRef.current,
        });
      });
    },
    []
  );

  return { track };
}
