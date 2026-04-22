'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { 
  getSimilarProperties, 
  getNearbyProperties,
  getOtherSuggestions 
} from '@/lib/functions/get-properties';
import { getAgents } from '@/lib/functions/get-agent';
import TopAgentsSection, { Agent } from '@/components/top-agent';
import { ChevronLeft, ChevronRight, Home, MapPin, Building2 } from 'lucide-react';

interface PropertyCardProps {
  property: TPropertyResponseSchema;
  variant?: 'default' | 'large';
}

function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const isLarge = variant === 'large';
  const imageHeight = isLarge ? 'h-48' : 'h-32';
  const padding = isLarge ? 'p-4' : 'p-3';

  return (
    <Link
      href={property.slug ? `/propriedades/${property.slug}` : `/propriedades/${property.id}`}
      className="group block bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 min-w-[240px] sm:min-w-[280px]"
    >
      <div className={`relative w-full ${imageHeight} overflow-hidden`}>
        <Image
          src={property.gallery?.[0] || property.image || '/house.jpg'}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={true}
        />
      </div>
      <div className={padding}>
        <h4 className={`font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors ${isLarge ? 'text-base' : 'text-sm'}`}>
          {property.title}
        </h4>
        <div className="flex items-center gap-1 text-gray-500 mt-1">
          <MapPin className="w-3 h-3" />
          <span className={`line-clamp-1 ${isLarge ? 'text-xs' : 'text-[10px]'}`}>
            {property.cidade || property.endereco || 'Localização'}
          </span>
        </div>
        <p className={`font-bold text-orange-500 mt-2 ${isLarge ? 'text-lg' : 'text-sm'}`}>
          {property.price?.toLocaleString('pt-AO', { minimumFractionDigits: 0 })}{' '}
          <span className="text-xs font-normal text-gray-500">
            {property.unidade_preco === 'kwanza' ? 'KZ' : property.unidade_preco === 'dolar' ? '$' : '€'}
          </span>
        </p>
      </div>
    </Link>
  );
}

interface CarouselSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  properties: TPropertyResponseSchema[];
  variant?: 'default' | 'large';
}

function CarouselSection({ title, subtitle, icon, properties, variant = 'default' }: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [properties]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (properties.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">{icon}</div>}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 hover:shadow-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map(prop => (
            <PropertyCard key={prop.id} property={prop} variant={variant} />
          ))}
        </div>
        
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 hover:shadow-xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

interface PropertySuggestionsProps {
  property: TPropertyResponseSchema;
}

export default function PropertySuggestions({ property }: PropertySuggestionsProps) {
  const [similar, setSimilar] = useState<TPropertyResponseSchema[]>([]);
  const [nearby, setNearby] = useState<TPropertyResponseSchema[]>([]);
  const [suggestions, setSuggestions] = useState<TPropertyResponseSchema[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const [similarResult, nearbyResult, suggestionsResult, agentsResult] = await Promise.all([
        getSimilarProperties(property.id, property.title, property.price, 3),
        getNearbyProperties(property.id, property.cidade || '', property.provincia || '', 3),
        getOtherSuggestions([property.id], 3),
        getAgents(6)
      ]);
      
      setSimilar(similarResult || []);
      setNearby(nearbyResult || []);
      setSuggestions(suggestionsResult || []);
      setAgents(agentsResult || []);
      setLoading(false);
    }

    fetchData();
  }, [property.id, property.title, property.price, property.cidade, property.provincia]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
          <div className="flex gap-4 justify-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-72 h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {similar.length > 0 && (
        <CarouselSection
          title="Imóveis Semelhantes"
          subtitle="Baseado no título e preço"
          icon={<Building2 className="w-5 h-5" />}
          properties={similar.slice(0, 3)}
          variant="large"
        />
      )}
      
      {agents.length > 0 && (
        <div className="py-4">
          <TopAgentsSection 
            agents={agents} 
            className="py-12 bg-white rounded-2xl border border-gray-100 relative overflow-hidden" 
          />
        </div>
      )}

      {nearby.length > 0 && (
        <CarouselSection
          title="Na mesma região"
          subtitle="Imóveis próximos desta localização"
          icon={<MapPin className="w-5 h-5" />}
          properties={nearby.slice(0, 3)}
          variant="large"
        />
      )}

      {suggestions.length > 0 && (
        <CarouselSection
          title="Outras sugestões"
          subtitle="Você também pode gostar"
          icon={<Home className="w-5 h-5" />}
          properties={suggestions.slice(0, 3)}
          variant="large"
        />
      )}
    </div>
  );
}