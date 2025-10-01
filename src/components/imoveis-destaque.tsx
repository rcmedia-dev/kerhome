'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getLimitedProperties } from '@/lib/actions/get-properties';

export default function ImoveisSemelhantes() {
  const [imoveis, setImoveis] = useState<TPropertyResponseSchema[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getLimitedProperties(4);
      setImoveis(data);
    }

    fetchData();
  }, []);

  if (imoveis.length === 0) return null;

  return (
    <div className="bg-white border shadow-md rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Imóveis Semelhantes
      </h3>
      <div className="space-y-4">
        {imoveis.map((imovel) => {
          return (
            <Link
              href={`/propriedades/${imovel.id}`}
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
                    {imovel.price &&
                      imovel.price.toLocaleString(
                        imovel.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                    {imovel.unidade_preco &&
                      (imovel.unidade_preco === "kwanza"
                        ? "KZ"
                        : imovel.unidade_preco === "dolar"
                        ? "USD"
                        : imovel.unidade_preco)}
                </p>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
