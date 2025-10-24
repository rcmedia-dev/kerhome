"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function MobileMenu() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  const links = [
    {
      href: "/",
      label: "Início",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
    },
    {
      href: "/propriedades",
      label: "Propriedades",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
        />
      ),
    },
    {
      href: "/noticias",
      label: "Blog",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      ),
    },
    {
      href: "/contato",
      label: "Contactos",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.866 5.6a1 1 0 01-.27 1.04l-2.2 2.2a16 16 0 007.07 7.07l2.2-2.2a1 1 0 011.04-.27l5.6 1.866a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      ),
    },
  ];

  // Atualiza o índice ativo quando o pathname muda
  useEffect(() => {
    const currentIndex = links.findIndex(link => link.href === pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 z-50 p-3 shadow-2xl shadow-black/20">
      {/* Indicador de posição ativa */}
      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-purple-600 transition-all duration-300 ease-out"
           style={{
             width: `${100 / links.length}%`,
             transform: `translateX(${activeIndex * 100}%)`
           }} />
      
      <div className="flex justify-around items-center relative">
        {links.map((link, index) => {
          const active = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center text-xs p-2 transition-all duration-300 ease-out group ${
                active 
                  ? "text-orange-600 transform scale-110" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveIndex(index)}
            >
              {/* Efeito de fundo ativo */}
              {active && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-purple-100 rounded-2xl -z-10 scale-110" />
              )}
              
              {/* Efeito de hover */}
              <div className="absolute inset-0 bg-gray-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
              
              {/* Ícone com animação */}
              <div className={`relative transition-all duration-300 ${
                active ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"
              }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {link.icon}
                </svg>
                
                {/* Ponto indicador para estado ativo */}
                {active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                )}
              </div>
              
              {/* Label com animação */}
              <span className={`mt-1 font-medium transition-all duration-300 ${
                active 
                  ? "text-orange-600 opacity-100 translate-y-0" 
                  : "text-gray-600 opacity-90 group-hover:opacity-100"
              }`}>
                {link.label}
              </span>
              
              {/* Efeito de brilho no item ativo */}
              {active && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 to-purple-400/20 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Barra de navegação inferior decorativa */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full" />
    </div>
  );
}