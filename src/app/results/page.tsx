import { PropertyCard } from "@/components/property-showcase";
import { getProperties } from "@/lib/actions/get-properties";
import { Property } from "@/lib/types/property";


export default async function PropriedadesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const q = searchParams.q?.toLowerCase() || '';
  const status = searchParams.status;

  const all = await getProperties(); // ou paginar depois
  const filtered: Property[] = all.filter((p: Property) => {
    const matchesSearch = p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    const matchesStatus = status ? p.status === status : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Resultados da Pesquisa</h1>
      {filtered.length === 0 ? (
        <p>Nenhum imóvel encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <PropertyCard key={p.title} property={p} />
          ))}
        </div>
      )}
    </section>
  );
}
