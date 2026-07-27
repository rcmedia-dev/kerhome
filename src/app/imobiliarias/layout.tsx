import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: 'Imobiliárias Verificadas em Angola',
  description: 'Encontre imobiliárias verificadas em Angola. Agências imobiliárias de confiança em Luanda, Benguela, Huíla e todas as províncias.',
  openGraph: {
    title: 'Imobiliárias Verificadas em Angola | Kercasa',
    description: 'Encontre imobiliárias verificadas em Angola. Agências imobiliárias de confiança.',
    url: `${SITE_URL}/imobiliarias`,
    siteName: 'Kercasa',
    locale: 'pt_AO',
    type: 'website',
    images: [{ url: `${SITE_URL}/kercasa_logo.png`, width: 1200, height: 630, alt: 'Kercasa — Imobiliárias' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imobiliárias Verificadas em Angola | Kercasa',
    description: 'Encontre imobiliárias verificadas em Angola.',
    images: [`${SITE_URL}/kercasa_logo.png`],
  },
  alternates: { canonical: `${SITE_URL}/imobiliarias` },
  other: {
    'X-Robots-Tag': 'index, follow',
  },
};

export default function ImobiliariasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
