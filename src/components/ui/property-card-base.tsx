'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, BedDouble, Ruler, Tag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PropertyCardBaseProps = {
  property: any; // Accept varied property shapes during refactoring
  topBadge?: React.ReactNode;
  topRightActions?: React.ReactNode;
  bottomRightActions?: React.ReactNode;
  footerAction?: React.ReactNode;
  isClickable?: boolean;
  linkHref?: string;
};

export function PropertyCardBase({
  property,
  topBadge,
  topRightActions,
  bottomRightActions,
  footerAction,
  isClickable = true,
  linkHref
}: PropertyCardBaseProps) {
  const galleryImages = Array.isArray(property.gallery) && property.gallery.filter((img: any): img is string => typeof img === 'string').length > 0 
    ? property.gallery.filter((img: any): img is string => typeof img === 'string')
    : [];
  const coverImage = property.image && typeof property.image === 'string' ? property.image : '/house.jpg';
  const hasMultipleImages = galleryImages.length > 1;
  const totalImages = hasMultipleImages ? galleryImages.length : 0;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!hasMultipleImages || !isHovering || totalImages === 0) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % totalImages);
    }, 2000);
    
    return () => clearInterval(timer);
  }, [isHovering, hasMultipleImages, totalImages]);

  useEffect(() => {
    if (!isHovering) {
      setCurrentImageIndex(0);
    }
  }, [isHovering]);

  const defaultHref = linkHref || (property.slug ? `/propriedades/${property.slug}` : `/propriedades/${property.propertyid || property.id}`);
  const parseNumber = (val: any) => {
    const n = typeof val === "string" ? parseInt(val) : val;
    return isNaN(Number(n)) ? 0 : Number(n);
  };
  const priceParsed = parseNumber(property.price);

  return (
    <div className="group relative w-full bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden border border-border pb-2">

      {/* IMAGEM & BADGES */}
      <div 
          className="relative h-[180px] sm:h-[250px] w-full overflow-hidden shrink-0"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
        {isClickable ? (
          <Link href={defaultHref} className="absolute inset-0 z-10" />
        ) : (
          <div className="absolute inset-0 z-10 cursor-default" />
        )}

        <Image
          src={hasMultipleImages && galleryImages[currentImageIndex] ? galleryImages[currentImageIndex] : coverImage}
          alt={property.title || 'Imóvel'}
          fill
          priority
          unoptimized={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Overlay Hover Effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 pointer-events-none" />

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-none">
            {galleryImages.map((img: string, idx: number) => (
              <div
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}

        {/* Slots Externos da Imagem */}
        <div className="absolute top-4 left-4 z-20 pointer-events-auto">
          {topBadge}
        </div>

        {topRightActions && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-x-4 sm:group-hover:translate-x-0">
            {topRightActions}
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 pointer-events-auto">
          {bottomRightActions}
        </div>
      </div>

      {/* INFO CONTENT */}
      <div className="flex-1 px-3 sm:px-5 pt-3 sm:pt-5 pb-3 sm:pb-4 flex flex-col relative">

        <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm mb-1 sm:mb-1.5">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <span className="line-clamp-1">{property.endereco || "Localização não informada"}</span>
        </div>

        <h3 className="text-base sm:text-xl font-bold text-[#1A1A1A] leading-tight line-clamp-2 mb-2 sm:mb-3 overflow-hidden" title={property.title}>
          {isClickable ? (
            <Link href={defaultHref}>
              {property.title}
            </Link>
          ) : (
            <span>{property.title}</span>
          )}
        </h3>

        <div className="flex items-center justify-between text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2 border-b border-gray-50 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BedDouble className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <span className="font-medium">{parseNumber(property.bedrooms)} Quartos</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Ruler className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <span className="font-medium">{property.size}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
          <span className="capitalize">{property.tipo || property.status}</span>
          {(parseNumber(property.bathrooms) > 0) ? (
            <span className="text-gray-500">{parseNumber(property.bathrooms)} Banheiros</span>
          ) : (
            <span></span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
          <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[#F97316] -rotate-90" />
          <span className="text-lg sm:text-2xl font-bold text-[#F97316]">
            {priceParsed.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {property.unidade_preco === 'dolar' ? '$' : property.unidade_preco === 'euro' ? '€' : 'Kz'}
          </span>
        </div>

        <div className="pt-2 sm:pt-4 mt-auto border-t border-gray-100">
          {footerAction ? footerAction : (
            isClickable ? (
              <Link
                href={defaultHref}
                className="w-full bg-[#820AD1] hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-button text-center transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
              >
                <span>Ver Detalhes</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            ) : (
              <div className="w-full bg-gray-100 text-gray-400 font-bold py-3 px-4 rounded-button text-center flex items-center justify-center gap-2 cursor-default">
                <span>Ver Detalhes</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
