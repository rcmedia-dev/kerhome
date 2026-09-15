'use client';

import { Heart } from "lucide-react";
import { PropertyCardBase } from "@/components/ui/property-card-base";

type Property = {
  id: string;
  propertyid: string;
  title: string;
  description: string;
  tipo: string;
  status: string;
  price: string | null;
  endereco: string;
  bedrooms: number;
  bathrooms: number;
  garagens: number;
  size: string;
  gallery: string[];
};

type Props = {
  property: Property;
  onRemove?: () => void;
};

export function PropertyFavoritedCard({ property, onRemove }: Props) {
  const topBadge = (
    <div className={`px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-sm ${property.status === 'para comprar' || property.status === 'comprar' ? 'bg-[#10B981]' : 'bg-blue-500'}`}>
      {property.status === 'para comprar' || property.status === 'comprar' ? 'À venda' : 'Para alugar'}
    </div>
  );

  const topRightActions = (
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onRemove?.();
      }}
      className="bg-white/90 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50"
      title="Remover dos favoritos"
    >
      <Heart className="w-5 h-5 fill-current" />
    </button>
  );

  return (
    <PropertyCardBase
      property={{...property, unidade_preco: 'kwanza'}}
      topBadge={topBadge}
      topRightActions={topRightActions}
      linkHref={`/propriedades/${property.propertyid}`}
    />
  );
}
