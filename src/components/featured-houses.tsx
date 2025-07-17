'use client'

import useEmblaCarousel from "embla-carousel-react";
import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, MapPin, Ruler, Tag } from "lucide-react";
import { useCallback, useEffect } from "react";
import { PropertyResponse } from "@/lib/types/property";

type FeaturedCarouselProps = {
  property: PropertyResponse[];
};

export default function FeaturedCarousel({ property }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const interval = setInterval(() => {
      scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [scrollNext]);

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">Casas em Destaque</h2>

        {/* Viewport */}
        <div className="embla overflow-hidden" ref={emblaRef}>
          {/* Slides container */}
          <div className="embla__container flex">
            {property.map((property, index) => {
              const linkHref = `/${property.status === 'para comprar' ? 'comprar' : 'alugar'}/${property.id}`;

              return (
                <Link
                  href={linkHref}
                  key={index}
                  className="embla__slide relative flex-shrink-0 w-[85%] md:w-[50%] lg:w-[33%] h-[400px] rounded-xl overflow-hidden shadow-md mx-2"
                >
                  <Image
                    src={property.gallery[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent text-white">
                    <h3 className="text-xl font-semibold">{property.title}</h3>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {property.endereco}
                    </p>
                    <div className="flex gap-4 text-sm mt-2">
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4" /> {property.bedrooms} Quartos
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="w-4 h-4" /> {property.size}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" /> {property.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
