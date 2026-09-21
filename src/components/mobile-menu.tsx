"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Building2, Building, Newspaper, Plus } from "lucide-react";
import { useUserStore } from "@/lib/store/user-store";
import { useUIStore } from "@/lib/store/ui-store";
import { useRouter } from "next/navigation";
import { AuthDialog } from "./login-modal";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useUserStore();
  const { openAuthModal } = useUIStore();

  const isExcludedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin/dashboard");

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 z-50 p-2 pb-3 shadow-2xl shadow-black/20 select-none safe-area-bottom">
      <div className="flex justify-around items-center relative">
        {links.map((link, index) => {
          const active = pathname === link.href;

          if ('isFloating' in link && link.isFloating) {
            return (
              <div
                key={link.href}
                className="relative -top-5 flex flex-col items-center group outline-none cursor-pointer"
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
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
                  
                  {/* Botão Principal */}
                  <div className="relative bg-gradient-to-tr from-orange-500 to-purple-600 p-3.5 rounded-full text-white shadow-2xl border-4 border-white transform transition-all duration-300 group-hover:scale-110 group-active:scale-95 group-hover:-translate-y-0.5">
                    {link.icon}
                  </div>
                </div>
              </div>
            );
          }
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex flex-col items-center text-xs py-1.5 px-2 rounded-xl transition-all duration-200 group outline-none cursor-pointer flex-1",
                active 
                  ? "text-orange-600 bg-orange-50/60 font-semibold" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
              )}
              onClick={() => setActiveIndex(index)}
            >
              {/* Ícone com background suave quando ativo */}
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-200",
                active ? "bg-orange-50 text-orange-600" : "text-gray-400 group-hover:text-gray-600"
              )}>
                {link.icon}
              </div>
              
              {/* Label */}
              <span className={cn(
                "mt-0.5 text-[10px] font-medium transition-colors",
                active 
                  ? "text-orange-600 font-bold" 
                  : "text-gray-600"
              )}>
                {link.label}
              </span>

              {/* Indicador sutil e limpo */}
              {active && (
                <span className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>

      <AuthDialog />

      {/* Barra de navegação inferior decorativa */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-linear-to-r from-transparent via-gray-300 to-transparent rounded-full" />
    </div>
  );
}
