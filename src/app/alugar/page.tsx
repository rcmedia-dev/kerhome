
import { PropertyCard } from "@/components/property-card";
import { mockProperties } from "@/lib/mockups/properties-mockup";
import { PropertyResponse } from "@/lib/types/property";

export default function PropertiesPage() {
  const properties = mockProperties.filter(
    (p: PropertyResponse) => p.status === "para alugar"
  );

  if (!properties || properties.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-700">
          Nenhum imóvel para alugar no momento.
        </h2>
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
