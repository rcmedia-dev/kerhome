import { getProperties } from '@/lib/actions/get-properties';
import { Property } from "@/lib/types/property";
import { PropertyCard } from "@/components/property-showcase";

// Página com 20 propriedades fictícias
export default async function PropertiesPage() {
  const properties: Property[] = (await getProperties()).filter(
    (p) => p.status === "para alugar"
  );
  if (!properties || properties.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-700">Nenhum imóvel para alugar no momento.</h2>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
