'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getLimitedProperties } from '@/lib/functions/get-properties';

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
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">
        Imóveis Semelhantes
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {imoveis.map((imovel) => {
          return (
            <Link
              href={`/propriedades/${imovel.id}`}
              key={imovel.id}
              className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="w-full h-32 relative overflow-hidden">
                <Image
                  src={imovel.gallery[0]}
                  alt={imovel.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">{imovel.title}</h4>
                <p className="text-[10px] text-gray-500 line-clamp-1 mb-1">
                  {imovel.cidade || 'Localização não informada'}
                </p>
                <p className="text-xs font-bold text-orange-500">
                  {imovel.price &&
                    imovel.price.toLocaleString(
                      imovel.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
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
