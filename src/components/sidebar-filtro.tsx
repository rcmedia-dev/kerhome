'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PropertyFilterSidebar() {
  const [status, setStatus] = useState('');
  const [tipo, setTipo] = useState('');
  const [banhos, setBanhos] = useState('');
  const [quartos, setQuartos] = useState('');
  const [garagens, setGaragens] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [tamanhoMin, setTamanhoMin] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (status) params.set('status', status);
    if (tipo) params.set('tipo', tipo);
    if (banhos) params.set('banheiros', banhos);
    if (quartos) params.set('quartos', quartos);
    if (garagens) params.set('garagens', garagens);
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
