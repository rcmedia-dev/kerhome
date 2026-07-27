export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from 'next';
import HeroCarousel from '@/components/hero';
import PropertiesShowcase from '@/components/property-showcase';
import ActionCardsSection from '@/components/actions-card';
import TopAgentsSection, { Agent } from '@/components/top-agents';
import { getFeaturedProperties, getLimitedProperties } from '@/lib/functions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getAgents } from '@/lib/functions/get-agent';
import { fetchFeaturedAgencies } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import AgencyCarousel from '@/components/agency-carousel';
import { SplashScreenClient } from '@/components/splash-screen-client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Kercasa — Imóveis em Angola | Comprar, Vender e Arrendar Casas",
    description: "Encontre casas, apartamentos e vivendas para comprar ou arrendar em Angola. Imóveis verificados em Luanda, Benguela, Huíla, Talatona e Kilamba.",
    alternates: { canonical: SITE_URL },
    other: {
      'X-Robots-Tag': 'index, follow',
    },
    openGraph: {
      title: "Kercasa — Imóveis em Angola | Comprar, Vender e Arrendar Casas",
      description: "Encontre a casa dos seus sonhos em Angola. Milhares de imóveis verificados para comprar ou arrendar.",
      url: SITE_URL,
      siteName: "Kercasa",
      locale: "pt_AO",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/kercasa_logo.png`,
          width: 1200,
          height: 630,
          alt: "Kercasa — Plataforma Imobiliária em Angola",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Kercasa — Imóveis em Angola | Comprar, Vender e Arrendar Casas",
      description: "Encontre a casa dos seus sonhos em Angola. Milhares de imóveis verificados.",
      images: [`${SITE_URL}/kercasa_logo.png`],
    },
  };
}

export default async function HomePage() {
  const featuredProperties: TPropertyResponseSchema[] = await getFeaturedProperties();
  const recentProperties: TPropertyResponseSchema[] = await getLimitedProperties(8);
  const agents: Agent[] = await getAgents();
  const featuredAgencies = await fetchFeaturedAgencies();

  return (
    <>
      <SplashScreenClient />
      <HeroCarousel property={featuredProperties} />
      <ActionCardsSection />
      <TopAgentsSection agents={agents}/>
      <PropertiesShowcase property={recentProperties}/>
      <AgencyCarousel agencies={featuredAgencies} />
    </>
  );
}

