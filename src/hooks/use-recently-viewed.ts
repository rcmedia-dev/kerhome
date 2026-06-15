'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kercasa_recently_viewed';
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {}
  }, []);

  const add = useCallback((id: string) => {
    setRecentIds(prev => {
      const next = [id, ...prev.filter(x => x !== id)].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setRecentIds(prev => {
      const next = prev.filter(x => x !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { recentIds, add, remove };
}
