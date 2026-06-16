'use client'

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BreadcrumbListJsonLd } from '@/components/json-ld';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, currentUrl }: { items: BreadcrumbItem[]; currentUrl?: string }) {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';
  const allItems = [{ label: 'Início', href: '/' }, ...items];

  const jsonLdItems = allItems.map((item) => ({
    name: item.label,
    url: item.href
      ? `${siteUrl}${item.href}`
      : currentUrl || `${siteUrl}${pathname}`,
  }));

  return (
    <>
      <BreadcrumbListJsonLd items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className="text-xs md:text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-1.5 md:gap-2 px-1">
        {allItems.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 md:gap-2">
            {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-purple-600 transition-colors flex items-center gap-1 shrink-0">
                {i === 0 && <Home className="w-3 h-3" />}
                <span className="truncate max-w-[120px]">{item.label}</span>
              </Link>
            ) : (
              <span className="text-gray-800 font-medium truncate max-w-[200px]">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}