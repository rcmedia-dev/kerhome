'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  ArrowRight,
  X,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
} from 'lucide-react';
import {
  enviarMensagem,
  listarUsuariosQueMeEnviaramMensagens,
  obterHistoricoMensagens,
} from '@/lib/actions/message-action';
import { useAuth } from './auth-context';

type User = {
  id: string;
  nome: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
};

type Mensagem = {
  id: string;
  conteudo: string;
  deId: string;
  paraId: string;
  criadoEm: string;
};

export default function ModernChatInbox() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContato, setSelectedContato] = useState<User | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conteudo, setConteudo] = useState('');
  const [contatos, setContatos] = useState<User[]>([]);

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (!user?.id) return;
    const fetchContatos = async () => {
      const lista = await listarUsuariosQueMeEnviaramMensagens(user.id);
      const contatosConvertidos: User[] = lista.map((c) => ({
        ...c,
        status: c.status as 'online' | 'offline' | 'away',
        }));
      setContatos(contatosConvertidos);
    };
    fetchContatos();
  }, [user?.id]);

  const selecionarContato = async (contato: User) => {
    setSelectedContato(contato);
    const historico = await obterHistoricoMensagens(user!.id, contato.id);

     const mensagensConvertidas: Mensagem[] = historico.map((msg) => ({
    ...msg,
    criadoEm: msg.criadoEm.toISOString(), // ou .toString()
  }));

  setMensagens(mensagensConvertidas);
  };

  const enviar = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!conteudo.trim() || !selectedContato || !user?.id) return;

    const novaMsg = await enviarMensagem({
      deId: user.id,
      paraId: selectedContato.id,
      conteudo,
    });

     // Se a resposta for do tipo { sucesso, mensagem }:
  if (novaMsg.sucesso && novaMsg.mensagem) {
    const novaMensagem: Mensagem = {
      ...novaMsg.mensagem,
      criadoEm: novaMsg.mensagem.criadoEm.toISOString(), // ou .toString()
    };

    setMensagens((prev) => [...prev, novaMensagem]);
    setConteudo('');
  } else {
    // Lidar com erro, se quiser
    console.error(novaMsg.erro || 'Erro desconhecido ao enviar mensagem');
  }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline':
      default: return 'bg-gray-400';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleOpen}
          className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-105 transition"
        >
          <MessageCircle size={28} />
        </button>
      </div>

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[520px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 flex flex-col overflow-hidden animate-slide-up">
          {!selectedContato ? (
            <>
              {/* Lista de contatos */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">💬 Mensagens</h2>
                  <button onClick={toggleOpen} className="text-white/80 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {contatos.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => selecionarContato(user)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                  >
                    <div className="relative">
                      <div className="bg-gradient-to-br from-violet-400 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                        {user.nome.charAt(0)}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.nome}</p>
                      <p className="text-xs text-gray-500">{user.lastSeen ?? ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Chat ativo */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedContato(null)} className="text-white/80 hover:text-white">
                      <ArrowRight size={20} className="rotate-180" />
                    </button>
                    <div className="relative">
                      <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {selectedContato.nome.charAt(0)}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedContato.status)}`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedContato.nome}</h3>
                      <p className="text-xs text-white/80">
                        {selectedContato.status === 'online' ? 'Online' : selectedContato.lastSeen}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-full transition">
                      <Phone size={16} />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition">
                      <Video size={16} />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Histórico de mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-white">
                {mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.deId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                        msg.deId === user?.id
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.conteudo}</p>
                      <p className="text-xs mt-1 text-right opacity-60">{formatTime(msg.criadoEm)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campo de envio */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition">
                    <Smile size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && enviar(e)}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    onClick={enviar}
                    disabled={!conteudo.trim()}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-3 rounded-full hover:from-violet-600 hover:to-purple-700 transition disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Animações e scrollbar personalizada */}
      <style jsx>{`
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slide-up {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
