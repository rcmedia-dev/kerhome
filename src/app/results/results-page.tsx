
import { PropertyCard } from "@/components/property-card";
import { searchProperties } from "@/lib/functions/supabase-actions/search-properties-action";

interface SearchParams {
  q?: string;
  status?: 'para alugar' | 'para comprar';
  cidade?: string;
}

export default async function ResultsPage({ q, status, cidade }: SearchParams) {
  const properties = await searchProperties({
    q: q,
    status: status,
    cidade: cidade,
  });

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
