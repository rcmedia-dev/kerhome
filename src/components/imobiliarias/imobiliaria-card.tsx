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
              className="object-contain transition-transform duration-700 group-hover:scale-110"
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
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/90 backdrop-blur-md text-white text-xs font-black shadow-lg border border-white/20 uppercase tracking-wider">
              <BadgeCheck className="w-4 h-4" />
              Verificada
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-700/60 backdrop-blur-md text-white text-[10px] font-black shadow-md border border-white/10 uppercase tracking-widest">
              Agência Parceira
            </div>
          )}
        </div>
      </div>

      {/* INFO CONTENT */}
      <div className="flex-1 px-6 pt-6 pb-5 flex flex-col relative">
        
        {/* Location Row */}
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2 font-medium">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="line-clamp-1">
            {imobiliaria.cidade} {imobiliaria.bairro ? `• ${imobiliaria.bairro}` : ''}
          </span>
        </div>

        {/* Title (Nome da Imobiliária) */}
        <h3 className="text-2xl font-black text-[#1A1A1A] leading-tight line-clamp-1 mb-4 h-[32px] overflow-hidden group-hover:text-purple-700 transition-colors" title={imobiliaria.nome}>
          <Link href={`/imobiliaria/${imobiliaria.slug}`}>
            {imobiliaria.nome}
          </Link>
        </h3>

        {/* Stats Row - Justify Between */}
        <div className="flex items-center justify-between text-gray-600 text-sm mb-4 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Home className="w-4 h-4 text-orange-600" />
            </div>
            <span className="font-black text-gray-900">{count} {count === 1 ? 'Imóvel' : 'Imóveis'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
            Full Portfolio
          </div>
        </div>

        {/* Description Snippet (Optional but mimics Property stats area) */}
        <p className="text-gray-400 text-xs mb-6 line-clamp-2 leading-relaxed font-medium">
          Especialistas em consultoria imobiliária no mercado de {imobiliaria.cidade}. Encontre o seu lar com segurança.
        </p>

        {/* Button - Redesigned to match Property Card exactly */}
        <Link
          href={`/imobiliaria/${imobiliaria.slug}`}
          className="group/btn w-full bg-[#820AD1] hover:bg-orange-500 text-white font-black py-4 rounded-2xl text-center transition-all duration-500 shadow-xl shadow-purple-500/10 hover:shadow-orange-500/20 text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-auto"
        >
          Ver Perfil
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>

      </div>
    </div>
  );
}

