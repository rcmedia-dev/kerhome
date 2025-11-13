'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  ChevronLeft,
  User,
  Search,
  RefreshCw,
  Plus,
  Users,
  ArrowLeft,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessages, getContacts, createDirectConversation, deleteConversation } from '@/lib/functions/message-action';
import { pusherClient } from '@/lib/pusher-client';

interface Profile {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  avatar_url: string | null;
  username: string | null;
  telefone: string | null;
  status?: string;
  last_seen_at?: string;
  empresa?: string | null;
  role?: string;
  display_name?: string;
  has_existing_conversation?: boolean;
  conversation_id?: string | null;
}

interface Contact {
  contacts: Profile[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

interface Agent { 
  id: string; 
  primeiro_nome: string; 
  ultimo_nome: string; 
  email: string; 
  avatar_url: string | null; 
}

interface Client { 
  id: string; 
  primeiro_nome: string; 
  ultimo_nome: string; 
  email: string; 
  avatar_url: string | null; 
}

interface Property { 
  id: string; 
  title: string; 
}

interface Conversation {
  id: string;
  agent_id: string;
  client_id: string;
  property_id: string;
  created_at: string;
  updated_at: string;
  agent: Agent;
  client: Client;
  property: Property;
  other_user?: Profile | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  read_by_receiver: boolean;
  profiles?: { 
    id: string; 
    primeiro_nome: string; 
    ultimo_nome: string; 
    email: string; 
    avatar_url: string | null; 
  };
}

interface Position { 
  x: number; 
  y: number; 
}

interface DraggableChatProps { 
  isOpen: boolean; 
  onClose: () => void; 
  userId: string; 
}

type ViewType = 'conversations' | 'chat' | 'contacts';

const DraggableChat: React.FC<DraggableChatProps> = ({ isOpen, onClose, userId }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [localMessagesMap, setLocalMessagesMap] = useState<Record<string, Message[]>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsSearch, setContactsSearch] = useState('');
  const [showConversationMenu, setShowConversationMenu] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const chatRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const contactsContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Query para conversas
  const { data: conversationsRaw = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(userId),
    enabled: isOpen,
  });

  // Query para contactos com paginação
  const { data: contactsData, isLoading: contactsLoading, refetch: refetchContacts } = useQuery({
    queryKey: ['contacts', userId, contactsPage, contactsSearch],
    queryFn: () => getContacts(userId, contactsPage, 10, contactsSearch),
    enabled: isOpen && currentView === 'contacts',
    staleTime: 1000 * 60 * 5,
  });

  // Normalizando conversas para nunca ter null - CORRIGIDO
  const conversationsData: Conversation[] = conversationsRaw.map((conv: any) => {
    // Cria um objeto other_user seguro com valores padrão
    let other_user: Profile | undefined = undefined;
    
    if (conv.other_user) {
      other_user = {
        id: conv.other_user.id || '',
        primeiro_nome: conv.other_user.primeiro_nome || '',
        ultimo_nome: conv.other_user.ultimo_nome || '',
        email: conv.other_user.email || '',
        avatar_url: conv.other_user.avatar_url || null,
        username: conv.other_user.username || null,
        telefone: conv.other_user.telefone || null,
        status: conv.other_user.status || 'offline',
        last_seen_at: conv.other_user.last_seen_at || new Date().toISOString(),
        empresa: conv.other_user.empresa || null,
        role: conv.other_user.role || 'user',
        display_name: conv.other_user.display_name || `${conv.other_user.primeiro_nome || ''} ${conv.other_user.ultimo_nome || ''}`.trim(),
        has_existing_conversation: conv.other_user.has_existing_conversation || false,
        conversation_id: conv.other_user.conversation_id || null
      };
    }

    return {
      id: conv.id || '',
      created_at: conv.created_at || new Date().toISOString(),
      updated_at: conv.updated_at || new Date().toISOString(),
      property_id: conv.property_id || '',
      agent_id: conv.agent_id || '',
      client_id: conv.client_id || '',
      property: conv.property || { id: '', title: '' },
      agent: conv.agent || { id: '', primeiro_nome: '', ultimo_nome: '', email: '', avatar_url: null },
      client: conv.client || { id: '', primeiro_nome: '', ultimo_nome: '', email: '', avatar_url: null },
      other_user
    };
  });

