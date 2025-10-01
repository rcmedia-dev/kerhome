'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  UserCircle, 
  X, 
  MessageSquare, 
  Search, 
  Home, 
  Building, 
  Newspaper, 
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { AuthDialog } from './login-modal';
import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import DraggableChat from './floating-chat';
import CadastrarImovelButton from './cadastrar-imovel-button';
import { useQuery } from '@tanstack/react-query';
import { getUserPlan } from '@/lib/actions/supabase-actions/get-user-package-action';
import { UserProfile, useUserStore } from '@/lib/store/user-store';

// Função para estilização dos links
const linkClass = (pathname: string, href: string) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ease-in-out ${
    pathname === href 
      ? 'text-purple-700 bg-purple-50 shadow-sm' 
      : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
  }`;

// Componente para o dropdown do usuário
function UserDropdown({ user, mobile = false }: { user: UserProfile, mobile?: boolean }) {
  const router = useRouter();
  const { setUser } = useUserStore(); // Usando a user store

  const handleDashboardClick = () => {
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await useUserStore.getState().signOut(); // Usando o signOut da store
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Menu do usuário"
          aria-haspopup="true"
          className={`${mobile ? "w-full justify-center" : ""} 
            flex items-center px-4 py-2.5 
            border border-purple-200 
            text-purple-700 bg-white 
            hover:bg-purple-700 hover:text-white 
            text-sm font-medium 
            rounded-2xl shadow-sm 
            transition-all duration-300 
            gap-2 outline-none 
            focus:ring-2 focus:ring-purple-400`}
        >
          <UserCircle className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold">Minha Conta</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl shadow-xl border border-gray-100 bg-white p-2 mt-2 animate-in fade-in-80 slide-in-from-top-2"
      >
        {/* Cabeçalho do usuário */}
        <div className="px-4 py-3 border-b border-gray-100 mb-2 flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 shadow-md">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={`${user.primeiro_nome} ${user.ultimo_nome}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserCircle className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm truncate">
              {user?.primeiro_nome || "Usuário"} {user?.ultimo_nome || ""}
            </div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            {user?.pacote_agente && (
              <div className="text-xs text-purple-600 font-medium">
                {user.pacote_agente.nome}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard */}
        <DropdownMenuItem
          onClick={handleDashboardClick}
          className="rounded-lg px-3 py-2.5 
            text-gray-700 font-medium text-sm 
            flex items-center gap-2 
            transition-colors cursor-pointer
            hover:bg-purple-50 hover:text-purple-700"
        >
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        {/* Sair */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-lg px-3 py-2.5 
            text-red-600 font-medium text-sm 
            flex items-center gap-2 
            transition-colors cursor-pointer
            hover:bg-red-50"
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente para a barra de pesquisa
function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (estado) params.append('status', estado);
    if (cidade) params.append('cidade', cidade);
    router.push(`/results?${params.toString()}`);
  };

  return (
    <section aria-label="Barra de pesquisa" className="flex justify-center items-center py-5 bg-purple-700 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row bg-white w-full max-w-5xl px-5 py-4 lg:py-3 rounded-2xl gap-4 items-center shadow-lg"
      >
        <div className="relative w-full lg:w-[50%]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="O que deseja procurar?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-none focus:outline-none text-sm rounded-lg bg-gray-50"
            aria-label="Termo de pesquisa"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-[40%]">
          <Select onValueChange={setEstado}>
            <SelectTrigger className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 py-2.5">
              <SelectValue placeholder="Estado do Imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="para alugar">Para Alugar</SelectItem>
              <SelectItem value="para comprar">Para Comprar</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setCidade}>
            <SelectTrigger className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 py-2.5">
              <SelectValue placeholder="Cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Luanda">Luanda</SelectItem>
              <SelectItem value="Huambo">Huambo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-orange-500 px-5 py-2.5 rounded-lg text-white font-semibold hover:bg-orange-600 transition-all duration-200 shadow-md"
          aria-label="Pesquisar imóveis"
        >
          Procurar
        </button>
      </form>
    </section>
  );
}

