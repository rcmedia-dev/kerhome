
import Image from 'next/image';
import { BedDouble, MapPin, Ruler, Tag } from "lucide-react";
import Link from "next/link";
import { PropertyResponse } from '@/lib/types/property';

type PropertiesShowCaseProps = {
    property: PropertyResponse[];
    inline?: boolean;
}

export default function PropertiesShowcase({ property, inline }: PropertiesShowCaseProps) {
  return (
    <section className="flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-10 bg-white">
      <div className="flex flex-col justify-center items-center text-center mb-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-800 font-bold">
          Sua Próxima Casa
        </h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Encontre sua próxima casa aqui na Kerhome
        </p>
      </div>

      <div className="mx-auto">
        {inline ? (
          <div className="flex gap-6">
            {property.map((property) => (
              <PropertyCard key={property.title} property={property} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
            {property.map((property) => (
              <PropertyCard key={property.title} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function PropertyCard({ property }: { property: PropertyResponse }) {
  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col relative">
      {/* Badge de status */}
      {property.status === 'para comprar' && (
        <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">À venda</span>
      )}
      {property.status === 'para alugar' && (
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">Para alugar</span>
      )}
      {/* Imagem */}
      <div className="relative h-56 w-full">
        <Image
          src={property.gallery[0]}
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{property.endereco}</span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">
            {property.title}
          </h3>

          <div className="flex justify-between text-gray-700 text-sm">
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" /> {property.bedrooms} Quartos
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4" /> {property.size}
            </div>
          </div>

          {/* Pequeno bloco extra de info */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{property.tipo || property.status}</span>
            {property.bathrooms !== undefined && (
              <span>
                {property.bathrooms ?? 0} Banheiro{(property.bathrooms ?? 0) > 1 ? 's' : ''}
              </span>
            )}
           {property.garagens != null && property.garagens > 0 && (
              <span>{property.garagens} Garagem{property.garagens > 1 ? 's' : ''}</span>
            )}

          </div>

          <div className="flex items-center gap-2 text-orange-500 font-bold">
            <Tag className="w-5 h-5" />
            <span>{property.price}</span>
          </div>
        </div>

        {/* Botão alinhado ao final */}
        <div>
          <Link href={`/${property.status === 'para comprar' ? 'comprar' : 'alugar'}/${property.id}`} className="flex justify-center cursor-pointer w-full mt-2 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg font-medium transition">
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
