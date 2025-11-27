'use client'

import useEmblaCarousel from "embla-carousel-react";
import { BedDouble, Ruler, Tag } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useCallback, useEffect } from "react";
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';

type HeroCarouselProps = {
    property: any
}

// Configurações de transição reutilizáveis
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

// Transições específicas para cada elemento
const contentTransition: Transition = {
    ...springTransition,
    delay: 0.3,
    duration: 0.7
};

const titleTransition: Transition = {
    ...springTransition,
    delay: 0.5,
    stiffness: 120,
    damping: 15
};

const subtitleTransition: Transition = {
    ...springTransition,
    delay: 0.6,
    stiffness: 120,
    damping: 15
};

const featuresTransition: Transition = {
    ...springTransition,
    delay: 0.7,
    stiffness: 120,
    damping: 15
};

const buttonTransition: Transition = {
    ...springTransition,
    delay: 0.8,
    stiffness: 150,
    damping: 10
};

const navigationTransition: Transition = {
    delay: 1
};

export default function HeroCarousel( {property}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const interval = setInterval(() => {
      scrollNext();
    }, 5000); // muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [scrollNext]);

  // Variantes de animação com tipos corretos
  const contentVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0
    })
  };

  const buttonVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8 
    },
    visible: {
      opacity: 1,
      scale: 1
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#ea580c"
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[85vh] w-full overflow-hidden"
    >
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {property.map((property:any, i: any) => (
            <div
              className="embla__slide relative min-w-full h-full"
              key={i}
            >
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 1.2,
                  ease: "easeOut"
                }}
                className="relative w-full h-full"
              >
                <Image
                  src={property.image ?? '/house.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="absolute inset-0 bg-black/40" 
                />
              </motion.div>

              <div className="absolute inset-0 flex items-center justify-center px-4">
                <motion.div 
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  transition={contentTransition}
                  className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-6 md:px-8 md:py-8 text-white w-full max-w-xl text-center shadow-xl border border-white/10"
                >
                  <motion.h2 
                    variants={itemVariants}
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    transition={titleTransition}
                    className="text-2xl md:text-4xl font-bold"
                  >
                    {property.title}
                  </motion.h2>
                  
                  <motion.p 
                    variants={itemVariants}
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    transition={subtitleTransition}
                    className="text-xs md:text-sm text-gray-100 mt-2 mb-4"
                  >
                    {property.endereco}
                  </motion.p>

                  <motion.div 
                    variants={itemVariants}
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    transition={featuresTransition}
                    className="flex flex-wrap justify-center gap-4 text-xs md:text-sm mb-4"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      transition={springTransition}
                      className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
                    >
                      <BedDouble className="w-4 h-4 md:w-5 md:h-5" /> 
                      {property.bedrooms} Quartos
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      transition={springTransition}
                      className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
                    >
                      <Ruler className="w-4 h-4 md:w-5 md:h-5" /> 
                      {property.size}
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      transition={springTransition}
                      className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
                    >
                      <Tag className="w-4 h-4 md:w-5 md:h-5" /> 
                      {property.price}
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants} 
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    transition={featuresTransition}
                  >
                    <Link
                      href={`/propriedades/${property.id}`}
                    >
                      <motion.button
                        variants={buttonVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                        transition={buttonTransition}
                        className="mt-3 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg text-white font-medium transition shadow-lg"
                      >
                        Ver detalhes
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de slide */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={navigationTransition}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2"
      >
        {property.map((_: any, index: number) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={springTransition}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === 0 ? 'bg-orange-500' : 'bg-white/50'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </motion.div>

      {/* Botões de navegação */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={navigationTransition}
        whileHover={{ 
          scale: 1.1, 
          backgroundColor: "rgba(255,255,255,0.2)" 
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/20 transition-all"
        aria-label="Slide anterior"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={navigationTransition}
        whileHover={{ 
          scale: 1.1, 
          backgroundColor: "rgba(255,255,255,0.2)" 
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/20 transition-all"
        aria-label="Próximo slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </motion.section>
  );
}