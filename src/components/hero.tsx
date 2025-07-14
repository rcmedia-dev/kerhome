'use client'

import { PropertyResponse } from "@/lib/types/property";
import useEmblaCarousel from "embla-carousel-react";
import { BedDouble, Ruler, Tag } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useCallback, useEffect } from "react";

type HeroCarouselProps = {
    property: PropertyResponse[]
}

export default function HeroCarousel( {property}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const interval = setInterval(() => {
      scrollNext();
    }, 5000); // muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [scrollNext]);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {property.map((property, i) => (
            <div
              className="embla__slide relative min-w-full h-full"
              key={i}
            >
              <Image
                src={property.gallery[0]}
                alt={property.title}
                fill
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-6 md:px-8 md:py-8 text-white w-full max-w-xl text-center shadow-xl">
                  <h2 className="text-2xl md:text-4xl font-bold">
                    {property.title}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-100 mt-2 mb-4">
                    {property.endereco}
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4 md:w-5 md:h-5" /> {property.bedrooms} Quartos
                    </div>
                    <div className="flex items-center gap-1">
                      <Ruler className="w-4 h-4 md:w-5 md:h-5" /> {property.size}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4 md:w-5 md:h-5" /> {property.price}
                    </div>
                  </div>

                  <Link href={`/alugar/${property.id}`} className="mt-3 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg text-white font-medium transition">
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
