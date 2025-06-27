import HeroCarousel from '@/components/hero';
import PropertiesShowcase from '@/components/property-showcase';
import ActionCardsSection from '@/components/actions-card';
import FeaturedCarousel from '@/components/featured-houses';
import TopAgentsSection from '@/components/top-agent';
import { Property } from '@/lib/types/property';
import { getProperties } from '@/lib/actions/get-properties';


export default async function HomePage(){
  const properties: Property[] = await getProperties(4);
  return (
    <>
      <HeroCarousel property={properties} />
      <PropertiesShowcase property={properties}/>
      <ActionCardsSection />
      <FeaturedCarousel property={properties}/>
      <TopAgentsSection />
    </>
  )
}




