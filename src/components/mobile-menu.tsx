"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Building2, Building, Newspaper, Plus } from "lucide-react";
import { useUserStore } from "@/lib/store/user-store";
import { useUIStore } from "@/lib/store/ui-store";
import { useRouter } from "next/navigation";
import { AuthDialog } from "./login-modal";

export function MobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useUserStore();
  const { openAuthModal } = useUIStore();

  const isExcludedRoute = pathname.includes("/dashboard/cadastrar-imovel") || pathname.startsWith("/admin/dashboard");

  const links = [
    {
      href: "/",
      label: "Início",
      icon: <Home size={20} />,
    },
    {
      href: "/propriedades",
      label: "Imóveis",
      icon: <Building2 size={20} />,
    },
    {
      href: "/dashboard/cadastrar-imovel",
      label: "Vender",
      isFloating: true,
      icon: <Plus size={24} strokeWidth={3} />,
    },
    {
      href: "/imobiliarias",
      label: "Agências",
      icon: <Building size={20} />,
    },
    {
      href: "/noticias",
      label: "Blog",
      icon: <Newspaper size={20} />,
    },
  ];

  // Atualiza o índice ativo quando o pathname muda
  useEffect(() => {
    const currentIndex = links.findIndex(link => link.href === pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  if (isExcludedRoute) return null;

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

          if ('isFloating' in link && link.isFloating) {
            return (
              <div
                key={link.href}
                className="relative -top-7 flex flex-col items-center group outline-none cursor-pointer"
                onClick={(e) => {
                  if (!user) {
                    openAuthModal();
                  } else {
                    router.push(link.href);
                    setActiveIndex(index);
                  }
                }}
              >
                <div className="relative">
                  {/* Efeito de brilho/aura */}
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
                  
                  {/* Botão Principal */}
                  <div className="relative bg-gradient-to-tr from-orange-500 to-purple-600 p-4 rounded-full text-white shadow-2xl border-4 border-white transform transition-all duration-300 group-hover:scale-115 group-active:scale-95 group-hover:-translate-y-1">
                    {link.icon}
                  </div>
                </div>
                <span className="mt-1.5 text-[10px] font-bold text-orange-600 uppercase tracking-tighter">
                  {link.label}
                </span>
              </div>
            );
          }
          
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
              
              {/* Ícone */}
              <div className={`relative transition-all duration-300 ${
                active ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"
              }`}>
                {link.icon}
                
                {/* Ponto indicador para estado ativo */}
                {active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                )}
              </div>
              
              {/* Label */}
              <span className={`mt-1 font-medium transition-all duration-300 ${
                active 
                  ? "text-orange-600 opacity-100 translate-y-0" 
                  : "text-gray-600 opacity-90 group-hover:opacity-100"
              }`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>

      <AuthDialog />

      {/* Barra de navegação inferior decorativa */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full" />
    </div>
  );
}
