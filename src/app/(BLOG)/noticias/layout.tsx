import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: 'Notícias do Mercado Imobiliário em Angola',
  description: 'Fique por dentro das últimas novidades do mercado imobiliário angolano. Dicas, tendências e guias para comprar, vender ou arrendar imóveis.',
  openGraph: {
    title: 'Notícias do Mercado Imobiliário em Angola | Kercasa',
    description: 'Fique por dentro das últimas novidades do mercado imobiliário angolano.',
    url: `${SITE_URL}/noticias`,
    siteName: 'Kercasa',
    locale: 'pt_AO',
    type: 'website',
    images: [{ url: `${SITE_URL}/kercasa_logo.png`, width: 1200, height: 630, alt: 'Kercasa — Notícias' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notícias do Mercado Imobiliário em Angola | Kercasa',
    description: 'Últimas novidades do mercado imobiliário angolano.',
    images: [`${SITE_URL}/kercasa_logo.png`],
  },
  alternates: { canonical: `${SITE_URL}/noticias` },
  other: {
    'X-Robots-Tag': 'index, follow',
  },
};

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
