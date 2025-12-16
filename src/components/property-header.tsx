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
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase ${property.status === "venda"
            ? "bg-blue-100 text-blue-700"
            : "bg-purple-100 text-purple-700"
            }`}>
            {property.rotulo || (property.status === "arrendar" ? "Para Alugar" : "À Venda")}
          </span>
          {property.tipo && (
            <span className="text-gray-500 font-medium text-sm flex items-center gap-1">
              • {property.tipo}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ShareButton property={property} />
        </div>
      </div>

      {/* Title & Address */}
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-3">
          {property.title}
        </h1>
        <div className="flex items-center gap-2 text-gray-500 text-lg">
          <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <span className="font-medium">
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