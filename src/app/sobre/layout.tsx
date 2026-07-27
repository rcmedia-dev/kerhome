import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: 'Sobre Nós — A Plataforma Imobiliária de Angola',
  description: 'Conheça a Kercasa, a plataforma líder em Angola para compra, venda e arrendamento de imóveis. Milhares de imóveis verificados e agentes de confiança.',
  openGraph: {
    title: 'Sobre Nós — Kercasa | Plataforma Imobiliária de Angola',
    description: 'Conheça a Kercasa, a plataforma líder em Angola para compra, venda e arrendamento de imóveis.',
    url: `${SITE_URL}/sobre`,
    siteName: 'Kercasa',
    locale: 'pt_AO',
    type: 'website',
    images: [{ url: `${SITE_URL}/kercasa_logo.png`, width: 1200, height: 630, alt: 'Kercasa — Sobre Nós' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre Nós — Kercasa',
    description: 'Conheça a Kercasa, a plataforma líder em Angola para imóveis.',
    images: [`${SITE_URL}/kercasa_logo.png`],
  },
  alternates: { canonical: `${SITE_URL}/sobre` },
  other: {
    'X-Robots-Tag': 'index, follow',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'O que é a Kercasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Kercasa é a plataforma líder em Angola para compra, venda e arrendamento de imóveis. Oferecemos milhares de imóveis verificados em todas as províncias, com agentes imobiliários de confiança e processos 100% digitais.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quais províncias a Kercasa cobre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Kercasa cobre 15 províncias de Angola, incluindo Luanda, Benguela, Huíla, Huambo, Cabinda, Uíge, Kwanza Sul, Kwanza Norte, Malanje, Namibe, Cunene, Moxico, Icolo e Bengo, Zaire e Lunda Norte.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como funcionam as transações na Kercasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Todas as transações são verificadas pela nossa equipa. Os imóveis são rigorosamente verificados antes de serem publicados, garantindo segurança e confiança em cada negócio. Os processos são 100% digitais.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como posso contactar o suporte da Kercasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O suporte da Kercasa está disponível 24/7. Pode contactar-nos através do formulário na página de contacto, por email, ou pelos nossos canais de redes sociais. A nossa equipa responde rapidamente a todas as questões.',
      },
    },
    {
      '@type': 'Question',
      name: 'Posso arrendar imóveis na Kercasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim! A Kercasa disponibiliza opções de compra, venda e arrendamento. Pode filtrar imóveis por tipo de negócio na nossa plataforma e encontrar casas, apartamentos e vivendas para arrendar em toda Angola.',
      },
    },
  ],
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
