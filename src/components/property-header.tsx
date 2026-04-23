'use client'

import { TPropertyResponseSchema } from "@/lib/types/property";
import { MapPin, BedDouble, Ruler, Tag, Bath, CarFront, Share2 } from "lucide-react";
import { ShareButton } from "@/components/share-button";

// ===== COMPONENTE PROPERTY HEADER =====
export function PropertyHeader({ property }: { property: TPropertyResponseSchema }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
            property.status === "comprar"
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white"
            }`}>
            {property.status === "arrendar" ? "Para Alugar" : "À Venda"}
          </span>
          {(property.tipo || property.rotulo) && (
            <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
              <span>•</span>
              {property.tipo && <span className="capitalize">{property.tipo}</span>}
              {property.rotulo && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] uppercase">
                  {property.rotulo}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ShareButton property={property} />
        </div>
      </div>

      {/* Title & Address */}
      <div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3 break-words">
          {property.title}
        </h1>
        <div className="flex items-start gap-2 text-gray-500 text-base md:text-lg">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-purple-600 flex-shrink-0 mt-1" />
          <span className="font-medium break-words leading-snug">
            {[property.endereco, property.bairro, property.cidade, property.provincia].filter(Boolean).join(", ")}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="pt-4 flex items-center gap-4">
        <div className="text-3xl sm:text-4xl font-bold text-orange-500">
          {property.price && (
            <>
              {property.price.toLocaleString(
                property.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }
              )}
              <span className="text-xl sm:text-2xl ml-1 text-gray-500 font-medium">
                {property.unidade_preco === "kwanza"
                  ? "KZ"
                  : property.unidade_preco === "dolar"
                    ? "USD"
                    : property.unidade_preco}
              </span>
            </>
          )}
        </div>

        {property.status === "arrendar" && (
          <span className="text-gray-400 text-lg">/mês</span>
        )}
      </div>

    </div>
  );
};
