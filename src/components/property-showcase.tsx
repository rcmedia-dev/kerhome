'use client'

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Link from "next/link";
import { TPropertyResponseSchema } from '@/lib/types/property';
import { PropertyCard } from '@/components/property-card';
import { motion, Variants, Transition } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

type PropertiesShowCaseProps = {
  property: TPropertyResponseSchema[];
  inline?: boolean;
};

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
      staggerChildren: 0.1
    }
  }
};

const headerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30 
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
    y: -10 
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0
  }
};

const titleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

const descriptionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 15 
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

const propertyCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
};

const buttonVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95
  }
};

const iconVariants: Variants = {
  rest: {
    x: 0
  },
  hover: {
    x: 4,
    transition: {
      type: "spring",
      stiffness: 400,
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
    opacity: 1,
    scale: 1,
    transition: {
      duration: 2,
      ease: "easeOut"
    }
  }
};

export default function PropertiesShowcase({ property, inline }: PropertiesShowCaseProps) {
  // limitar a exibição para no máximo 8 imóveis (2 linhas de 4 colunas)
  const limitedProperties = property.slice(0, 8);

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      className="relative py-16 lg:px-10 bg-gradient-to-br from-slate-50 via-white to-orange-50/30"
    >
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          variants={backgroundVariants}
          className="absolute -top-20 -right-20 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"
        ></motion.div>
        <motion.div 
          variants={backgroundVariants}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"
        ></motion.div>
        <motion.div 
          variants={backgroundVariants}
          transition={{ delay: 0.6 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <motion.div 
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{
          ...springTransition,
          duration: 0.8
        }}
        className="relative flex flex-col justify-center items-center text-center mb-12"
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4"
        >
          <motion.span 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-2 h-2 bg-orange-500 rounded-full"
          ></motion.span>
          Propriedades Selecionadas
        </motion.div>
        
        <motion.h2 
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{
            ...springTransition,
            duration: 0.8,
            delay: 0.1
          }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4"
        >
          Sua Próxima <span className="text-orange-500">Casa</span>
        </motion.h2>
        
        <motion.p 
          variants={descriptionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{
            ...springTransition,
            duration: 0.8,
            delay: 0.2
          }}
          className="text-gray-600 text-lg max-w-2xl leading-relaxed"
        >
          Descobre as melhores oportunidades imobiliárias com a KerCasa. 
          <span className="block text-gray-500 text-base mt-1">
            Qualidade e confiança em cada detalhe
          </span>
        </motion.p>
      </motion.div>

      <div className="relative mx-auto w-full max-w-[1400px]">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1.2}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            reverseDirection: true
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-properties',
          }}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2.2, spaceBetween: 25 },
            1024: { slidesPerView: 3.2, spaceBetween: 30 },
            1280: { slidesPerView: 3.5, spaceBetween: 30 },
          }}
          className="pb-20 !px-4"
        >
          {limitedProperties.map((property, index) => (
            <SwiperSlide key={property.id} className="h-full">
              <motion.div 
                variants={propertyCardVariants}
                transition={{
                  ...springTransition,
                  delay: index * 0.1,
                  duration: 0.6
                }}
                className="h-full mb-2"
                whileHover={{
                  y: -5,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
              >
                <PropertyCard property={property} />
              </motion.div>
            </SwiperSlide>
          ))}
          
          {/* Custom Pagination Container */}
          <div className="swiper-pagination-properties flex justify-center gap-2 mt-8"></div>
        </Swiper>
      </div>

      {/* Botão "Ver mais propriedades" */}
      <motion.div 
        variants={buttonVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{
          ...springTransition,
          delay: 0.8,
          duration: 0.6
        }}
        className="relative flex justify-center mt-12"
      >
        <Link
          href="/propriedades"
        >
          <motion.button
            variants={buttonVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            whileTap="tap"
            transition={{
              ...springTransition,
              delay: 0.8
            }}
            className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-orange-500/25"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explorar Todas as Propriedades
              <motion.span variants={iconVariants}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.span>
            </span>
            
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
        </Link>
      </motion.div>

      {/* Elemento decorativo inferior */}
      <motion.div 
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative mt-16 flex justify-center"
      >
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </motion.div>

      {/* Estilos customizados para a paginação laranja */}
      <style jsx global>{`
        .swiper-pagination-properties .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #f97316;
          opacity: 0.2;
          transition: all 0.3s ease;
        }
        .swiper-pagination-properties .swiper-pagination-bullet-active {
          opacity: 1;
          width: 28px;
          border-radius: 5px;
          background: #f97316;
        }
      `}</style>
    </motion.section>
  );
}
