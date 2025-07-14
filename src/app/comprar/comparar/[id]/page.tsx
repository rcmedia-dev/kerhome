"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/property-showcase";
import { getProperties } from "@/lib/actions/get-properties";
import { PropertyResponse } from "@/lib/types/property";

export default function CompararDoisPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const baseId = searchParams.get("base");
  const compareId = params.id;
  const [base, setBase] = useState<PropertyResponse | null>(null);
  const [compare, setCompare] = useState<PropertyResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      const props = await getProperties();
      setBase(props.find((p: any) => p.id === Number(baseId)) || null);
      setCompare(props.find((p: any) => p.id === Number(compareId)) || null);
    }
    if (baseId && compareId) fetchData();
  }, [baseId, compareId]);

  if (!base || !compare) return null;

  function highlightDiff(val1: any, val2: any) {
    return val1 === val2
      ? "text-gray-800"
      : "bg-gradient-to-r from-gray-200 to-gray-100 font-semibold text-gray-900";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 md:p-10">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-900 tracking-tight drop-shadow-sm">
        Comparação de Imóveis
      </h2>

      <div className="flex flex-wrap gap-10 justify-center items-start mb-16">
        <div className="max-w-sm transition-transform duration-300 hover:scale-105">
          <h4 className="font-semibold text-center mb-3 text-gray-800 text-lg">Imóvel Base</h4>
          <PropertyCard property={base} />
        </div>
        <div className="max-w-sm transition-transform duration-300 hover:scale-105">
          <h4 className="font-semibold text-center mb-3 text-gray-800 text-lg">Imóvel Selecionado</h4>
          <PropertyCard property={compare} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <h4 className="font-semibold text-2xl md:text-3xl mb-8 text-gray-600 text-center tracking-tight flex items-center justify-center gap-2">          
          Detalhes Comparativos
        </h4>
        <div className="flex flex-col gap-2">
          {[
            ["Título", base.title, compare.title],
            ["Localização", base.endereco, compare.endereco],
            ["Quartos", base.bedrooms, compare.bedrooms],
            ["Tamanho", base.size, compare.size],
            ["Preço", base.price, compare.price],
            ["Status", base.status, compare.status],
          ].map(([label, val1, val2], idx) => {
            const isDiff = val1 !== val2;
            return (
              <div
                key={label as string}
                className="flex flex-col md:flex-row items-stretch bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
              >
                <div className="md:w-1/4 flex items-center justify-between md:justify-center bg-gray-50 px-4 py-3 font-semibold text-gray-600 text-base md:text-lg">
                  <span>{label}</span>
                  {isDiff && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-400 font-semibold border border-gray-200">diferença</span>
                  )}
                </div>
                <div className="md:w-3/4 flex flex-row">
                  <div className={`w-1/2 px-4 py-3 text-center font-medium ${isDiff ? "bg-gray-100 text-gray-700" : "text-gray-600"}`}>
                    {val1 as string}
                  </div>
                  <div className={`w-1/2 px-4 py-3 text-center font-medium ${isDiff ? "bg-gray-100 text-gray-700" : "text-gray-600"}`}>
                    {val2 as string}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
