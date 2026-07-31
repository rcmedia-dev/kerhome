import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: 'Contacto — Fale Connosco sobre Imóveis em Angola | Kercasa',
  description: 'Entre em contacto com a Kercasa. Tire dúvidas sobre compra, venda ou arrendamento de imóveis em Angola. Suporte disponível 24/7.',
  keywords: 'contacto Kercasa, fale connosco, suporte imobiliário Angola, ajuda compra casa, arrendar imóvel',
  openGraph: {
    title: 'Contacto — Fale Connosco sobre Imóveis em Angola | Kercasa',
    description: 'Entre em contacto com a Kercasa. Tire dúvidas sobre imóveis em Angola. Suporte 24/7.',
    url: `${SITE_URL}/contato`,
    siteName: 'Kercasa',
    locale: 'pt_AO',
    type: 'website',
    images: [{ url: `${SITE_URL}/kercasa_logo.png`, width: 1200, height: 630, alt: 'Kercasa — Contacto' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto — Fale Connosco sobre Imóveis em Angola | Kercasa',
    description: 'Entre em contacto com a Kercasa. Suporte 24/7 para imóveis em Angola.',
    images: [`${SITE_URL}/kercasa_logo.png`],
  },
  alternates: { canonical: `${SITE_URL}/contato` },
  other: {
    'X-Robots-Tag': 'index, follow',
  },
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
