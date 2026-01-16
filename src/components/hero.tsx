'use client'

import useEmblaCarousel from "embla-carousel-react";
import { BedDouble, Maximize } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';

type HeroCarouselProps = {
  property: any
}

// Função para formatar números com máscara de pontos
const formatPrice = (price: number | string) => {
  return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

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

export default function HeroCarousel({ property }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Sincronizar o índice do slide com os dots
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
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

  // Estado para controlar a animação de entrada (Headline -> Cards)
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Timer para alternar da Headline para os Cards após 4 segundos
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[85vh] w-full overflow-hidden"
    >
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {property.map((property: any, i: any) => (
            <div
              className="embla__slide relative min-w-full h-full"
              key={i}
            >
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 8,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "reverse"
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
              </motion.div>

              {/* Property Info (Center) - Só aparece APÓS a intro */}
              <AnimatePresence>
                {!showIntro && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-lg w-full z-10 px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.6 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-8 rounded-3xl text-white shadow-2xl text-center"
                    >
                      <h3 className="text-lg md:text-3xl font-bold mb-2 md:mb-3 drop-shadow-md">{property.title}</h3>
                      <p className="text-sm md:text-lg text-gray-100 mb-4 md:mb-6 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
                        {property.endereco}
                      </p>
                      <div className="flex flex-row justify-center gap-2 md:gap-6 text-xs md:text-base font-medium">
                        <span className="flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-1 md:py-2 rounded-full">
                          <BedDouble size={16} className="text-orange-400" /> {property.bedrooms} Quarto{property.bedrooms > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-1 md:py-2 rounded-full">
                          <Maximize size={16} className="text-orange-400" /> {property.size}m
                        </span>
                        <span className="flex items-center justify-center gap-1 md:gap-2 bg-orange-600/90 px-3 md:px-4 py-1 md:py-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors">
                          {formatPrice(property.price)}
                        </span>
                      </div>
                      <Link href={`/propriedades/${property.id}`}>
                        <button className="mt-4 md:mt-8 w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-2 md:py-3 text-sm md:text-base rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                          Ver Detalhes Completos
                        </button>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Main Hero Content (Headline) - Só aparece DURANTE a intro */}
      <AnimatePresence>
        {showIntro && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-4xl text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-200 text-sm font-medium mb-4 backdrop-blur-sm">
                  #1 Imobiliária em Angola
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                  Encontre o Lar <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                    Dos Seus Sonhos
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 font-light drop-shadow-md">
                  Milhares de propriedades exclusivas esperando por você. Compre, venda ou arrende com total segurança.
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

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
            animate={{
              backgroundColor: index === selectedIndex ? '#f97316' : 'rgba(255, 255, 255, 0.5)',
              scale: index === selectedIndex ? 1.2 : 1
            }}
            transition={springTransition}
            className="w-3 h-3 rounded-full transition-colors"
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