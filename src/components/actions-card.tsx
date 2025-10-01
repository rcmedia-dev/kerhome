'use client';

import { BadgeDollarSign, HandCoins, KeyRound, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { AuthDialog } from "./login-modal";
import { useUserStore } from "@/lib/store/user-store";

export default function ActionCardsSection() {
  const { user } = useUserStore(); // 🚀 usando a store
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
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'from-green-600 to-emerald-700',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
      href: '/propriedades',
    },
    {
      title: 'Arrendar casa',
      description: 'Tem um imóvel disponível? Arrende com total apoio e visibilidade.',
      button: 'Ver opções',
      icon: <KeyRound className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-amber-600',
      hoverGradient: 'from-yellow-600 to-amber-700',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-100',
      href: '/propriedades',
    },
    {
      title: 'Vender casa',
      description: 'Anuncie seu imóvel e alcance milhares de potenciais compradores.',
      button: 'Anunciar agora',
      icon: <HandCoins className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      hoverGradient: 'from-blue-600 to-cyan-700',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-100',
      href: '#',
      special: true,
    },
  ];

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header da seção */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 mb-4">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Comece sua jornada</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Sua próxima conquista <span className="text-orange-500">imobiliária</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubra as melhores opções para comprar, arrendar ou vender seu imóvel com toda segurança e transparência.
            </p>
          </div>

          {/* Grid de cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {actions.map((action, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer ${action.special ? 'lg:transform lg:scale-105' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Efeito de brilho no hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className={`relative rounded-2xl p-8 h-full flex flex-col justify-between transition-all duration-300 ${
                  hoveredCard === index ? 'transform scale-105 shadow-2xl' : 'shadow-lg'
                } ${action.bgColor} border border-white/50 backdrop-blur-sm`}>
                  
                  {/* Header do card */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-lg`}>
                        {action.icon}
                      </div>
                      {action.special && (
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full animate-pulse">
                          Mais procurado
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {action.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {action.description}
                    </p>
                  </div>

                  {/* Botão */}
                  <div className="mt-8">
                    {action.special ? (
                      <AuthDialog
                        ref={authDialogRef}
                        trigger={
                          <button
                            className={`w-full py-3 px-6 bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient} text-white font-semibold rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                            onClick={handleVenderClick}
                          >
                            {action.button}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        }
                      />
                    ) : (
                      <Link
                        href={action.href}
                        className={`w-full py-3 px-6 bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient} text-white font-semibold rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                      >
                        {action.button}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>

                  {/* Efeito de borda sutil no hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
                    <div className="absolute inset-[2px] rounded-2xl bg-white"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Texto adicional */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Junte-se a milhares de clientes satisfeitos. <span className="text-orange-500 font-medium">100% seguro</span> e <span className="text-orange-500 font-medium">transparente</span>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
