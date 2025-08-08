'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageSquare, X, Send, Smile, Paperclip, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-context';
import Pusher from 'pusher-js';
import { toast } from 'sonner';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  chat_id: string;
  read: boolean;
};

type Contact = {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  avatar_url?: string;
};

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContacts, setShowContacts] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const pusherRef = useRef<Pusher | null>(null);


  useEffect(() => {
    if (!user?.id) return;

    const fetchContactsAndMessages = async () => {
      try {
        // Buscar mensagens do usuário
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        if (messagesData) {
          setMessages(messagesData);

          // Extrair IDs de contatos
          const contactIds = new Set<string>();
          messagesData.forEach((msg) => {
            if (msg.sender_id !== user.id) contactIds.add(msg.sender_id);
            if (msg.receiver_id !== user.id) contactIds.add(msg.receiver_id);
          });

          // Buscar informações dos contatos
          if (contactIds.size > 0) {
            const { data: contactsData, error: contactsError } = await supabase
              .from('profiles')
              .select('id, primeiro_nome, ultimo_nome')
              .in('id', Array.from(contactIds));

            if (contactsError) throw contactsError;
            if (contactsData) setContacts(contactsData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens/contatos:', error);
        toast.error('Erro ao carregar conversas');
      }
    };

    fetchContactsAndMessages();

    // Configurar Pusher para mensagens em tempo real
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    });

    const channel = pusherRef.current.subscribe('chat-channel');
    
    channel.bind('new_message', (newMessage: Message) => {
      // Verificar se a mensagem é relevante para o usuário atual
      if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
        setMessages(prev => [...prev, newMessage]);
      }
    });

    return () => {
      if (pusherRef.current) {
        channel.unbind_all();
        pusherRef.current.unsubscribe('chat-channel');
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [user?.id]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.id || !selectedContact || isSending) return;

    setIsSending(true);
    console.log('Enviando mensagem:', input, 'para', selectedContact);
    
    try {
      const newMessage = {
        chat_id: user.id,
        sender_id: user.id,
        receiver_id: selectedContact.id,
        content: input.trim(),
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();
      setInput('');
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
    setShowContacts(true);
  };

  const getLastMessageTime = (contactId: string) => {
    const contactMessages = messages.filter(msg => 
      msg.sender_id === contactId || msg.receiver_id === contactId
    );
    
    if (contactMessages.length === 0) return null;
    
    const lastMessage = contactMessages[contactMessages.length - 1];
    return new Date(lastMessage.created_at).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLastMessagePreview = (contactId: string) => {
    const contactMessages = messages.filter(msg => 
      msg.sender_id === contactId || msg.receiver_id === contactId
    );
    
    if (contactMessages.length === 0) return 'Nenhuma mensagem';
    
    const lastMessage = contactMessages[contactMessages.length - 1];
    return lastMessage.content.length > 20 
      ? `${lastMessage.content.substring(0, 20)}...` 
      : lastMessage.content;
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition"
          aria-label="Abrir chat"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-50 border border-white/20 flex flex-col"
          style={{ height: '600px' }}
        >
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              {selectedContact ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToContacts}
                    className="text-white hover:text-gray-200"
                    aria-label="Voltar para contatos"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="relative w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg font-semibold">
                    {selectedContact.avatar_url ? (
                      <Image
                        src={selectedContact.avatar_url}
                        alt={`${selectedContact.primeiro_nome} ${selectedContact.ultimo_nome}`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <>
                        {selectedContact.primeiro_nome.charAt(0)}
                        {selectedContact.ultimo_nome.charAt(0)}
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedContact.primeiro_nome} {selectedContact.ultimo_nome}
                    </h3>
                    <p className="text-white/70 text-sm">Online</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <MessageSquare size={24} />
                  <div>
                    <h3 className="font-semibold text-lg">Conversas</h3>
                    <p className="text-white/70 text-sm">
                      {contacts.length} {contacts.length === 1 ? 'contato' : 'contatos'}
                    </p>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-200"
                aria-label="Fechar chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Corpo - Lista de contatos ou mensagens */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50">
            {showContacts && !selectedContact ? (
              <div className="p-2">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        setShowContacts(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold">
                        {contact.avatar_url ? (
                          <Image
                            src={contact.avatar_url}
                            alt={`${contact.primeiro_nome} ${contact.ultimo_nome}`}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <>
                            {contact.primeiro_nome.charAt(0)}
                            {contact.ultimo_nome.charAt(0)}
                          </>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {contact.primeiro_nome} {contact.ultimo_nome}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {getLastMessagePreview(contact.id)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {getLastMessageTime(contact.id)}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-4">
                    <MessageSquare className="text-gray-300 mb-2" size={48} />
                    <p className="text-gray-400 text-center">
                      Nenhuma conversa encontrada
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                      Comece uma nova conversa
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                        msg.sender_id === user?.id
                          ? 'bg-blue-500 text-white self-end ml-auto'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.content}
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-4">
                    <MessageSquare className="text-gray-300 mb-2" size={48} />
                    <p className="text-gray-400 text-center">
                      Nenhuma mensagem com {selectedContact?.primeiro_nome}
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                      Envie uma mensagem para começar
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campo de entrada (só aparece quando um contato está selecionado) */}
          {selectedContact && (
            <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <div className="flex items-end gap-3">
                <button 
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Anexar arquivo"
                >
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`Digite uma mensagem para ${selectedContact.primeiro_nome}...`}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Emojis"
                  >
                    <Smile size={18} />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isSending}
                  className={`p-3 rounded-2xl hover:shadow-lg transition ${
                    input.trim() && !isSending
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Enviar mensagem"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}