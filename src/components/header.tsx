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
import { AuthDialog } from '@/components/login-modal';
import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import DraggableChat from '@/components/floating-chat';
import CadastrarImovelButton from '@/components/cadastrar-imovel-button';
import { useQuery } from '@tanstack/react-query';
import { getUserPlan } from '@/lib/functions/supabase-actions/get-user-package-action';
import { UserProfile, useUserStore } from '@/lib/store/user-store';
import { toast } from 'sonner';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';

// Animations with proper TypeScript types
const headerAnimations: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  }
};

const menuAnimations: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const itemAnimations: Variants = {
  closed: { 
    opacity: 0, 
    x: -20
  },
  open: { 
    opacity: 1, 
    x: 0
  }
};

const searchBarAnimations: Variants = {
  hidden: { 
    opacity: 0,
    height: 0
  },
  visible: { 
    opacity: 1,
    height: "auto"
  }
};

const dropdownAnimations: Variants = {
  closed: {
    opacity: 0,
    scale: 0.95
  },
  open: {
    opacity: 1,
    scale: 1
  }
};

// Transition configurations
const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

const easeOutTransition: Transition = {
  duration: 0.3,
  ease: "easeOut"
};

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
  const { setUser } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleDashboardClick = () => {
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const store = useUserStore.getState();
      if (typeof store.signOut === 'function') {
        await store.signOut();
      } else {
        await supabase.auth.signOut();
      }

      if (typeof setUser === 'function') {
        setUser(null as any);
      }

      toast.success('Sessão encerrada');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao encerrar a sessão');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
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
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl shadow-xl border border-gray-100 bg-white p-2 mt-2"
      >
        <motion.div
          initial="closed"
          animate="open"
          variants={dropdownAnimations}
          transition={springTransition}
        >
          {/* Cabeçalho do usuário */}
          <motion.div 
            className="px-4 py-3 border-b border-gray-100 mb-2 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={springTransition}
            >
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={`${user.primeiro_nome} ${user.ultimo_nome}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-6 h-6 text-white" />
              )}
            </motion.div>
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
          </motion.div>

          {/* Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DropdownMenuItem
              onClick={handleDashboardClick}
              className="rounded-lg px-3 py-2.5 
                text-gray-700 font-medium text-sm 
                flex items-center gap-2 
                transition-colors cursor-pointer
                hover:bg-purple-50 hover:text-purple-700"
            >
              <motion.span 
                className="w-2 h-2 rounded-full bg-purple-500"
                whileHover={{ scale: 1.5 }}
                transition={springTransition}
              />
              Dashboard
            </DropdownMenuItem>
          </motion.div>

          <DropdownMenuSeparator className="my-2" />

          {/* Sair */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DropdownMenuItem
              onClick={handleLogout}
              aria-busy={isLoggingOut}
              className={`rounded-lg px-3 py-2.5 
                text-red-600 font-medium text-sm 
                flex items-center gap-2 
                transition-colors cursor-pointer
                hover:bg-red-50 ${isLoggingOut ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <motion.span 
                className="w-2 h-2 rounded-full bg-red-500"
                whileHover={{ scale: 1.5 }}
                transition={springTransition}
              />
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </DropdownMenuItem>
          </motion.div>
        </motion.div>
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
    <section 
      aria-label="Barra de pesquisa" 
      className="flex justify-center items-center py-5 bg-purple-700 px-4"
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={easeOutTransition}
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row bg-white w-full max-w-5xl px-5 py-4 lg:py-3 rounded-2xl gap-4 items-center shadow-lg"
      >
        <motion.div 
          className="relative w-full lg:w-[50%]"
          whileFocus={{ scale: 1.02 }}
          transition={springTransition}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="O que deseja procurar?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-none focus:outline-none text-sm rounded-lg bg-gray-50"
            aria-label="Termo de pesquisa"
          />
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-[40%]">
          <motion.div
            whileFocus={{ scale: 1.02 }}
            transition={springTransition}
          >
            <Select onValueChange={setEstado}>
              <SelectTrigger className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 py-2.5">
                <SelectValue placeholder="Estado do Imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="para alugar">Para Alugar</SelectItem>
                <SelectItem value="para comprar">Para Comprar</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            whileFocus={{ scale: 1.02 }}
            transition={springTransition}
          >
            <Select onValueChange={setCidade}>
              <SelectTrigger className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 py-2.5">
                <SelectValue placeholder="Cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Luanda">Luanda</SelectItem>
                <SelectItem value="Huambo">Huambo</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>

        <motion.button
          type="submit"
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "#ea580c"
          }}
          whileTap={{ scale: 0.95 }}
          transition={springTransition}
          className="w-full sm:w-auto bg-orange-500 px-5 py-2.5 rounded-lg text-white font-semibold hover:bg-orange-600 transition-all duration-200 shadow-md"
          aria-label="Pesquisar imóveis"
        >
          Procurar
        </motion.button>
      </motion.form>
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
    enabled: !!user?.id
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
      <motion.header 
        initial="hidden"
        animate="visible"
        variants={headerAnimations}
        className="sticky top-0 z-40 bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-4 md:px-6">
          <Link href="/" aria-label="Página inicial" className="flex-shrink-0">
            <motion.img 
              src="/kercasa_logo.png" 
              alt="kerhome logo" 
              className="w-32 md:w-40 transition-all duration-300" 
              whileHover={{ scale: 1.05 }}
              transition={springTransition}
            />
          </Link>
          <motion.div 
            className="animate-pulse bg-gray-200 h-10 w-24 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
        </div>
      </motion.header>
    );
  }

  return (
    <motion.header 
      initial="hidden"
      animate="visible"
      variants={headerAnimations}
      className="sticky top-0 z-40 bg-white shadow-sm"
    >
      {/* Navegação principal */}
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" aria-label="Página inicial" className="flex-shrink-0">
          <motion.img 
            src="/kercasa_logo.png" 
            alt="kerhome logo" 
            className="w-32 md:w-40 transition-all duration-300" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
          />
        </Link>

        {/* Links de navegação - Desktop */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center justify-center flex-1 mx-8">
          <ul className="flex items-center gap-1">
            {navLinks.map(({ id, label, href, icon: Icon }, index) => (
              <motion.li 
                key={id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.1 + index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <Link href={href} className={linkClass(pathname, href)}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={springTransition}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  {label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Ações do usuário - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {/* Botão de mensagens */}
          {user && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              onClick={() => {
                setIsChatOpen(true);
                setUnreadCount(0);
              }}
              className="relative flex items-center p-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-300"
              aria-label="Mensagens"
            >
              <MessageSquare className="w-5 h-5" />
              
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
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
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTransition}
                  className="flex items-center gap-2 px-4 py-2.5 border border-purple-700 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200"
                  aria-label="Acessar minha conta"
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Minha Conta</span>
                </motion.button>
              }
            />
          )}
        </div>

        {/* Botão do menu mobile */}
        <div className="md:hidden">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={springTransition}
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-2 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav 
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuAnimations}
            aria-label="Navegação mobile" 
            className="md:hidden px-4 pb-4 bg-white border-t border-gray-100 overflow-hidden"
          >
            <ul className="flex flex-col space-y-2 mb-4">
              {navLinks.map(({ id, label, href, icon: Icon }, index) => (
                <motion.li 
                  key={id}
                  variants={itemAnimations}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 24
                  }}
                >
                  <Link 
                    href={href} 
                    className={linkClass(pathname, href)}
                    onClick={() => setMenuOpen(false)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={springTransition}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    {label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            
            <motion.div 
              className="flex flex-col gap-3 pt-2 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {user && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTransition}
                  onClick={() => {
                    setIsChatOpen(true);
                    setUnreadCount(0);
                    setMenuOpen(false);
                  }}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  Mensagens
                  
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
              
              <Link 
                href="/dashboard/cadastrar-imovel" 
                className="w-full"
                onClick={() => setMenuOpen(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTransition}
                  className="w-full px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-sm font-medium text-white rounded-xl border border-purple-700 transition-all duration-200"
                  onClick={handleCadastrarImovelClick}
                >
                  Cadastrar Imóvel
                </motion.button>
              </Link>
              
              {user ? (
                <UserDropdown user={user} mobile />
              ) : (
                <AuthDialog 
                  ref={authDialogRef} 
                  trigger={
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={springTransition}
                      className="w-full flex items-center gap-2 px-4 py-2.5 border border-purple-700 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200 justify-center"
                      aria-label="Acessar minha conta"
                    >
                      <UserCircle className="w-5 h-5" />
                      Minha Conta
                    </motion.button>
                  }
                />
              )}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Barra de pesquisa que desaparece ao rolar */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={searchBarAnimations}
            transition={easeOutTransition}
            className="relative z-30"
          >
            <SearchBar />
          </motion.div>
        )}
      </AnimatePresence>

      <DraggableChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        userId={user?.id || ""} 
      />
    </motion.header>
  );
}