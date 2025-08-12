'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TPropertyResponseSchema } from '@/lib/types/property';


export function PropertyFilterSidebar({ property }: { property: TPropertyResponseSchema }) {
  const [status, setStatus] = useState(property.status || '');
  const [tipo, setTipo] = useState(property.tipo || '');
  const [banhos, setBanhos] = useState(property.bathrooms?.toString() || '');
  const [quartos, setQuartos] = useState(property.bedrooms?.toString() || '');
  const [garagens, setGaragens] = useState(property.garagens?.toString() || '');
  const [precoMax, setPrecoMax] = useState(property.price?.toString() || '');
  const [tamanhoMin, setTamanhoMin] = useState(property.size?.toString() || '');
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();

    // Inclui o título do imóvel
    if (property.title) params.set('titulo', property.title);

    if (property.status) params.set('status', status);
    if (property.tipo) params.set('tipo', tipo);
    if (property.bathrooms) params.set('banheiros', banhos);
    if (property.bedrooms) params.set('quartos', quartos);
    if (property.garagens) params.set('garagens', garagens);
    if (precoMax) params.set('preco_max', precoMax);
    if (tamanhoMin) params.set('tamanho_min', tamanhoMin);

    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="bg-white border shadow-md rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Filtrar imóveis</h3>

      <select
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Status</option>
        <option value="para alugar">Para alugar</option>
        <option value="para comprar">Para comprar</option>
      </select>

      <input
        type="text"
        placeholder="Tipo de imóvel"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      />

      <input
        type="number"
        placeholder="Nº de banhos"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={banhos}
        onChange={(e) => setBanhos(e.target.value)}
      />

      <input
        type="number"
        placeholder="Nº de quartos"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={quartos}
        onChange={(e) => setQuartos(e.target.value)}
      />

      <input
        type="number"
        placeholder="Nº de garagens"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={garagens}
        onChange={(e) => setGaragens(e.target.value)}
      />

      <input
        type="number"
        placeholder="Preço máximo"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={precoMax}
        onChange={(e) => setPrecoMax(e.target.value)}
      />

      <input
        type="number"
        placeholder="Tamanho mínimo (m²)"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={tamanhoMin}
        onChange={(e) => setTamanhoMin(e.target.value)}
      />

      <button
        onClick={handleSearch}
        className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition"
      >
        Buscar
      </button>
    </div>
  );
}
