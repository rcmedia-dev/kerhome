export const revalidate = 0;
export const dynamic = "force-dynamic";


import HeroCarousel from '@/components/hero';
import PropertiesShowcase from '@/components/property-showcase';
import ActionCardsSection from '@/components/actions-card';
import TopAgentsSection, { Agent } from '@/components/top-agent';
import { getLimitedProperties } from '@/lib/functions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getAgents } from '@/lib/functions/get-agent';
import { fetchFeaturedAgencies } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import AgencyCarousel from '@/components/agency-carousel';

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
      <HeroCarousel property={properties} />
      <ActionCardsSection />
      <TopAgentsSection agents={agents}/>
      <PropertiesShowcase property={properties}/>
      <AgencyCarousel agencies={featuredAgencies} />
    </>
  );
}

