import { PropertyCard } from "@/components/property-card";
import { searchProperties } from "@/lib/functions/supabase-actions/search-properties-action";

interface ResultsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: "para alugar" | "para comprar";
    cidade?: string;
  }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  // ⏳ Aguarda os searchParams
  const params = await searchParams;

  // 🔍 Busca propriedades com filtros
  const properties = await searchProperties(params);

  return (
    <div className="max-w-7xl mx-auto py-6">
      {properties.length === 0 ? (
        <p>Nenhum imóvel encontrado.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {properties.map((p) => (
           <PropertyCard key={p.id} property={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
