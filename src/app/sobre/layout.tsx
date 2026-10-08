import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export const metadata: Metadata = {
  title: 'Sobre Nós — A Plataforma Imobiliária de Angola',
  description: 'Conheça a Kercasa, a plataforma imobiliária em Angola para compra, venda e arrendamento de imóveis. Anúncios publicados por anunciantes com verificação básica.',
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
        text: 'A Kercasa é a plataforma imobiliária em Angola para compra, venda e arrendamento de imóveis. Publicamos anúncios de anunciantes com verificação básica (contacto e coerência do anúncio) em várias províncias.',
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
        text: 'Os anúncios passam por verificação básica (contacto do anunciante e coerência do anúncio) antes da publicação. O conteúdo é da responsabilidade do anunciante; recomendamos visitar o imóvel e confirmar preço e disponibilidade antes de qualquer pagamento.',
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
