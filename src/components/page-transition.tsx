'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current && document.startViewTransition) {
      document.startViewTransition(() => {
        prevPath.current = pathname;
      });
    } else {
      prevPath.current = pathname;
    }
  }, [pathname]);

  return <>{children}</>;
}
