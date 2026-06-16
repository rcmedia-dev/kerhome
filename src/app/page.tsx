export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from 'next';
import HeroCarousel from '@/components/hero';
import PropertiesShowcase from '@/components/property-showcase';
import ActionCardsSection from '@/components/actions-card';
import TopAgentsSection, { Agent } from '@/components/top-agents';
import { getLimitedProperties } from '@/lib/functions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getAgents } from '@/lib/functions/get-agent';
import { fetchFeaturedAgencies } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import AgencyCarousel from '@/components/agency-carousel';
import { SplashScreen } from '@/components/splash-screen';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Kercasa - Seu lar, começa aqui",
    description: "Plataforma imobiliária inteligente em Angola. Anuncie, compre ou arrende imóveis com o poder da IA. Encontre a casa dos seus sonhos em Luanda, Benguela, Huíla e mais.",
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: "Kercasa - Seu lar, começa aqui",
      description: "Plataforma imobiliária inteligente em Angola. Anuncie, compre ou arrende imóveis com o poder da IA.",
      url: SITE_URL,
      siteName: "Kercasa",
      locale: "pt_AO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kercasa - Seu lar, começa aqui",
      description: "Plataforma imobiliária inteligente em Angola. Anuncie, compre ou arrende imóveis com o poder da IA.",
    },
  };
}

export default async function HomePage() {
  const properties: TPropertyResponseSchema[] = await getLimitedProperties(8);
  const agents: Agent[] = await getAgents();
  const featuredAgencies = await fetchFeaturedAgencies();

  if (!properties) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-700">Nenhum imóvel cadastrado no momento.</h2>
      </div>
    );
  }

  return (
    <>
      <SplashScreen />
      <HeroCarousel property={properties} />
      <ActionCardsSection />
      <TopAgentsSection agents={agents}/>
      <PropertiesShowcase property={properties}/>
      <AgencyCarousel agencies={featuredAgencies} />
    </>
  );
}