// Definir o tipo para a referência do AuthDialog
interface AuthDialogRef {
  open: () => void;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const authDialogRef = useRef<AuthDialogRef>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  // Usando a user store
  const { user, isLoading, setUser, fetchUserProfile } = useUserStore();

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolled(window.scrollY > 5);
    }, 50);
  }, []);

  useEffect(() => {
    setIsClient(true);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Carregar o perfil do usuário se estiver autenticado
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        await fetchUserProfile(user.id);
      }
    };

    loadUserProfile();
  }, [user?.id, fetchUserProfile]);

  const userPlanData = useQuery({
    queryKey: ['imoveis-limite', user?.id],
    queryFn: () => getUserPlan(user?.id),
    enabled: !!user?.id // Só executa se o usuário existir
  });

  // Efeito para subscrever mensagens em tempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMessage = payload.new;
          
          if (newMessage.sender_id !== user.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Função para verificar autenticação antes de cadastrar imóvel
  const handleCadastrarImovelClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      authDialogRef.current?.open();
    }
  };

  const navLinks = [
    { id: 'inicio', label: 'ÍNICIO', href: '/', icon: Home },
    { id: 'propriedades', label: 'PROPRIEDADES', href: '/propriedades', icon: Building },
    { id: 'noticias', label: 'NOTÍCIAS', href: '/noticias', icon: Newspaper },
    { id: 'contacto', label: 'CONTACTO', href: '/contato', icon: Phone },
  ];

  // Se ainda está carregando, mostrar um header básico
  if (isLoading && !user) {
    return (
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-4 md:px-6">
          <Link href="/" aria-label="Página inicial" className="flex-shrink-0">
            <img 
              src="/kercasa_logo.png" 
              alt="kerhome logo" 
              className="w-32 md:w-40 transition-all duration-300" 
            />
          </Link>
          <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-xl"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Navegação principal */}
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" aria-label="Página inicial" className="flex-shrink-0">
          <img 
            src="/kercasa_logo.png" 
            alt="kerhome logo" 
            className="w-32 md:w-40 transition-all duration-300" 
          />
        </Link>

        {/* Links de navegação - Desktop */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center justify-center flex-1 mx-8">
          <ul className="flex items-center gap-1">
            {navLinks.map(({ id, label, href, icon: Icon }) => (
              <li key={id}>
                <Link href={href} className={linkClass(pathname, href)}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Ações do usuário - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {/* Botão de mensagens */}
          {user && (
            <button
              onClick={() => {
                setIsChatOpen(true);
                setUnreadCount(0);
              }}
              className="relative flex items-center p-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-300"
              aria-label="Mensagens"
            >
              <MessageSquare className="w-5 h-5" />
              
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          
          <CadastrarImovelButton
            user={user}
            authDialogRef={authDialogRef}
            userPlan={userPlanData.data || null}
          />
          
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <AuthDialog 
              ref={authDialogRef} 
              trigger={
                <button 
                  className="flex items-center gap-2 px-4 py-2.5 border border-purple-700 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200"
                  aria-label="Acessar minha conta"
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Minha Conta</span>
                </button>
              }
            />
          )}
        </div>

        {/* Botão do menu mobile */}
        <div className="md:hidden">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-2 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <nav aria-label="Navegação mobile" className="md:hidden px-4 pb-4 bg-white border-t border-gray-100">
          <ul className="flex flex-col space-y-2 mb-4">
            {navLinks.map(({ id, label, href, icon: Icon }) => (
              <li key={id}>
                <Link 
                  href={href} 
                  className={linkClass(pathname, href)}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            {user && (
              <button
                onClick={() => {
                  setIsChatOpen(true);
                  setUnreadCount(0);
                  setMenuOpen(false);
                }}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Mensagens
                
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            
            <Link 
              href="/dashboard/cadastrar-imovel" 
              className="w-full"
              onClick={() => setMenuOpen(false)}
            >
              <button
                className="w-full px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-sm font-medium text-white rounded-xl border border-purple-700 transition-all duration-200"
                onClick={handleCadastrarImovelClick}
              >
                Cadastrar Imóvel
              </button>
            </Link>
            
            {user ? (
              <UserDropdown user={user} mobile />
            ) : (
              <AuthDialog 
                ref={authDialogRef} 
                trigger={
                  <button 
                    className="w-full flex items-center gap-2 px-4 py-2.5 border border-purple-700 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200 justify-center"
                    aria-label="Acessar minha conta"
                  >
                    <UserCircle className="w-5 h-5" />
                    Minha Conta
                  </button>
                }
              />
            )}
          </div>
        </nav>
      )}

      {/* Barra de pesquisa que desaparece ao rolar */}
      <div className={`relative z-30 transition-all duration-300 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
        <SearchBar />
      </div>

      <DraggableChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        userId={user?.id || ""} 
      />
    </header>
  );
}