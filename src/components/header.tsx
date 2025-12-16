'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  UserCircle,
  X,
  MessageSquare,
  Home,
  Building,
  Newspaper,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { AuthDialog } from '@/components/login-modal';
import React from 'react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import CadastrarImovelButton from '@/components/cadastrar-imovel-button';
import { useQuery } from '@tanstack/react-query';
import { getUserPlan } from '@/lib/functions/supabase-actions/get-user-package-action';
import { UserProfile, useUserStore } from '@/lib/store/user-store';
import { toast } from 'sonner';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';

import { ChatWidget } from './chat/chat-widget';
import { useChatStore } from '@/lib/store/chat-store';

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
  `relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 group ${pathname === href
    ? 'text-purple-700'
    : 'text-gray-600 hover:text-purple-700'
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



// Definir o tipo para a referência do AuthDialog
interface AuthDialogRef {
  open: () => void;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const authDialogRef = useRef<AuthDialogRef>(null);
  const pathname = usePathname();

  // Usando a user store
  const { user, isLoading, setUser, fetchUserProfile } = useUserStore();

  // Chat store
  const { toggleChat, messages, isOpen, initializeChat, totalUnreadCount } = useChatStore();



  // Carregar o perfil do usuário se estiver autenticado
  // Initialize chat when user is logged in
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id);
      initializeChat(user.id);
    }
  }, [user?.id, fetchUserProfile, initializeChat]);

  const userPlanData = useQuery({
    queryKey: ['imoveis-limite', user?.id],
    queryFn: () => getUserPlan(user?.id),
    enabled: !!user?.id
  });



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
    <>
      <ChatWidget />
      <motion.header
        initial="hidden"
        animate="visible"
        variants={headerAnimations}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm supports-backdrop-filter:bg-white/60"
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
                    <span className="relative z-10 flex items-center gap-2">
                      {label}
                    </span>
                    {pathname === href && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute inset-0 bg-purple-100 rounded-full z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {pathname !== href && (
                      <span className="absolute inset-0 bg-gray-50 rounded-full scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 z-0" />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Ações do usuário - Desktop */}
          <div className="hidden md:flex items-center gap-2">

            {/* Message Button */}
            {user && (
              <button
                onClick={toggleChat}
                className="p-2.5 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors relative"
                aria-label="Mensagens"
              >
                <div className="relative">
                  <MessageSquare className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  )}
                </div>
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springTransition}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    aria-label="Acessar minha conta"
                  >
                    <UserCircle className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                    <span className="hidden sm:inline font-medium">Entrar</span>
                  </motion.button>
                }
              />
            )}
          </div>

          {/* Botão do menu mobile */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className="p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                aria-label="Mensagens"
              >
                <MessageSquare className="w-5 h-5" />
              </motion.button>
            )}
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
      </motion.header>
    </>
  );
}