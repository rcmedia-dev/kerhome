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
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessages } from '@/lib/actions/message-action';
import { pusherClient } from '@/lib/pusher-client';

interface Agent { id: string; primeiro_nome: string; ultimo_nome: string; email: string; avatar_url: string | null; }
interface Client { id: string; primeiro_nome: string; ultimo_nome: string; email: string; avatar_url: string | null; }
interface Property { id: string; title: string; }
interface Conversation {
  id: string;
  agent_id: string;
  client_id: string;
  property_id: string;
  created_at: string;
  agent: Agent;
  client: Client;
  property: Property;
}
interface Message {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  profiles?: { id: string; primeiro_nome: string; ultimo_nome: string; email: string; avatar_url: string | null; };
}
interface Position { x: number; y: number; }
interface DraggableChatProps { isOpen: boolean; onClose: () => void; userId: string; }

const DraggableChat: React.FC<DraggableChatProps> = ({ isOpen, onClose, userId }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'conversations' | 'chat'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [localMessagesMap, setLocalMessagesMap] = useState<Record<string, Message[]>>({});

  const queryClient = useQueryClient();
  const chatRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: conversationsRaw = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(userId),
    enabled: isOpen,
  });

  // 🔹 Normalizando para nunca ter null
  const conversationsData: Conversation[] = conversationsRaw.map((conv) => ({
    id: conv.id,
    created_at: conv.created_at,
    property_id: conv.property_id,
    agent_id: conv.agent_id,
    client_id: conv.client_id,
    property: conv.property ?? { id: '', title: '' },
    agent: conv.agent ?? { id: '', primeiro_nome: '', ultimo_nome: '', email: '', avatar_url: null },
    client: conv.client ?? { id: '', primeiro_nome: '', ultimo_nome: '', email: '', avatar_url: null },
  }));

  const { data: serverMessagesRaw = [] } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => selectedConversation?.id ? getMessages(selectedConversation.id) : [],
    enabled: !!selectedConversation?.id && isOpen,
    staleTime: 1000 * 60 * 5,
  });

  // 🔹 Mapeamento das mensagens do servidor para garantir sender_id e compatibilidade com Message[]
  const serverMessages: Message[] = serverMessagesRaw.map(msg => ({
    ...msg,
    sender_id: msg.sender?.id || '',
    profiles: {
      id: msg.sender?.id || '',
      primeiro_nome: msg.sender?.primeiro_nome || '',
      ultimo_nome: msg.sender?.ultimo_nome || '',
      email: msg.sender?.email || '',
      avatar_url: msg.sender?.avatar_url || null,
    },
  }));

  const allMessages = [...serverMessages, ...localMessages]
    .reduce((acc: Message[], msg) => {
      if (!acc.some(m => m.id === msg.id)) acc.push(msg);
      return acc;
    }, [])
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

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

  // 🔹 Scroll automático quando mensagens mudam
  useEffect(() => {
    if (allMessages.length > 0 && messagesContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [allMessages]);

  // 🔹 Scroll automático ao selecionar conversa
  useEffect(() => {
    if (selectedConversation && allMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedConversation, allMessages.length]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && !isMobile) {
      setPosition({ x: window.innerWidth - 360 - 20, y: window.innerHeight - 500 - 20 });
    }
  }, [isOpen, isMobile]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!headerRef.current?.contains(e.target as Node) || isMobile) return;
    const rect = chatRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [isMobile]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isMobile) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const maxX = window.innerWidth - 360;
    const maxY = window.innerHeight - (isMinimized ? 60 : 500);
    requestAnimationFrame(() => {
      setPosition({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) });
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

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setCurrentView('chat');
    setLocalMessages(localMessagesMap[conversation.id] || []);
  };

  const handleBackToConversations = () => {
    if (selectedConversation) {
      setLocalMessagesMap(prev => ({ ...prev, [selectedConversation.id]: localMessages }));
    }
    setCurrentView('conversations');
    setSelectedConversation(null);
    setLocalMessages([]);
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
      profiles: { id: userId, primeiro_nome: 'Você', ultimo_nome: '', email: '', avatar_url: null }
    };
    setLocalMessages(prev => [...prev, optimisticMessage]);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selectedConversation.id, sender_id: userId, content: originalText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar mensagem');
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
    } catch (error) {
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setMessageText(originalText);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally { setIsSending(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversationsData.filter(conv =>
    conv.property?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className={`fixed z-[9999] bg-white shadow-2xl border border-purple-200 transition-all duration-150
        ${isDragging ? 'cursor-grabbing' : 'cursor-auto'}
        ${isMinimized ? (isMobile ? 'w-full h-14' : 'w-80 h-14') : (isMobile ? 'w-full h-[100vh]' : 'w-80 h-[500px]')}
        ${isMobile ? 'left-0 top-0 rounded-none' : 'rounded-xl'}`}
      style={{ left: isMobile ? 0 : `${position.x}px`, top: isMobile ? 0 : `${position.y}px`, userSelect: isDragging ? 'none' : 'auto' }}
    >
      {/* Header */}
      <div ref={headerRef} className={`flex items-center justify-between p-3 bg-purple-700 text-white ${isMobile ? '' : 'rounded-t-xl'} ${isDragging ? 'cursor-grabbing' : (isMobile ? '' : 'cursor-grab')}`} onMouseDown={handleMouseDown}>
        <div className="flex items-center gap-2">
          {currentView === 'chat' && !isMinimized && (
            <button onClick={handleBackToConversations} className="p-1 hover:bg-purple-600 rounded transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold text-sm truncate max-w-[150px] sm:max-w-[200px]">
            {isMinimized ? 'Chat' : currentView === 'chat' ? `${selectedConversation?.client.primeiro_nome} ${selectedConversation?.client.ultimo_nome}` : 'Mensagens'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-purple-600 rounded transition-colors" title={isMinimized ? 'Maximizar' : 'Minimizar'}>
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-purple-600 rounded transition-colors" title="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className={`flex flex-col ${isMobile ? 'h-[calc(100vh-56px)]' : 'h-[456px]'}`}>
          {currentView === 'conversations' ? (
            <>
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="Pesquisar conversas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? filteredConversations.map(conversation => (
                  <div key={conversation.id} onClick={() => handleConversationClick(conversation)} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
                    <div className="relative">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-700" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex flex-col items-start">
                        <h4 className="font-medium text-gray-900 text-sm truncate max-w-full">{conversation.property?.title || "Sem título"}</h4>
                        <span className="text-xs text-gray-500 truncate max-w-full">{conversation.client ? `${conversation.client.primeiro_nome} ${conversation.client.ultimo_nome}` : "Cliente desconhecido"}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma conversa encontrada</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {allMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm transition-all duration-200 ${message.sender_id === userId ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-900'} ${message.id.includes('temp') ? 'opacity-80' : ''}`}>
                      <p>{message.content}</p>
                      <div className={`text-xs mt-1 ${message.sender_id === userId ? 'text-purple-200' : 'text-gray-500'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.id.includes('temp') && ' ⏳'}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={handleKeyPress} placeholder="Digite sua mensagem..." className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" rows={1} disabled={isSending} />
                  </div>
                  <button onClick={handleSendMessage} className="p-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSending || !messageText.trim()}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DraggableChat;
