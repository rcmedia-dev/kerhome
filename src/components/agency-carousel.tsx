'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { CheckCircle2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Imobiliaria } from '@/lib/types/imobiliaria';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface AgencyCarouselProps {
  agencies: Imobiliaria[];
}

export default function AgencyCarousel({ agencies }: AgencyCarouselProps) {
  if (!agencies || agencies.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16 gap-6 relative">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Agências de <span className="text-[#820AD1]">Confiança</span>
            </h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">As melhores imobiliárias de Angola em um só lugar.</p>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 w-full hidden xl:flex justify-between pointer-events-none px-4">
            {/* Buttons moved relative to section or hidden if preferred centered header */}
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button className="swiper-prev-agency w-12 h-12 rounded-full border-2 border-[#820AD1] flex items-center justify-center text-[#820AD1] hover:bg-[#820AD1] hover:text-white transition-all duration-300 shadow-lg shadow-purple-100 pointer-events-auto">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="swiper-next-agency w-12 h-12 rounded-full border-2 border-[#820AD1] flex items-center justify-center text-[#820AD1] hover:bg-[#820AD1] hover:text-white transition-all duration-300 shadow-lg shadow-purple-100 pointer-events-auto">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          navigation={{
            prevEl: '.swiper-prev-agency',
            nextEl: '.swiper-next-agency',
          }}
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="pb-16"
        >
          {agencies.map((agency) => (
            <SwiperSlide key={agency.id}>
              <Link href={`/imobiliaria/${agency.slug}`} className="block group h-full">
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-8 h-full flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:shadow-purple-200/50 hover:-translate-y-2 relative overflow-hidden">
                  {/* Decorative Gradient */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-purple-500/10 transition-colors"></div>

                  {/* Logo Container */}
                  <div className="relative w-32 h-32 mb-6 bg-white rounded-3xl p-4 shadow-xl shadow-gray-100 border border-gray-50 group-hover:scale-105 transition-transform duration-700">
                    <Image
                      src={agency.logo || '/logo-placeholder.png'}
                      alt={agency.nome}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col items-center">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-[#820AD1] transition-colors line-clamp-1 mb-2">
                      {agency.nome}
                    </h3>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                        {agency.cidade}
                      </span>
                      {agency.verificada && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6D28D9] text-[10px] font-black uppercase tracking-widest border border-purple-100">
                          <CheckCircle2 className="w-3 h-3 fill-[#6D28D9] text-white" />
                          Verificada
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Hint - Always Visible Orange Button Centered */}
                  <div className="mt-auto w-full flex justify-center">
                    <div className="bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 shadow-md">
                      Ver Perfil
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Explorar Todas Button */}
        <div className="flex justify-center mt-12">
          <Link
            href="/imobiliarias"
            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-[#6D28D9] text-white font-black uppercase tracking-widest text-sm hover:bg-purple-800 transition-all duration-500 shadow-xl shadow-purple-200"
          >
            <span className="relative z-10">Explorar Todas Agências</span>
            <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-agency .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #820AD1;
          opacity: 0.2;
        }
        .swiper-pagination-agency .swiper-pagination-bullet-active {
          opacity: 1;
          width: 24px;
          border-radius: 5px;
        }
      `}</style>
    </section>
  );
}

