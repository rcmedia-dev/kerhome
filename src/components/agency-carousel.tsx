'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { CheckCircle2, ChevronLeft, ChevronRight, ArrowRight, VerifiedIcon, Sparkles } from 'lucide-react';
import { Imobiliaria } from '@/lib/types/imobiliaria';
import { motion, Variants, Transition } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface AgencyCarouselProps {
  agencies: Imobiliaria[];
}

// Configurações de transição constantes para harmonia (Coerente com Corretores)
const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20
};

const fastSpringTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 10
};

// Variantes de animação idênticas aos Corretores
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: { opacity: 1, scale: 1, rotate: 0 }
};

const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0, rotateY: 0 },
  hover: {
    scale: 1.02,
    y: -8,
    rotateY: 2,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

const logoHoverVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 }
};

const iconVariants: Variants = {
  rest: { x: 0 },
  hover: {
    x: 4,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const backgroundVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 0.1,
    scale: 1,
    transition: { duration: 3, repeat: Infinity, repeatType: "reverse" }
  }
};

export default function AgencyCarousel({ agencies }: AgencyCarouselProps) {
  if (!agencies || agencies.length === 0) return null;

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
    >
      {/* Elementos decorativos animados para combinar com Corretores */}
      <motion.div
        variants={backgroundVariants}
        className="absolute top-10 right-10 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      ></motion.div>
      <motion.div
        variants={backgroundVariants}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-10 w-80 h-80 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      ></motion.div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header Elegante Unificado */}
        <motion.div 
          variants={headerVariants}
          transition={{ ...springTransition, duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ ...springTransition, stiffness: 150, damping: 15 }}
            className="inline-flex items-center justify-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 mb-4"
          >
            <VerifiedIcon className="w-4 h-4 text-[#6D28D9]" />
            <span className="text-sm font-medium text-gray-700">Agências Verificadas</span>
          </motion.div>
          <motion.h2 
            variants={headerVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Agências de <span className="text-[#6D28D9]">Confiança</span>
          </motion.h2>
          <motion.p
            variants={headerVariants}
            transition={{ ...springTransition, duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
           Onde a seriedade imobiliária de Angola se encontra.
          </motion.p>
        </motion.div>

        <div className="relative group/agency-slider">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: '.swiper-prev-agency',
              nextEl: '.swiper-next-agency',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-agency',
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
              1280: { slidesPerView: 4, spaceBetween: 30 },
            }}
            className="pb-16 !px-4"
          >
            {agencies.map((agency) => (
              <SwiperSlide key={agency.id} className="h-auto pb-4">
                <motion.div
                  variants={itemVariants}
                  initial="rest"
                  whileHover="hover"
                  transition={{ ...springTransition, duration: 0.6 }}
                  className="group relative h-full"
                >
                  <motion.div
                    variants={cardHoverVariants}
                    transition={fastSpringTransition}
                    className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col overflow-hidden"
                  >
                    {/* Barra Superior Decorativa (Unificação) */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-purple-50 to-purple-100 opacity-60"></div>

                    {/* Logo (Avatar Style) */}
                    <div className="relative z-10 mx-auto mb-4 -mt-4">
                      <div className="relative">
                        <motion.div
                          variants={logoHoverVariants}
                          className="relative w-20 h-20 bg-white rounded-2xl overflow-hidden border-4 border-white shadow-lg p-3"
                        >
                          <Image
                            src={agency.logo || '/logo-placeholder.png'}
                            alt={agency.nome}
                            fill
                            className="object-contain p-2"
                            unoptimized={true}
                          />
                        </motion.div>
                      </div>
                      {agency.verificada && (
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#6D28D9] fill-[#6D28D9] text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Conteúdo Centralizado (Unificação) */}
                    <div className="text-center flex-1 relative z-10 flex flex-col items-center justify-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#6D28D9] transition-colors leading-tight line-clamp-2 h-[48px] flex items-center justify-center">
                        {agency.nome}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-gray-500 mb-6 p-2 bg-gray-50 rounded-lg w-full text-xs font-black uppercase tracking-widest">
                        <span>{agency.cidade}</span>
                      </div>
                    </div>

                    {/* Botão Unificado c/ Corretores */}
                    <div className="relative z-10">
                      <Link href={`/imobiliaria/${agency.slug}`}>
                        <motion.button
                          whileHover={{ scale: 1.05, x: 2 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-2.5 px-4 bg-[#6D28D9] text-white font-semibold rounded-xl hover:bg-purple-800 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md"
                        >
                          <Sparkles className="w-4 h-4" />
                          Ver Perfil
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows (Unificada: Side & Circular) */}
          <div className="hidden lg:block">
            <button className="swiper-prev-agency absolute top-1/2 -left-12 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all z-20">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="swiper-next-agency absolute top-1/2 -right-12 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all z-20">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Pagination */}
          <div className="swiper-pagination-agency flex justify-center gap-2 mt-4"></div>
        </div>

        {/* Explorar Todas (Botão unificado com Propriedades) */}
        <motion.div 
          className="flex justify-center mt-12"
          variants={buttonVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...springTransition, delay: 0.5 }}
        >
          <Link href="/imobiliarias">
            <motion.button
              whileHover="hover"
              whileTap="tap"
              className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-200 transition-all duration-500"
            >
              <span className="relative z-10 flex items-center gap-3">
                Explorar Todas Agências
                <motion.span variants={iconVariants}>
                   <ArrowRight className="w-5 h-5 relative z-10" />
                </motion.span>
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <style jsx global>{`
        .swiper-pagination-agency .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #6D28D9;
          opacity: 0.2;
          transition: all 0.3s ease;
        }
        .swiper-pagination-agency .swiper-pagination-bullet-active {
          opacity: 1;
          width: 20px;
          border-radius: 4px;
          background: #6D28D9;
        }
      `}</style>
    </motion.section>
  );
}

