import { getProperties } from "@/lib/actions/get-properties";
import { Property } from "@/lib/types/property";
import { MapPin, BedDouble, Ruler, Tag } from "lucide-react";
import Link from "next/link";

// Card de imóvel
function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 w-full h-full flex flex-col">
      {/* Imagem */}
      <div className="relative h-56 w-full">
        <img
          src={property.image}
          alt={property.title}
          className="object-cover"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2">
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

         <Link href={`/alugar/${property.id}`} className="flex justify-center cursor-pointer w-full mt-2 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg font-medium transition">
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}

// Página com 20 propriedades fictícias
export default async function PropertiesPage() {
  const properties: Property[] = await getProperties(25);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
