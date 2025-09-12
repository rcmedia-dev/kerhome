'use client';

import { useAuth, UserProfile } from './auth-context';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  UserCircle, 
  X, 
  MessageSquare, 
  Bell, 
  Search, 
  Home, 
  Building, 
  Newspaper, 
  Phone,
  ChevronLeft,
  Paperclip,
  Send,
  Smile,
  Maximize2,
  Minimize2,
  XCircle
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
import { logout } from '@/lib/logout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessages, sendMessage, subscribeMessages } from '@/lib/actions/message-action';

// Tipos para notificações e mensagens
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface MessageItem {
  id: number;
  text: string;
  time: string;
  sender: 'user' | 'other';
}

interface Message {
  id: number;
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
  conversation: MessageItem[];
}

interface User {
  id: string;
  email: string;
  primeiro_nome: string;
  role: string;
}

// Types for Supabase data
interface SupabaseMessage {
  id: string;
  content: string;
  sender: { id: string; email: string }[] // agora aceita array
  created_at: string;
  conversation_id: string;
}

interface SupabaseConversation {
  id: string;
  property: { title: string } | null;
  agent: { id: string; email: string; primeiro_nome: string; ultimo_nome: string; } | null;
  client: { id: string; email: string; primeiro_nome: string; ultimo_nome: string; } | null;
  created_at: string;
}

