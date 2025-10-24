'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BedDouble, Ruler, MapPin, Tag, Trash, Heart } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useUserStore } from "@/lib/store/user-store";

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
  onRemove?: () => void; // Callback para atualizar a lista após remover
};

const parseNumber = (value: string | number | null | undefined): number => {
  const n = typeof value === "string" ? parseInt(value) : value;
  return isNaN(Number(n)) ? 0 : Number(n);
};

export function PropertyFavoritedCard({ property, onRemove }: Props) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const { user } = useUserStore()

  const precoFormatado = parseNumber(property.price).toLocaleString("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  });

  const galleryImage = property.gallery?.[0];

  const handleRemoveFavorite = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    
    try {
      
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }

      // Remover dos favoritos
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', property.id);

      if (error) {
        throw error;
      }

      setIsRemoved(true);
      
      // Chamar callback para atualizar a lista
      if (onRemove) {
        onRemove();
      }

    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  // Se foi removido, não renderiza o card
  if (isRemoved) {
    return null;
  }

  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 h-full flex flex-col relative group overflow-hidden">
      
      {/* Botão de remover favorito */}
      <button
        onClick={handleRemoveFavorite}
        disabled={isRemoving}
        className="absolute top-3 right-3 bg-white/90 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-full shadow-lg z-20 transition-all duration-300 group/button disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remover dos favoritos"
      >
        {isRemoving ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Heart className="w-4 h-4 fill-current" />
        )}
      </button>

      {/* Rótulo do status */}
      {property.status === 'para comprar' && (
        <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
          À venda
        </span>
      )}
      {property.status === 'para alugar' && (
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
          Para alugar
        </span>
      )}

      {/* Imagem principal */}
      <div className="relative h-56 w-full">
        {galleryImage ? (
          <Image
            src={galleryImage}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            Sem imagem
          </div>
        )}

        {/* Overlay na imagem ao passar o mouse */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Informações do imóvel */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{property.endereco}</span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{property.title}</h3>

          <div className="flex justify-between text-gray-700 text-sm">
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" />
              {property.bedrooms} Quartos
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4" />
              {property.size}
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{property.tipo || property.status}</span>
            <span>{parseNumber(property.bathrooms)} Banheiro{parseNumber(property.bathrooms) > 1 ? 's' : ''}</span>
            {parseNumber(property.garagens) > 0 && (
              <span>{parseNumber(property.garagens)} Garagem{parseNumber(property.garagens) > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-orange-500 font-bold">
            <Tag className="w-5 h-5" />
            <span>{precoFormatado}</span>
          </div>
        </div>

        {/* Botão de detalhes */}
        <div className="flex gap-2">
          <Link
            href={`/${property.status === 'para comprar' ? 'comprar' : 'alugar'}/${property.propertyid}`}
            className="flex-1 text-center bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg font-medium transition"
          >
            Ver detalhes
          </Link>
          
          {/* Botão secundário para remover (opcional) */}
          <button
            onClick={handleRemoveFavorite}
            disabled={isRemoving}
            className="px-3 bg-gray-100 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title="Remover dos favoritos"
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}