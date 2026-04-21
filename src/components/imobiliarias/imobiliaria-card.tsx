'use client';

import { MapPin, Building, CheckCircle2, ShieldAlert, BadgeCheck, ArrowRight, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Imobiliaria } from '@/lib/types/imobiliaria';

interface ImobiliariaCardProps {
  imobiliaria: Imobiliaria & { properties?: { length: number } | any[] };
}

export function ImobiliariaCard({ imobiliaria }: ImobiliariaCardProps) {
  // Garantir contagem correta (prioridade para propertyCount, depois _count_imoveis, depois o array original)
  const count = imobiliaria.total_imoveis ?? imobiliaria.propertyCount ?? (imobiliaria as any)._count_imoveis ?? (Array.isArray(imobiliaria.properties) ? imobiliaria.properties.length : 0);

  return (
    <div className="group relative w-full bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden border border-gray-100 pb-2 h-full">

      {/* IMAGEM (LOGO CONTAINER) */}
      <div className="relative h-[250px] w-full bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center p-8">
        <Link href={`/imobiliaria/${imobiliaria.slug}`} className="absolute inset-0 z-10" />

        {imobiliaria.logo ? (
          <div className="relative w-full h-full">
            <Image
              src={imobiliaria.logo}
              alt={imobiliaria.nome}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain transition-transform duration-700 group-hover:scale-110"
              unoptimized={true}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <Building className="w-20 h-20 mb-2 opacity-20" />
            <span className="text-xs font-black uppercase tracking-widest opacity-40">Sem Logo</span>
          </div>
        )}

        {/* Badges - Top Left */}
        <div className="absolute top-4 left-4 z-20">
          {imobiliaria.verificada ? (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6D28D9]/90 backdrop-blur-md shadow-lg border border-white/20" title="Agência Verificada">
              <BadgeCheck className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-700/60 backdrop-blur-md text-white text-[10px] font-medium shadow-md border border-white/10">
              Parceira
            </div>
          )}
        </div>
      </div>

      {/* INFO CONTENT */}
      <div className="flex-1 px-6 pt-6 pb-5 flex flex-col relative">

        {/* Location Row */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1.5">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="line-clamp-1">
            {imobiliaria.cidade}{imobiliaria.bairro ? ` • ${imobiliaria.bairro}` : ''}
          </span>
        </div>

        {/* Title (Nome da Imobiliária) */}
        <h3 className="text-xl font-bold text-[#1A1A1A] leading-tight line-clamp-2 mb-3 h-[50px] overflow-hidden group-hover:text-purple-700 transition-colors" title={imobiliaria.nome}>
          <Link href={`/imobiliaria/${imobiliaria.slug}`}>
            {imobiliaria.nome}
          </Link>
        </h3>

        {/* Stats Row - Justify Between */}
        <div className="flex items-center justify-between text-gray-600 text-sm mb-2 border-b border-gray-50 pb-2">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{count} {count === 1 ? 'Imóvel' : 'Imóveis'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            Portfolio Completo
          </div>
        </div>

        {/* Description Snippet */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          Especialistas em consultoria imobiliária no mercado de {imobiliaria.cidade}. Encontre o seu lar com segurança.
        </p>

        {/* Button - Expanded to match Property Card exactly */}
        <div className="pt-4 mt-auto border-t border-gray-100">
          <Link
            href={`/imobiliaria/${imobiliaria.slug}`}
            className="w-full bg-[#820AD1] hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
          >
            <span>Ver Perfil</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>

      </div>
    </div>
  );
}

