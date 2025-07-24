'use client';

import Image from "next/image";
import Link from "next/link";
import { BedDouble, Ruler, MapPin, Tag, Trash } from "lucide-react";

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
  user?: any;
  onRemove: () => void;
};

const parseNumber = (value: string | number | null | undefined): number => {
  const n = typeof value === "string" ? parseInt(value) : value;
  return isNaN(Number(n)) ? 0 : Number(n);
};

export function PropertyFavoritedCard({ property, user, onRemove }: Props) {
  const precoFormatado = parseNumber(property.price).toLocaleString("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  });

  const galleryImage = property.gallery?.[0];

  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 h-full flex flex-col relative group overflow-hidden">
      
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

        {/* Botão para remover dos favoritos */}
        {user?.id && (
          <button
            onClick={onRemove}
            className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-105 transition"
            title="Remover dos favoritos"
          >
            <Trash className="w-5 h-5 text-red-600" />
          </button>
        )}
      </div>

      {/* Informações do imóvel */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{property.endereco}</span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">{property.title}</h3>

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
        <div>
          <Link
            href={`/${property.status === 'para comprar' ? 'comprar' : 'alugar'}/${property.propertyid}`}
            className="flex justify-center w-full mt-2 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg font-medium transition"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
