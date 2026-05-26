'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Calendar, BarChart3, MessageCircleQuestion, FileText, ThumbsUp, MessageSquare, CalendarDays, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const smallPaths = [
  'M235,120c-72,0-130,58-130,130v30',
  'M369,250c0-74-60-134-134-134s-134,60-134,134v30',
  'M305,250c0-39-31-70-70-70s-70,31-70,70v30',
  'M235,120c-16,0-32,2-48,5',
  'M369,250c0-12-2-24-5-36',
  'M130,355c-10-16-17-34-21-52',
  'M365,290c4,10,6,21,6,32',
  'M260,400c-8,3-16,5-25,5',
  'M290,393c14-8,27-18,38-30',
  'M175,390c-18-14-33-32-44-52',
];

export function MywaiAgent({ isOpen, onClose }: Props) {
  const [phase, setPhase] = useState<'ready' | 'chat'>('ready');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPhase('ready');
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (phase === 'chat' && textareaRef.current) textareaRef.current.focus();
  }, [phase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const tutorialCards = useMemo(() => [
    { icon: Home, title: 'Pesquisar Imóveis', desc: 'Encontra imóveis por descrição, localização ou características', reply: 'Ótimo! O que estás à procura? Diz-me a localização, tipo de imóvel, orçamento e outras preferências.', color: 'from-emerald-500 to-teal-500' },
    { icon: Calendar, title: 'Agendar Visitas', desc: 'Marca visitas a imóveis de forma rápida e prática', reply: 'Claro! Diz-me qual imóvel tens interesse em visitar e qual a melhor data e hora para ti.', color: 'from-teal-500 to-cyan-500' },
    { icon: BarChart3, title: 'Comparar Imóveis', desc: 'Compara preços, áreas e características lado a lado', reply: 'Boa! Escolhe dois ou mais imóveis que queiras comparar que eu mostro as diferenças lado a lado.', color: 'from-cyan-500 to-blue-500' },
    { icon: MessageCircleQuestion, title: 'Tirar Dúvidas', desc: 'Esclarece questões sobre processos de compra, venda ou arrendamento', reply: 'Estou aqui para ajudar! Pergunta-me o que quiseres sobre compra, venda ou arrendamento.', color: 'from-emerald-500 to-emerald-600' },
  ], []);

  const handleCardClick = useCallback((reply: string) => {
    setPhase('chat');
    setMessages([
      { role: 'assistant', content: reply },
    ]);
  }, []);

  const handleActionClick = useCallback((msg: string) => {
    setInput(msg);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Compreendo! Como posso ajudar-te mais com isso?',
      }]);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/mywai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: userMsg.content }),
      });

      if (!res.ok) throw new Error('Erro');

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || data.description || 'Obrigado pela tua pergunta! Estou aqui para ajudar.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpa, ocorreu um erro. Tenta novamente.',
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <>
      <AnimatePresence mode="popLayout">
        {isOpen && (
          <motion.div
            key="full"
            className="fixed bottom-24 right-6 z-[9999] w-[380px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-160px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-emerald-100"
          >
            {phase === 'ready' ? (
              <>
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <svg width="22" height="22" viewBox="0 0 463 463" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round">
                        {smallPaths.map((d, i) => <path key={i} d={d} />)}
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white">MYWAI</h3>
                      <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                        Agente Inteligente
                      </span>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <motion.div
                  key="tutorial"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="flex-1 flex flex-col overflow-y-auto min-h-[560px]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="px-8 pt-6 pb-2 text-center"
                  >
                    <h4 className="text-lg font-semibold text-gray-800">
                      Olá! Sou o <span className="text-emerald-600">MYWAI</span>
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">O teu assistente inteligente dentro do Kercasa</p>
                  </motion.div>

                  <div className="flex-1 px-6 py-3 flex flex-col gap-2 content-start">
                    {tutorialCards.map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.12, duration: 0.4, ease: 'easeOut' }}
                        onClick={() => handleCardClick(item.reply)}
                        className="group flex flex-row items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                          <item.icon size={18} className="text-white" />
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-gray-800">{item.title}</h5>
                          <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <svg width="22" height="22" viewBox="0 0 463 463" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round">
                        {smallPaths.map((d, i) => <path key={i} d={d} />)}
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white">MYWAI</h3>
                      <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                        Online
                      </span>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <motion.div
                  key="chat"
                  initial={{ opacity: 0, scale: 0.88, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.7 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <svg width="40" height="40" viewBox="0 0 463 463" fill="none" stroke="#059669" strokeWidth="18" strokeLinecap="round" className="mb-3 opacity-60">
                          {smallPaths.map((d, i) => <path key={i} d={d} />)}
                        </svg>
                        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                          Como posso ajudar-te hoje? Pergunta-me sobre imóveis, agendamentos ou qualquer outra coisa.
                        </p>
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none'
                          }`}
                        >
                          {msg.content || (
                            <div className="flex gap-1 py-1">
                              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 pt-2 border-t border-gray-100 shrink-0">
                    <div className="flex items-end gap-2 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all duration-200 bg-white">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Fala comigo..."
                        rows={1}
                        disabled={isLoading}
                        className="flex-1 resize-none text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent leading-relaxed max-h-32 disabled:opacity-50"
                        style={{ scrollbarWidth: 'thin' }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 active:scale-95 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg width="18" height="18" viewBox="0 0 463 463" fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round">
                          {smallPaths.slice(0, 5).map((d, i) => <path key={i} d={d} />)}
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
