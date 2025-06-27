import { Property } from "@/lib/types/property";
import Image from 'next/image';
import { BedDouble, MapPin, Ruler, Tag } from "lucide-react";
import Link from "next/link";

type PropertiesShowCaseProps = {
    property: Property[]
}

export default function PropertiesShowcase({ property }: PropertiesShowCaseProps) {
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

      <div className=" mx-auto">
        <div className="flex flex-wrap justify-center gap-8">
          {property.map((property) => (
            <PropertyCard key={property.title} property={property} />
          ))}
        </div>

      </div>
    </section>
  );
}

export function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col">
      {/* Imagem */}
      <div className="relative h-56 w-full">
        <Image
          src={property.image}
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
            <span>{property.location}</span>
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

          <div className="flex items-center gap-2 text-orange-500 font-bold">
            <Tag className="w-5 h-5" />
            <span>{property.price}</span>
          </div>
        </div>

        {/* Botão alinhado ao final */}
        <div>
          <Link href={`/comprar/${property.id}`} className="flex justify-center cursor-pointer w-full mt-2 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg font-medium transition">
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
