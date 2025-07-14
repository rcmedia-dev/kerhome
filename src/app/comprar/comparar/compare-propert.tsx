"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/property-showcase";
import { getProperties } from '@/lib/actions/get-properties';
import Link from "next/link";
import { PropertyResponse } from "@/lib/types/property";

export default function CompararPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [similar, setSimilar] = useState<PropertyResponse[]>([]);

  useEffect(() => {
    async function fetchData() {
      const props = await getProperties();
      const current = props.find((p: any) => p.id === Number(id)) || props[0];
      setProperty(current);
      setSimilar(props.filter((p: any) => p.id !== Number(id)).slice(0, 6));
    }
    if (id) fetchData();
  }, [id]);

  if (!property) return null;

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      {/* Card absoluto do imóvel a comparar */}
      <div className="fixed top-20 left-16 z-20 animate-float shadow-2xl">
        <PropertyCard property={property} />
      </div>
      {/* Lista de imóveis para comparar */}
      <div className="container mx-auto pt-8 pl-[340px] pr-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Comparar com outros imóveis</h2>
        <div className="flex flex-wrap gap-6">
          {similar.map((p) => (
            <Link
              key={p.id}
              href={`/comprar/comparar/${p.id}?base=${property.id}`}
              className="cursor-pointer block"
            >
              <PropertyCard property={p} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/*
Adicione a seguinte animação no seu CSS global (ex: globals.css):

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
  100% { transform: translateY(0); }
}
.animate-float {
  animation: float 2.5s ease-in-out infinite;
}
*/
