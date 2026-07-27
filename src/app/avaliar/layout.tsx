import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: 'Avaliação Gratuita de Imóveis em Angola | Kercasa',
  description: 'Avalie o valor do seu imóvel em Angola. Calculadora gratuita por bairro, província e características. Luanda, Benguela, Huíla e mais.',
  keywords: 'avaliar imóvel Angola, avaliação casa, valor imóvel Luanda, preço m2 Angola, estimativa imobiliária',
  openGraph: {
    title: 'Avaliação Gratuita de Imóveis em Angola | Kercasa',
    description: 'Avalie o valor do seu imóvel em Angola. Calculadora gratuita por bairro e província.',
    url: `${SITE_URL}/avaliar`,
    siteName: 'Kercasa',
    locale: 'pt_AO',
    type: 'website',
    images: [{ url: `${SITE_URL}/kercasa_logo.png`, width: 1200, height: 630, alt: 'Kercasa — Avaliação de Imóveis' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Avaliação Gratuita de Imóveis em Angola | Kercasa',
    description: 'Avalie o valor do seu imóvel em Angola. Calculadora gratuita.',
    images: [`${SITE_URL}/kercasa_logo.png`],
  },
  alternates: { canonical: `${SITE_URL}/avaliar` },
  other: {
    'X-Robots-Tag': 'index, follow',
  },
};

export default function AvaliarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
