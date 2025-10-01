'use client'

import { TPropertyResponseSchema } from "@/lib/types/property";
import { MapPin, BedDouble, Ruler, Tag, Heart } from "lucide-react";
import { ShareButton } from "./share-button";

// ===== COMPONENTE PROPERTY HEADER =====
export function PropertyHeader ({ property }: { property: TPropertyResponseSchema }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
          {property.rotulo || (property.status === "arrendar" ? "Para Alugar" : "À Venda")}
        </span>
        <ShareButton property={property} />
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words mb-2">
        {property.title}
      </h1>
      
      <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span className="break-words line-clamp-2">
          {[property.endereco, property.bairro, property.cidade, property.provincia, property.pais].filter(Boolean).join(", ")}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-4">
        {property.tipo && (
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
            <span className="font-semibold">Tipo:</span> {property.tipo}
          </div>
        )}
        {typeof property.bedrooms !== 'undefined' && (
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
            <BedDouble className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>{property.bedrooms} Quartos</span>
          </div>
        )}
        {property.size && (
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
            <Ruler className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>{property.size}</span>
          </div>
        )}
        {typeof property.bathrooms !== 'undefined' && (
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
            <span className="font-semibold">Banheiros:</span> {property.bathrooms}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-xl sm:text-2xl font-extrabold text-orange-500 flex items-center gap-2">
          {property.price && (
            <>
              <Tag className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              {property.price.toLocaleString(
                property.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }
              )}
              {property.unidade_preco && (
                <span className="text-sm sm:text-base font-normal">
                  {property.unidade_preco === "kwanza"
                    ? "KZ"
                    : property.unidade_preco === "dolar"
                    ? "USD"
                    : property.unidade_preco}
                </span>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 transition-colors">
            <Heart size={16} />
            Favoritar
          </button>
        </div>
      </div>
    </div>
  );
};