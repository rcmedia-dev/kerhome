'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kercasa_saved_searches';

export type SavedSearch = {
  id: string;
  name: string;
  filters: Record<string, string>;
  createdAt: string;
};

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSearches(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((name: string, filters: Record<string, string>) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    setSearches(prev => {
      const next = [newSearch, ...prev].slice(0, 10);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return newSearch;
  }, []);

  const remove = useCallback((id: string) => {
    setSearches(prev => {
      const next = prev.filter(s => s.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { searches, save, remove };
}