// Função para estilização dos links
const linkClass = (pathname: string, href: string) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ease-in-out ${
    pathname === href 
      ? 'text-purple-700 bg-purple-50 shadow-sm' 
      : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
  }`;

// Componente para o chat de mensagens
function MessageChat({ 
  conversation, 
  messages, 
  onBack, 
  onSendMessage,
  isLoading 
}: { 
  conversation: SupabaseConversation;
  messages: SupabaseMessage[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  // Get the other participant's email
  const { user } = useAuth();
  const otherParticipant = user?.id === conversation.agent?.id 
    ? conversation.client 
    : conversation.agent;

  return (
    <div className="h-full flex flex-col animate-in fade-in-50">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <button 
          onClick={onBack}
          className="text-purple-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h3 className="font-semibold">
            {`${otherParticipant?.primeiro_nome ?? ''} ${otherParticipant?.ultimo_nome ?? ''}`.trim() || 'Unknown'}
          </h3>
          <p className="text-xs text-gray-500">Propriedade: {conversation.property?.title || 'No title'}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {isLoading ? (
          <div className="text-center py-4">Carregando mensagens...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Nenhuma mensagem ainda</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender?.[0]?.id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender?.[0]?.id === user?.id
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
                <span className={`text-xs block mt-1 ${msg.sender?.[0]?.id === user?.id ? 'text-purple-200' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 pr-12"
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <Paperclip className="w-5 h-5" />
            </button>
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="bg-purple-700 text-white p-2.5 rounded-full hover:bg-purple-800 transition-colors disabled:opacity-50"
          disabled={isLoading || !newMessage.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

function FloatingChat({ 
  userId,
  isOpen, 
  onClose,
}: { 
  userId: string;
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [selectedConversation, setSelectedConversation] = useState<SupabaseConversation | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => getConversations(userId),
    enabled: isOpen && !!userId,
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => getMessages(selectedConversation!.id),
    enabled: isOpen && !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      sendMessage(conversationId, userId, content),
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
    },
  });

  // Subscribe to real-time messages
  useEffect(() => {
    if (!selectedConversation?.id) return;

    const subscription = subscribeMessages(selectedConversation.id, (newMessage: any) => {
      queryClient.setQueryData(['messages', selectedConversation.id], (old: SupabaseMessage[] | undefined) => {
        return old ? [...old, newMessage] : [newMessage];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation?.id, queryClient]);

  // Posicionar inicialmente no canto inferior direito
  useEffect(() => {
    if (isOpen && chatRef.current) {
      const width = chatRef.current.offsetWidth;
      const height = chatRef.current.offsetHeight;
      setPosition({
        x: window.innerWidth - width - 20,
        y: window.innerHeight - height - 20
      });
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (chatRef.current && !isMinimized) {
      setIsDragging(true);
      const rect = chatRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && chatRef.current && !isMinimized) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Limitar ao viewport
      const maxX = window.innerWidth - chatRef.current.offsetWidth;
      const maxY = window.innerHeight - chatRef.current.offsetHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset, isMinimized]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleConversationClick = (conversation: SupabaseConversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleSendMessage = (content: string) => {
    if (selectedConversation) {
      sendMessageMutation.mutate({
        conversationId: selectedConversation.id,
        content
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className={`fixed z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col ${
        isMinimized ? 'w-80 h-14' : 'w-80 h-96'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.3s ease'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Cabeçalho arrastável */}
      <div className="bg-purple-700 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">
            {selectedConversation ? 'Conversa' : 'Mensagens'}
          </span>
          {conversations && conversations.length > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {conversations.length}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-purple-600 rounded-full p-1 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-purple-600 rounded-full p-1 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          {!selectedConversation ? (
            <div className="p-3 h-full overflow-y-auto">
              {conversationsLoading ? (
                <div className="text-center py-4">Carregando conversas...</div>
              ) : conversations && conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map((conversation: SupabaseConversation) => (
                    <div 
                      key={conversation.id} 
                      className="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm bg-gray-50 border-gray-100"
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-gray-700">
                          {conversation.property?.title || 'Sem titulo'}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Com: {user?.id === conversation.agent?.id 
                          ? `${conversation.client?.primeiro_nome ?? ''} ${conversation.client?.ultimo_nome ?? ''}`.trim() || 'Unknown' 
                          : `${conversation.agent?.primeiro_nome ?? ''} ${conversation.agent?.ultimo_nome ?? ''}`.trim() || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma conversa encontrada
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 h-full flex flex-col">
              <MessageChat 
                conversation={selectedConversation}
                messages={messages || []}
                onBack={handleBack}
                onSendMessage={handleSendMessage}
                isLoading={sendMessageMutation.isPending || messagesLoading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente para o dropdown do usuário
function UserDropdown({ user, mobile = false }: { user: UserProfile, mobile?: boolean }) {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = () => {
    try {
      logout();
    } catch (e) {}
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Menu do usuário"
          aria-haspopup="true"
          className={`${mobile ? 'w-full justify-center' : ''} flex items-center px-4 py-2.5 border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 text-sm font-medium rounded-xl transition-all duration-200 gap-2 outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer`}
        >
          <UserCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Minha Conta</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-xl shadow-lg border border-gray-100 bg-white p-2 mt-1 animate-in fade-in-80"
      >
        <div className="px-3 py-2 border-b border-gray-100 mb-1 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-100">
            <UserCircle className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{user?.primeiro_nome || 'Usuário'}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </div>
        
        <DropdownMenuItem 
          onClick={handleDashboardClick} 
          className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium cursor-pointer text-sm"
        >
          Dashboard
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1" />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 font-medium cursor-pointer text-sm"
        >
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
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const authDialogRef = useRef<AuthDialogRef>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Função para verificar autenticação antes de cadastrar imóvel
  const handleCadastrarImovelClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      authDialogRef.current?.open();
    }
  };

  // Função para abrir o chat flutuante
  const handleFloatingChatClick = () => {
    if (!user) {
      authDialogRef.current?.open();
      return;
    }

    setIsAnimating(true);
    setFloatingChatOpen(true);
    
    // Reset da animação após um tempo
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const navLinks = [
    { id: 'inicio', label: 'ÍNICIO', href: '/', icon: Home },
    { id: 'alugar', label: 'PARA ALUGAR', href: '/alugar', icon: Building },
    { id: 'comprar', label: 'PARA COMPRAR', href: '/comprar', icon: Building },
    { id: 'noticias', label: 'NOTÍCIAS', href: '/noticias', icon: Newspaper },
    { id: 'contacto', label: 'CONTACTO', href: '/contato', icon: Phone },
  ];

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
          {/* Botão combinado de notificações/mensagens com animação "insana" - SÓ APARECE QUANDO LOGADO */}
          {user && (
            <button
              onClick={handleFloatingChatClick}
              className={`relative flex items-center p-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-300 ${
                isAnimating ? 'animate-spin animate-pulse animate-bounce' : ''
              }`}
              aria-label="Mensagens"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
          
          <Link href="/dashboard/cadastrar-imovel">
            <button
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-sm font-medium text-white rounded-xl border border-purple-700 transition-all duration-200 shadow-sm"
              onClick={handleCadastrarImovelClick}
              aria-label="Cadastrar imóvel"
            >
              Cadastrar Imóvel
            </button>
          </Link>
          
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
            {/* Botão combinado de notificações/mensagens para mobile - SÓ APARECE QUANDO LOGADO */}
            {user && (
              <button
                onClick={() => {
                  handleFloatingChatClick();
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all ${
                  isAnimating ? 'animate-spin animate-pulse animate-bounce' : ''
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                Mensagens
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

      {/* Chat flutuante */}
      {user && (
        <FloatingChat 
          userId={user.id}
          isOpen={floatingChatOpen} 
          onClose={() => setFloatingChatOpen(false)}
        />
      )}

      {/* Barra de pesquisa que desaparece ao rolar */}
      <div className={`relative z-30 transition-all duration-300 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
        <SearchBar />
      </div>
    </header>
  );
}