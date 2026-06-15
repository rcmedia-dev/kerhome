'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';

export function RecentlyViewedTracker({ propertyId }: { propertyId: string }) {
  const { add } = useRecentlyViewed();

  useEffect(() => {
    add(propertyId);
  }, [propertyId, add]);

  return null;
}
