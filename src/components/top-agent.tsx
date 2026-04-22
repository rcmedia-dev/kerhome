'use client'

import { VerifiedIcon, Mail, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export interface Agent {
  id: string;
  avatar_url?: string | null;
  created_at: string;
  email: string;
  empresa?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  last_seen_at?: string | null;
  licenca?: string | null;
  linkedin?: string | null;
  pacote_agente_id?: string | null;
  primeiro_nome: string;
  ultimo_nome: string;
  role: "agent" | "admin" | "user" | string;
  sobre_mim?: string | null;
  status: "active" | "inactive" | "pending" | string;
  telefone?: string | null;
  updated_at?: string;
  username?: string | null;
  website?: string | null;
  youtube?: string | null;
  properties?: any[];
}

type TopAgentsSectionProps = {
  agents: Agent[];
  className?: string;
}

// Configurações de transição
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

// Variantes de animação
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
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -5
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0
  }
};

const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    rotateY: 0
  },
  hover: {
    scale: 1.02,
    y: -8,
    rotateY: 2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const avatarHoverVariants: Variants = {
  rest: {
    scale: 1,
    rotate: 0
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const buttonHoverVariants: Variants = {
  rest: {
    scale: 1,
    x: 0
  },
  hover: {
    scale: 1.05,
    x: 2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const iconHoverVariants: Variants = {
  rest: {
    scale: 1,
    rotate: 0
  },
  hover: {
    scale: 1.2,
    rotate: 15,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 10
    }
  }
};

const backgroundVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 0.1,
    scale: 1,
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

export default function TopAgentsSection({ agents, className }: TopAgentsSectionProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  // Filtrar agentes para o carrossel (todos os agentes fornecidos)

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      className={className || "py-10 md:py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"}
    >
      {/* Elementos decorativos animados */}
      <motion.div
        variants={backgroundVariants}
        className="absolute top-10 right-10 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      ></motion.div>
      <motion.div
        variants={backgroundVariants}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-10 w-80 h-80 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      ></motion.div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header elegante */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{
            ...springTransition,
            duration: 0.8
          }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{
              ...springTransition,
              stiffness: 150,
              damping: 15
            }}
            className="inline-flex items-center justify-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 mb-4"
          >
            <VerifiedIcon className="w-4 h-4 text-[#6D28D9]" />
            <span className="text-sm font-medium text-gray-700">Agentes Verificados</span>
          </motion.div>
          <motion.h2
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{
              ...springTransition,
              duration: 0.8,
              delay: 0.1
            }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Nossos <span className="text-[#6D28D9]">Corretores</span>
          </motion.h2>
          <motion.p
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{
              ...springTransition,
              duration: 0.8,
              delay: 0.2
            }}
            className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Profissionais qualificados com amplo portfólio de imóveis
          </motion.p>
        </motion.div>

        {/* Carrossel de Corretores */}
        <div className="relative group">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            centeredSlides={false}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              reverseDirection: false
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-agents',
            }}
            navigation={{
              prevEl: '.swiper-prev-agents',
              nextEl: '.swiper-next-agents',
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
              1280: { slidesPerView: 4, spaceBetween: 30 },
            }}
            className="pb-16 !px-4"
          >
            {agents.map((agent) => (
              <SwiperSlide key={agent.id} className="h-auto pb-4">
                <motion.div
                  variants={itemVariants}
                  initial="rest"
                  whileHover="hover"
                  transition={{
                    ...springTransition,
                    duration: 0.6
                  }}
                  className="group relative h-full"
                  onMouseEnter={() => setHoveredAgent(agent.id)}
                  onMouseLeave={() => setHoveredAgent(null)}
                >
                  <motion.div
                    variants={cardHoverVariants}
                    transition={fastSpringTransition}
                    className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col overflow-hidden"
                  >
                    {/* Header do card */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-purple-50 to-purple-100 opacity-60"></div>

                    {/* Avatar */}
                    <div className="relative z-10 mx-auto mb-4 -mt-4">
                      <div className="relative">
                        <motion.div
                          variants={avatarHoverVariants}
                          className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center bg-gray-100"
                        >
                          {agent.avatar_url ? (
                            <Image
                              src={agent.avatar_url}
                              alt={`${agent.primeiro_nome} ${agent.ultimo_nome}`}
                              fill
                              className="object-cover"
                              unoptimized={true}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#6D28D9] to-purple-800 flex items-center justify-center">
                              <span className="text-white text-xl font-black uppercase">
                                {agent.primeiro_nome?.[0]}{agent.ultimo_nome?.[0]}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border"
                      >
                        <VerifiedIcon className="w-4 h-4 text-[#6D28D9]" />
                      </motion.div>
                    </div>

                    {/* Conteúdo */}
                    <div className="text-center flex-1 relative z-10 flex flex-col items-center justify-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#6D28D9] transition-colors">
                        {agent.primeiro_nome} {agent.ultimo_nome}
                      </h3>
                      {agent.email && (
                        <div className="flex items-center justify-center gap-2 text-gray-500 mb-6 p-2 bg-gray-50 rounded-lg w-full text-xs truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{agent.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Botão formatado rounded-xl */}
                    <div className="relative z-10">
                      <Link href={`/agente/${agent.id}`}>
                        <motion.button
                          variants={buttonHoverVariants}
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

          {/* Navigation Arrows (Circular as per request) */}
          <div className="hidden lg:block">
            <button className="swiper-prev-agents absolute top-1/2 -left-12 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all z-20">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="swiper-next-agents absolute top-1/2 -right-12 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all z-20">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Pagination */}
          <div className="swiper-pagination-agents flex justify-center gap-2 mt-4"></div>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-agents .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #6D28D9;
          opacity: 0.2;
        }
        .swiper-pagination-agents .swiper-pagination-bullet-active {
          opacity: 1;
          width: 20px;
          border-radius: 4px;
        }
      `}</style>
    </motion.section>
  );
}
