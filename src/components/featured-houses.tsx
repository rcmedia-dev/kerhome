'use client'

import useEmblaCarousel from "embla-carousel-react";
import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, MapPin, Ruler, Tag, Star, Heart, ArrowRight, ArrowLeft, MoveRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TPropertyResponseSchema } from "@/lib/types/property";

type FeaturedCarouselProps = {
  property: TPropertyResponseSchema[];
};

export default function FeaturedCarousel({ property }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false,
    duration: 20
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const scrollNext = useCallback(() => {
    if (emblaApi && !isHovering) emblaApi.scrollNext();
  }, [emblaApi, isHovering]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (emblaApi) {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const interval = setInterval(() => {
      scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [scrollNext]);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header modernizado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 mb-4">
            <Star className="w-4 h-4 text-orange-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">Destaques exclusivos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Imóveis <span className="text-orange-500">Selecionados</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra as propriedades mais incríveis cuidadosamente escolhidas para você
          </p>
        </div>

        {/* Controles do carousel */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={scrollPrev}
              className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
            </button>
            <button
              onClick={scrollNext}
              className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
            </button>
          </div>
          
          {/* Indicadores */}
          <div className="flex items-center gap-2">
            {property.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === selectedIndex 
                    ? 'bg-orange-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Viewport */}
        <div 
          className="embla overflow-hidden"
          ref={emblaRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Slides container */}
          <div className="embla__container flex gap-6">
            {property.map((property, index) => {
              const linkHref = `/${property.status === 'para comprar' ? 'comprar' : 'alugar'}/${property.id}`;
              const isFeatured = index === selectedIndex;

              return (
                <div
                  key={index}
                  className={`embla__slide flex-shrink-0 w-[85%] md:w-[45%] lg:w-[30%] transition-all duration-500 ${
                    isFeatured ? 'transform scale-105' : 'transform scale-95 opacity-80'
                  }`}
                >
                  <Link href={linkHref}>
                    <div className="group relative h-[450px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                      {/* Imagem com overlay gradiente */}
                      <Image
                        src={property.gallery[0]}
                        fill
                        alt={property.title}
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Overlay gradiente moderno */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Badge de status */}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        property.status === 'para comprar' 
                          ? 'bg-green-500/90 text-white' 
                          : 'bg-blue-500/90 text-white'
                      }`}>
                        {property.status === 'para comprar' ? 'Venda' : 'Arrendamento'}
                      </div>

                      {/* Botão de favorito */}
                      <button className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-red-500/90 transition-all duration-300 group-hover:scale-110">
                        <Heart className="w-4 h-4" />
                      </button>

                      {/* Conteúdo do card */}
                      <div className="absolute bottom-0 w-full p-6 text-white">
                        {/* Preço em destaque */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                            {property.price?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                          </span>
                        </div>

                        {/* Título e localização */}
                        <h3 className="text-xl font-bold mb-2 group-hover:text-orange-300 transition-colors">
                          {property.title}
                        </h3>
                        <p className="text-gray-200 text-sm flex items-center gap-2 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{property.endereco}</span>
                        </p>

                        {/* Características */}
                        <div className="flex items-center justify-between text-sm text-gray-200">
                          <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            <BedDouble className="w-4 h-4" />
                            {property.bedrooms} Quartos
                          </span>
                          <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Ruler className="w-4 h-4" />
                            {property.size}m²
                          </span>
                        </div>

                        {/* Botão de ação */}
                        <Link
                          href={`/${property.status === "arrendar" ? "alugar" : "comprar"}/${property.id}`}
                          className="mt-4 flex items-center gap-2 text-orange-300 group hover:text-orange-200 transition-colors"
                        >
                          <span className="text-sm font-semibold">Ver detalhes</span>
                          <MoveRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                      {/* Efeito de brilho no hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé do carousel */}
        <div className="text-center mt-8">
          <Link 
            href={`/comprar`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:gap-3"
          >
            Ver todos os imóveis
            <MoveRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}