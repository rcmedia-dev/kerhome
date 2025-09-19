export const dynamic = "force-dynamic"; // 🔁 sempre atualizar

// app/alugar/page.tsx
import { PropertyCard } from "@/components/property-card";
import { getProperties } from "@/lib/actions/get-properties"; // importar a action

export default async function PropertiesPage() {
  const allProperties = await getProperties(); // buscar todas as propriedades

  // Filtrar apenas os imóveis para alugar
  const properties = allProperties.filter(
    (p) => p.status.toLowerCase() === "arrendar"
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
      <div
        className="
          flex flex-col items-center gap-6
          sm:grid sm:grid-cols-2 lg:grid-cols-3
        "
      >
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
