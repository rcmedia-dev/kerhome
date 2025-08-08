'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, X, Send, Smile, Paperclip, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-context';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

type Contact = {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
};

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContacts, setShowContacts] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchContactsAndMessages = async () => {
      // Busca todas as mensagens do usuário
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Erro ao buscar mensagens:', messagesError);
        return;
      }

      if (messagesData) {
        setMessages(messagesData);

        // Extrai todos os IDs únicos de contatos (removendo o próprio usuário)
        const contactIds = new Set<string>();
        messagesData.forEach((msg) => {
          if (msg.sender_id !== user.id) contactIds.add(msg.sender_id);
          if (msg.receiver_id !== user.id) contactIds.add(msg.receiver_id);
        });

        // Busca informações dos contatos
        if (contactIds.size > 0) {
          const { data: contactsData, error: contactsError } = await supabase
            .from('profiles')
            .select('id, primeiro_nome, ultimo_nome')
            .in('id', Array.from(contactIds));

          if (contactsError) {
            console.error('Erro ao buscar contatos:', contactsError);
          } else if (contactsData) {
            setContacts(contactsData);
          }
        }
      }
    };

    fetchContactsAndMessages();

    // Configura subscription para novas mensagens
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.id || !selectedContact) return;

    const newMessage = {
      chat_id: user.id,
      sender_id: user.id,
      receiver_id: selectedContact.id,
      content: input.trim(),
    };

    const { data, error } = await supabase.from('messages').insert([newMessage]).select();

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
    } else if (data && data.length > 0) {
      setMessages((prev) => [...prev, data[0]]);
      setInput('');
    }
  };

  const filteredMessages = selectedContact
    ? messages.filter(
        (msg) =>
          (msg.sender_id === user?.id && msg.receiver_id === selectedContact.id) ||
          (msg.receiver_id === user?.id && msg.sender_id === selectedContact.id)
      )
    : [];

  const handleBackToContacts = () => {
    setSelectedContact(null);
    setShowContacts(true);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-50 border border-white/20 flex flex-col animate-fadeIn"
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
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg font-semibold">
                    {selectedContact.primeiro_nome.charAt(0)}
                    {selectedContact.ultimo_nome.charAt(0)}
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
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
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
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold">
                        {contact.primeiro_nome.charAt(0)}
                        {contact.ultimo_nome.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {contact.primeiro_nome} {contact.ultimo_nome}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Última mensagem...
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">12:30</div>
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
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                        msg.sender_id === user?.id
                          ? 'bg-blue-500 text-white self-end ml-auto'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.content}
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
                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm bg-white/80"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Smile size={18} />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className={`p-3 rounded-2xl hover:shadow-lg ${
                    input.trim()
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}