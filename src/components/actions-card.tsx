'use client';

import { BadgeDollarSign, HandCoins, KeyRound, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { AuthDialog } from "@/components/login-modal";
import { useUserStore } from "@/lib/store/user-store";
import { motion, Variants, Transition } from 'framer-motion';

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

// Variantes de animação com tipos corretos
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9
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
    rotate: -10
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
    y: 0
  },
  hover: {
    scale: 1.05,
    y: -5
  }
};

const buttonHoverVariants: Variants = {
  rest: {
    scale: 1,
    x: 0
  },
  hover: {
    scale: 1.05,
    x: 2
  }
};

const iconVariants: Variants = {
  rest: {
    x: 0
  },
  hover: {
    x: 4
  }
};

export default function ActionCardsSection() {
  const { user } = useUserStore();
  const authDialogRef = useRef<any>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleVenderClick = () => {
    if (user) {
      window.location.href = '/dashboard/cadastrar-imovel';
    } else {
      authDialogRef.current?.open();
    }
  };

  const actions = [
    {
      title: 'Comprar casa',
      description: 'Encontre a casa perfeita para você e sua família com segurança e facilidade.',
      button: 'Explorar imóveis',
      icon: <BadgeDollarSign className="w-6 h-6" />,
      gradient: 'from-purple-600 to-indigo-600',
      hoverGradient: 'from-purple-700 to-indigo-700',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      href: '/propriedades',
    },
    {
      title: 'Arrendar casa',
      description: 'Tem um imóvel disponível? Arrende com total apoio e visibilidade.',
      button: 'Ver opções',
      icon: <KeyRound className="w-6 h-6" />,
      gradient: 'from-orange-500 to-amber-600',
      hoverGradient: 'from-orange-600 to-amber-700',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      href: '/propriedades',
    },
    {
      title: 'Vender casa',
      description: 'Anuncie seu imóvel e alcance milhares de potenciais compradores.',
      button: 'Anunciar agora',
      icon: <HandCoins className="w-6 h-6" />,
      gradient: 'from-slate-800 to-gray-900',
      hoverGradient: 'from-black to-gray-800',
      bgColor: 'bg-gradient-to-br from-gray-50 to-slate-100',
      href: '#',
      special: true,
    },
  ];

  return (
    <>
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
      >
        {/* Elementos decorativos de fundo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-0 left-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute bottom-0 right-0 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header da seção */}
          <motion.div
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{
              ...springTransition,
              duration: 0.8,
              damping: 25
            }}
            className="text-center mb-16"
          >
            <motion.div
              variants={badgeVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{
                ...springTransition,
                stiffness: 150,
                damping: 15,
                duration: 0.5
              }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 mb-4"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Comece sua jornada</span>
            </motion.div>
            <motion.h2
              variants={headerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{
                ...springTransition,
                duration: 0.8,
                damping: 25
              }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4"
            >
              Sua próxima conquista <span className="text-orange-500">imobiliária</span>
            </motion.h2>
            <motion.p
              variants={headerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{
                ...springTransition,
                duration: 0.8,
                damping: 25,
                delay: 0.1
              }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Descubra as melhores opções para comprar, arrendar ou vender seu imóvel com toda segurança e transparência.
            </motion.p>
          </motion.div>

          {/* Grid de cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {actions.map((action, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="rest"
                whileHover="hover"
                transition={{
                  ...springTransition,
                  duration: 0.6
                }}
                className={`relative group cursor-pointer ${action.special ? 'lg:transform lg:scale-105' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Efeito de brilho no hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                <motion.div
                  variants={cardHoverVariants}
                  transition={fastSpringTransition}
                  className={`relative rounded-2xl p-8 h-full flex flex-col justify-between transition-all duration-300 ${hoveredCard === index ? 'shadow-2xl' : 'shadow-lg'
                    } ${action.bgColor} border border-white/50 backdrop-blur-sm`}
                >

                  {/* Header do card */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={fastSpringTransition}
                        className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-lg`}
                      >
                        {action.icon}
                      </motion.div>
                      {action.special && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.5,
                            type: "spring",
                            stiffness: 200
                          }}
                          className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full"
                        >
                          Mais procurado
                        </motion.span>
                      )}
                    </div>

                    <motion.h3
                      className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors"
                    >
                      {action.title}
                    </motion.h3>

                    <motion.p
                      className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors"
                    >
                      {action.description}
                    </motion.p>
                  </div>

                  {/* Botão */}
                  <div className="mt-8">
                    {action.special ? (
                      <AuthDialog
                        ref={authDialogRef}
                        trigger={
                          <motion.button
                            variants={buttonHoverVariants}
                            initial="rest"
                            whileHover="hover"
                            transition={fastSpringTransition}
                            className={`w-full py-3 px-6 bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                            onClick={handleVenderClick}
                          >
                            {action.button}
                            <motion.span variants={iconVariants}>
                              <ArrowRight className="w-4 h-4" />
                            </motion.span>
                          </motion.button>
                        }
                      />
                    ) : (
                      <Link
                        href={action.href}
                      >
                        <motion.button
                          variants={buttonHoverVariants}
                          initial="rest"
                          whileHover="hover"
                          transition={fastSpringTransition}
                          className={`w-full py-3 px-6 bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                        >
                          {action.button}
                          <motion.span variants={iconVariants}>
                            <ArrowRight className="w-4 h-4" />
                          </motion.span>
                        </motion.button>
                      </Link>
                    )}
                  </div>

                  {/* Efeito de borda sutil no hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
                    <div className="absolute inset-[2px] rounded-2xl bg-white"></div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Texto adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 text-sm">
              Junte-se a milhares de clientes satisfeitos. <span className="text-orange-500 font-medium">100% seguro</span> e <span className="text-orange-500 font-medium">transparente</span>.
            </p>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}