'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getLimitedProperties } from '@/lib/actions/get-properties';

export function ImoveisDestaque() {
  const [imoveis, setImoveis] = useState<TPropertyResponseSchema[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getLimitedProperties(4);
      console.log('Imóveis destacados:', data);
      setImoveis(data);
    }

    fetchData();
  }, []);

  if (imoveis.length === 0) return null;

  return (
    <div className="bg-white border shadow-md rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Imóveis em destaque
      </h3>
      <div className="space-y-4">
        {imoveis.map((imovel) => {
          const destino =
            imovel.status === 'para alugar'
              ? `/alugar/${imovel.id}`
              : `/comprar/${imovel.id}`;

          return (
            <Link
              href={destino}
              key={imovel.id}
              className="block border border-orange-500 rounded-lg overflow-hidden shadow hover:shadow-md transition"
            >
              <div className="w-full h-32 relative">
                <Image
                  src={imovel.gallery[0]}
                  alt={imovel.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <h4 className="text-sm font-semibold text-gray-800">{imovel.title}</h4>
                <p className="text-xs text-gray-500">
                  {imovel.cidade || 'Localização não informada'}
                </p>
                <p className="text-sm font-bold text-orange-500 mt-1">
                  {imovel.price?.toLocaleString()} {imovel.unidade_preco}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