  const { data: serverMessagesRaw = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => selectedConversation?.id ? getMessages(selectedConversation.id) : [],
    enabled: !!selectedConversation?.id && isOpen,
    staleTime: 1000 * 60 * 5,
  });

  // Mapeamento das mensagens do servidor
  const serverMessages: Message[] = (serverMessagesRaw || []).map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    created_at: msg.created_at,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    read_by_receiver: msg.read_by_receiver || false,
    profiles: msg.sender ? {
      id: msg.sender.id || '',
      primeiro_nome: msg.sender.primeiro_nome || '',
      ultimo_nome: msg.sender.ultimo_nome || '',
      email: msg.sender.email || '',
      avatar_url: msg.sender.avatar_url || null,
    } : undefined,
  }));

  const allMessages = [...serverMessages, ...localMessages]
    .reduce((acc: Message[], msg) => {
      if (!acc.some(m => m.id === msg.id)) acc.push(msg);
      return acc;
    }, [])
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowConversationMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pusher subscription
  useEffect(() => {
    if (!selectedConversation?.id || !isOpen) return;
    
    const channelName = `chat-${selectedConversation.id}`;
    const channel = pusherClient.subscribe(channelName);
    
    const handleNewMessage = (newMessage: Message) => {
      setLocalMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      setLocalMessages(prev => [...prev, newMessage]);
      
      queryClient.setQueryData<Message[]>(['messages', selectedConversation.id], (old = []) => {
        if (old.some(msg => msg.id === newMessage.id)) return old;
        return [...old, newMessage];
      });
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };
    
    channel.bind('new-message', handleNewMessage);
    
    return () => {
      channel.unbind('new-message', handleNewMessage);
      pusherClient.unsubscribe(channelName);
    };
  }, [selectedConversation?.id, isOpen, queryClient]);

  // Scroll automático quando mensagens mudam
  useEffect(() => {
    if (allMessages.length > 0 && messagesContainerRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [allMessages]);

  // Deteção de mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Posição inicial
  useEffect(() => {
    if (isOpen && !isMobile) {
      setPosition({ 
        x: window.innerWidth - 800 - 20, 
        y: window.innerHeight - 600 - 20 
      });
    }
  }, [isOpen, isMobile]);

  // Auto-redirect para contactos se não houver conversas
  useEffect(() => {
    if (isOpen && conversationsData.length === 0 && currentView === 'conversations') {
      setCurrentView('contacts');
    }
  }, [isOpen, conversationsData.length, currentView]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!headerRef.current?.contains(e.target as Node) || isMobile) return;
    const rect = chatRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDragging(true);
    setDragOffset({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  }, [isMobile]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isMobile) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const maxX = window.innerWidth - (isMobile ? 0 : 800);
    const maxY = window.innerHeight - (isMinimized ? 60 : 600);
    
    requestAnimationFrame(() => {
      setPosition({ 
        x: Math.max(0, Math.min(newX, maxX)), 
        y: Math.max(0, Math.min(newY, maxY)) 
      });
    });
  }, [isDragging, dragOffset, isMinimized, isMobile]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

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

  // Handlers de navegação
  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setCurrentView('chat');
    setLocalMessages(localMessagesMap[conversation.id] || []);
    setShowConversationMenu(null);
  };

  const handleBackToConversations = () => {
    if (selectedConversation) {
      setLocalMessagesMap(prev => ({ 
        ...prev, 
        [selectedConversation.id]: localMessages 
      }));
    }
    setSelectedConversation(null);
    setCurrentView('conversations');
    setLocalMessages([]);
  };

  const handleLeaveConversation = () => {
    handleBackToConversations();
  };

  const handleShowContacts = () => {
    setCurrentView('contacts');
    setContactsPage(1);
    setContactsSearch('');
  };

  const handleBackFromContacts = () => {
    setCurrentView('conversations');
    setContactsPage(1);
    setContactsSearch('');
  };

  const handleContactClick = async (contact: Profile) => {
    try {
      let conversationId = contact.conversation_id;

      // Se não existe conversa, criar uma nova
      if (!conversationId) {
        const newConversation = await createDirectConversation(userId, contact.id);
        conversationId = newConversation.id;
      }

      // Criar objeto de conversa
      const conversation: Conversation = {
        id: conversationId!,
        agent_id: userId,
        client_id: contact.id,
        property_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        agent: {
          id: userId,
          primeiro_nome: 'Você',
          ultimo_nome: '',
          email: '',
          avatar_url: null
        },
        client: {
          id: contact.id,
          primeiro_nome: contact.primeiro_nome,
          ultimo_nome: contact.ultimo_nome,
          email: contact.email,
          avatar_url: contact.avatar_url
        },
        property: {
          id: '',
          title: 'Conversa Direta'
        }
      };

      setSelectedConversation(conversation);
      setCurrentView('chat');
      setLocalMessages([]);

      // Atualizar queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });

    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      alert('Erro ao iniciar conversa. Tente novamente.');
    }
  };

  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!confirm('Tem certeza que deseja eliminar esta conversa?')) {
      return;
    }

    try {
      await deleteConversation(conversationId);
      
      // Se a conversa eliminada é a atual, voltar para conversas
      if (selectedConversation?.id === conversationId) {
        handleBackToConversations();
      }
      
      // Atualizar a lista de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      setShowConversationMenu(null);
      
    } catch (error) {
      console.error('Erro ao eliminar conversa:', error);
      alert('Erro ao eliminar conversa. Tente novamente.');
    }
  };

  const handleLoadMoreContacts = () => {
    if (contactsData?.hasMore) {
      setContactsPage(prev => prev + 1);
    }
  };

  // CORREÇÃO: Função handleRefresh corrigida
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Usando invalidateQueries em vez de refetch diretamente para evitar problemas de tipo
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      if (selectedConversation?.id) {
        await queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
      }
      
      if (currentView === 'contacts') {
        await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }
      
      // Forçar um refetch manual se necessário
      await refetchConversations();
      
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation?.id || isSending) return;
    
    const originalText = messageText;
    setMessageText('');
    setIsSending(true);
    
    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempMessageId,
      content: originalText,
      created_at: new Date().toISOString(),
      conversation_id: selectedConversation.id,
      sender_id: userId,
      read_by_receiver: false,
      profiles: { 
        id: userId, 
        primeiro_nome: 'Você', 
        ultimo_nome: '', 
        email: '', 
        avatar_url: null 
      }
    };
    
    setLocalMessages(prev => [...prev, optimisticMessage]);
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversation_id: selectedConversation.id, 
          sender_id: userId, 
          content: originalText 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar mensagem');
      
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
      
    } catch (error) {
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setMessageText(originalText);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally { 
      setIsSending(false); 
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleConversationMenu = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowConversationMenu(showConversationMenu === conversationId ? null : conversationId);
  };

  // Filtros
  const filteredConversations = conversationsData.filter(conv =>
    conv.property?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.client?.primeiro_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.client?.ultimo_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user?.primeiro_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user?.ultimo_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className={`fixed z-[9999] bg-white shadow-2xl border border-gray-200 transition-all duration-150
        ${isDragging ? 'cursor-grabbing' : 'cursor-auto'}
        ${isMinimized ? (isMobile ? 'w-full h-14' : 'w-80 h-14') : (isMobile ? 'w-full h-full' : 'w-[800px] h-[600px]')}
        ${isMobile ? 'left-0 top-0 rounded-none' : 'rounded-xl'}`}
      style={{ 
        left: isMobile ? 0 : `${position.x}px`, 
        top: isMobile ? 0 : `${position.y}px`, 
        userSelect: isDragging ? 'none' : 'auto' 
      }}
    >
      {/* Header */}
      <div 
        ref={headerRef} 
        className={`flex items-center justify-between p-4 bg-purple-700 text-white ${isMobile ? '' : 'rounded-t-xl'} ${isDragging ? 'cursor-grabbing' : (isMobile ? '' : 'cursor-grab')}`} 
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          {(isMobile && (currentView === 'chat' || currentView === 'contacts')) && (
            <button 
              onClick={currentView === 'chat' ? handleBackToConversations : handleBackFromContacts} 
              className="p-1 hover:bg-purple-600 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <MessageSquare className="w-6 h-6" />
          <span className="font-semibold text-base">
            {isMinimized ? 'Chat' : 
             currentView === 'chat' ? 
               `${selectedConversation?.client.primeiro_nome || selectedConversation?.other_user?.primeiro_nome || 'Utilizador'} ${selectedConversation?.client.ultimo_nome || selectedConversation?.other_user?.ultimo_nome || ''}` :
             currentView === 'contacts' ? 'Novos Contactos' : 'Mensagens'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {currentView === 'conversations' && conversationsData.length > 0 && (
            <button 
              onClick={handleShowContacts}
              className="p-2 hover:bg-purple-600 rounded transition-colors"
              title="Nova Conversa"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={handleRefresh} 
            className="p-2 hover:bg-purple-600 rounded transition-colors disabled:opacity-50"
            disabled={isRefreshing}
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="p-2 hover:bg-purple-600 rounded transition-colors" 
            title={isMinimized ? 'Maximizar' : 'Minimizar'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-purple-600 rounded transition-colors" 
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className={`flex ${isMobile ? 'h-[calc(100vh-56px)]' : 'h-[544px]'}`}>
          {/* CONVERSATIONS VIEW */}
          {currentView === 'conversations' && (!isMobile || !selectedConversation) && (
            <div className={`bg-white border-r border-gray-200 ${isMobile ? 'w-full' : 'w-[350px]'} flex flex-col`}>
              {/* Barra de pesquisa */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar conversas..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" 
                  />
                </div>
              </div>

              {/* Lista de conversas */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map(conversation => (
                    <div 
                      key={conversation.id} 
                      onClick={() => handleConversationClick(conversation)} 
                      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors relative ${
                        selectedConversation?.id === conversation.id ? 'bg-purple-50 border-purple-200' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          {conversation.client?.avatar_url || conversation.other_user?.avatar_url ? (
                            <img 
                              src={conversation.client?.avatar_url || conversation.other_user?.avatar_url || ''} 
                              alt={conversation.client?.primeiro_nome || conversation.other_user?.primeiro_nome}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-orange-500" />
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900 text-sm truncate max-w-[140px]">
                            {conversation.property?.title || "Conversa Direta"}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {conversation.updated_at && new Date(conversation.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate max-w-[180px]">
                          {conversation.client ? 
                            `${conversation.client.primeiro_nome} ${conversation.client.ultimo_nome}` : 
                            conversation.other_user ?
                            `${conversation.other_user.primeiro_nome} ${conversation.other_user.ultimo_nome}` :
                            "Utilizador"}
                        </p>
                      </div>
                      
                      {/* Menu de opções da conversa */}
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={(e) => toggleConversationMenu(conversation.id, e)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {showConversationMenu === conversation.id && (
                          <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={(e) => handleDeleteConversation(conversation.id, e)}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                    <Users className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-sm text-center mb-2">Nenhuma conversa encontrada</p>
                    <p className="text-xs text-center mb-4">Inicie uma nova conversa com outros utilizadores</p>
                    <button 
                      onClick={handleShowContacts}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Nova Conversa
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTACTS VIEW */}
          {currentView === 'contacts' && (
            <div className={`bg-white ${isMobile ? 'w-full' : 'w-[350px]'} flex flex-col`}>
              {/* Barra de pesquisa de contactos */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar contactos..." 
                    value={contactsSearch} 
                    onChange={(e) => {
                      setContactsSearch(e.target.value);
                      setContactsPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" 
                  />
                </div>
              </div>

              {/* Lista de contactos */}
              <div ref={contactsContainerRef} className="flex-1 overflow-y-auto">
                {contactsLoading && contactsPage === 1 ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                  </div>
                ) : contactsData?.contacts && contactsData.contacts.length > 0 ? (
                  <>
                    {contactsData.contacts.map((contact) => (
                      <div 
                        key={contact.id} 
                        onClick={() => handleContactClick(contact)}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            {contact.avatar_url ? (
                              <img 
                                src={contact.avatar_url} 
                                alt={contact.display_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-orange-500" />
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                              {contact.display_name}
                            </h4>
                            {contact.has_existing_conversation && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                Conversa
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate max-w-[180px]">
                            {contact.empresa || contact.role || 'Utilizador'}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Botão Carregar Mais */}
                    {contactsData.hasMore && (
                      <div className="p-4 border-t border-gray-200">
                        <button 
                          onClick={handleLoadMoreContacts}
                          disabled={contactsLoading}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                        >
                          {contactsLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                          ) : (
                            <Users className="w-4 h-4 inline mr-2" />
                          )}
                          {contactsLoading ? 'A carregar...' : 'Ver Mais Contactos'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum contacto encontrado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHAT VIEW */}
          {currentView === 'chat' && selectedConversation && (
            <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : ''}`}>
              {/* Header do chat - REORGANIZADO */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Botão voltar à esquerda */}
                  <button onClick={handleBackToConversations} className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    {selectedConversation.client?.avatar_url || selectedConversation.other_user?.avatar_url ? (
                      <img 
                        src={selectedConversation.client?.avatar_url || selectedConversation.other_user?.avatar_url || ''} 
                        alt={selectedConversation.client?.primeiro_nome || selectedConversation.other_user?.primeiro_nome}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  
                  {/* Informações do contacto */}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.client?.primeiro_nome || selectedConversation.other_user?.primeiro_nome} {selectedConversation.client?.ultimo_nome || selectedConversation.other_user?.ultimo_nome}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {selectedConversation.property?.title || 'Mensagem Direta'}
                    </p>
                  </div>
                </div>
                
                {/* Menu de opções no chat */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => toggleConversationMenu(selectedConversation.id, e)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {showConversationMenu === selectedConversation.id && (
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={(e) => handleDeleteConversation(selectedConversation.id, e)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar Conversa
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mensagens */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {allMessages.length > 0 ? (
                  allMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm transition-all duration-200 ${
                        message.sender_id === userId 
                          ? 'bg-purple-700 text-white rounded-br-none' 
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                      } ${message.id.includes('temp') ? 'opacity-80' : ''}`}>
                        <p className="break-words">{message.content}</p>
                        <div className={`text-xs mt-1 text-right ${
                          message.sender_id === userId ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {message.id.includes('temp') && ' ⏳'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma mensagem ainda</p>
                      <p className="text-xs">Envie a primeira mensagem!</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensagem */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea 
                      value={messageText} 
                      onChange={(e) => setMessageText(e.target.value)} 
                      onKeyDown={handleKeyPress} 
                      placeholder="Digite sua mensagem..." 
                      className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" 
                      rows={1}
                      disabled={isSending} 
                    />
                  </div>
                  <button 
                    onClick={handleSendMessage} 
                    className="p-3 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSending || !messageText.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraggableChat;