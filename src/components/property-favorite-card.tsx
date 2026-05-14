'use client';

import { useState } from "react";
import { Heart, Trash } from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from "@/lib/store/user-store";
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
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const { user } = useUserStore()
  const supabase = createClient();

  const handleRemoveFavorite = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    
    try {
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', property.id);

      if (error) throw error;

      setIsRemoved(true);
      if (onRemove) onRemove();
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  if (isRemoved) return null;

  const topBadge = (
    <div className={`px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-sm ${property.status === 'para comprar' || property.status === 'comprar' ? 'bg-[#10B981]' : 'bg-blue-500'}`}>
      {property.status === 'para comprar' || property.status === 'comprar' ? 'À venda' : 'Para alugar'}
    </div>
  );

  const topRightActions = (
    <button
      onClick={handleRemoveFavorite}
      disabled={isRemoving}
      className="bg-white/90 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50"
      title="Remover dos favoritos"
    >
      {isRemoving ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Heart className="w-5 h-5 fill-current" />
      )}
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
