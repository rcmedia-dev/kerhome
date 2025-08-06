'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageSquare, X, ChevronLeft, Send, Smile, Paperclip } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from './auth-context';
import { supabase } from '@/lib/supabase';
import { io, Socket } from 'socket.io-client';

// Tipagem

type Profile = {
  id: string;
  name: string;
  avatar_url: string;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  chat_id: string;
};

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  // Iniciar conexão com socket
  useEffect(() => {
    if (!selectedUser || !chatId) return;

    fetch('/api/sockets/socket'); // Inicializa o servidor

    const socket = io(undefined, {
      path: '/api/sockets/socket',
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', chatId);
    });

    socket.on('receive_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, selectedUser]);

  // Buscar contatos que enviaram mensagens
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.id) return;

      setLoading(true);

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !messagesData) {
        console.error('Erro ao buscar mensagens:', error);
        setLoading(false);
        return;
      }

      const uniqueSenderIds = [...new Set(messagesData.map((m) => m.sender_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', uniqueSenderIds);

      if (profilesError || !profiles) {
        console.error('Erro ao buscar perfis:', profilesError);
        setLoading(false);
        return;
      }

      setContacts(profiles);
      setLoading(false);
    };

    if (user) fetchContacts();
  }, [user]);

  const openChatWith = async (contact: Profile) => {
    setSelectedUser(contact);
    setLoading(true);

    // Buscar ou criar chat
    const { data: existingChat } = await supabase
      .from('chats')
      .select('id')
      .eq('user_id', user!.id)
      .eq('agent_id', contact.id)
      .maybeSingle();

    let chatIdToUse = existingChat?.id;

    if (!chatIdToUse) {
      const { data: newChat } = await supabase
        .from('chats')
        .insert([{ user_id: user!.id, agent_id: contact.id, property_id: '123' }])
        .select()
        .single();

      chatIdToUse = newChat.id;
    }

    setChatId(chatIdToUse);

    const { data: msgs, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatIdToUse)
      .order('created_at', { ascending: true });

    if (error || !msgs) {
      console.error('Erro ao buscar mensagens da conversa:', error);
      setMessages([]);
    } else {
      setMessages(msgs);
    }

    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatId || !user || !selectedUser) return;

    const newMessage = {
      chat_id: chatId,
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: input,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([newMessage])
      .select()
      .single();

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
      return;
    }

    socketRef.current?.emit('send_message', data);
    setMessages((prev) => [...prev, data]);
    setInput('');
  };

  if (!user) return null;

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
              {selectedUser ? (
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedUser(null)}>
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-3">
                    <Image
                      src={selectedUser.avatar_url || '/avatar.jpg'}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-white/30"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                      <p className="text-white/70 text-sm">Online</p>
                    </div>
                  </div>
                </div>
              ) : (
                <h3 className="text-lg font-semibold">Mensagens</h3>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Corpo */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
            {loading ? (
              <p className="text-gray-500 text-sm">Carregando...</p>
            ) : selectedUser ? (
              messages.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma mensagem com este contato.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow ${
                      msg.sender_id === user.id
                        ? 'bg-blue-500 text-white self-end ml-auto'
                        : 'bg-gray-200 text-gray-800 self-start mr-auto'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className="text-[10px] text-gray-500 block mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => openChatWith(contact)}
                  className="flex items-center gap-4 w-full text-left hover:bg-gray-100 p-2 rounded-xl"
                >
                  <Image
                    src={contact.avatar_url || '/avatar.jpg'}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-white/30"
                  />
                  <div>
                    <h4 className="font-medium">{contact.name}</h4>
                    <p className="text-xs text-gray-500">Clique para ver conversa</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Campo de entrada */}
          <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
            <div className="flex items-end gap-3">
              <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                <Paperclip size={20} />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={selectedUser ? 'Digite uma mensagem...' : 'Selecione um contato'}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm bg-white/80"
                  disabled={!selectedUser}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Smile size={18} />
                </button>
              </div>
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl hover:shadow-lg"
                disabled={!selectedUser || !input.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animação */}
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
