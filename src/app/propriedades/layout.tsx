import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: 'Propriedades à Venda e para Arrendar em Angola',
  description: 'Explore imóveis verificados em Angola. Casas, apartamentos e vivendas à venda e para arrendar em Luanda, Benguela, Talatona, Kilamba e mais.',
  openGraph: {
    title: 'Propriedades à Venda e para Arrendar em Angola | Kercasa',
    description: 'Explore imóveis verificados em Angola. Casas, apartamentos e vivendas à venda e para arrendar.',
    url: `${SITE_URL}/propriedades`,
    siteName: 'Kercasa',
    locale: 'pt_AO',
    type: 'website',
    images: [{ url: `${SITE_URL}/kercasa_logo.png`, width: 1200, height: 630, alt: 'Kercasa — Propriedades' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propriedades à Venda e para Arrendar em Angola | Kercasa',
    description: 'Explore imóveis verificados em Angola. Casas, apartamentos e vivendas.',
    images: [`${SITE_URL}/kercasa_logo.png`],
  },
  alternates: { canonical: `${SITE_URL}/propriedades` },
  other: {
    'X-Robots-Tag': 'index, follow',
  },
};

export default function PropriedadesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
