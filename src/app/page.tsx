import HeroCarousel from '@/components/hero';
import PropertiesShowcase from '@/components/property-showcase';
import ActionCardsSection from '@/components/actions-card';
import FeaturedCarousel from '@/components/featured-houses';
import TopAgentsSection from '@/components/top-agent';
import { getLimitedProperties, getProperties } from '@/lib/actions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';

export default async function HomePage() {
  // Em vez de fetch da API, usar mock direto:
  const properties: TPropertyResponseSchema[] = await getLimitedProperties(3);

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
      <PropertiesShowcase property={properties}/>
      <ActionCardsSection />
      <FeaturedCarousel property={properties} />
      <TopAgentsSection />
    </>
  );
}
