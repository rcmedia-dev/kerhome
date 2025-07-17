'use client';

import { getCidadesDisponiveis } from '@/lib/actions/get-cideades-disponiveis';
import React, { useEffect, useState } from 'react';

interface Cidade {
  nome: string;
  quantidade: number;
}

export function CidadesDisponiveis() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCidades() {
      const data = await getCidadesDisponiveis();
      setCidades(data);
      setLoading(false);
    }

    fetchCidades();
  }, []);

  return (
    <div className="bg-white border shadow-md rounded-2xl p-6 space-y-2">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Cidades com imóveis
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <ul className="text-sm text-gray-700 space-y-1">
          {cidades.map((cidade) => (
            <li key={cidade.nome}>
              {cidade.nome} ({cidade.quantidade})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
