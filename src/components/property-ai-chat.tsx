'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleQuestion, Send, X, Loader2, Sparkles } from 'lucide-react';

const QUICK_QUESTIONS = [
  'Qual a distância do centro?',
  'Aceita animais de estimação?',
  'Tem mobilha incluída?',
  'Qual o condomínio?',
  'Está disponível para visita?',
];

export function PropertyAiChat({ property, className, variant = 'modal' }: { property: any; className?: string; variant?: 'modal' | 'bubble' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Olá! Posso responder perguntas sobre **${property.title || 'este imóvel'}**. O que gostarias de saber?`
      }]);
    }
  }, [isOpen, property.title, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) return;
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({ top: rect.top, left: rect.left, width: rect.width });
      }
    };

    // Use capture: true to catch scrolls on any container, not just window
    window.addEventListener('scroll', updatePosition, { capture: true, passive: true });
    window.addEventListener('resize', updatePosition);

    updatePosition();

    return () => {
      window.removeEventListener('scroll', updatePosition, { capture: true });
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleOpen = (e: React.MouseEvent) => {
    if (isOpen) {
      handleClose();
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPosition({ top: rect.top, left: rect.left, width: rect.width });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPosition(null);
  };

  const handleSend = async (question: string) => {
    const q = question.trim();
    if (!q || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    setIsLoading(true);

    try {
      const context = [
        `Título: ${property.title || ''}`,
        `Descrição: ${property.description || ''}`,
        `Tipo: ${property.tipo || ''}`,
        `Preço: Kz ${Number(property.price).toLocaleString()}`,
        `Localização: ${property.endereco || ''}, ${property.bairro || ''}, ${property.cidade || ''}`,
        `Quartos: ${property.bedrooms || '?'}`,
        `Banheiros: ${property.bathrooms || '?'}`,
        `Área: ${property.size || property.area_terreno || '?'} m²`,
        `Características: ${Array.isArray(property.caracteristicas) ? property.caracteristicas.join(', ') : ''}`,
      ].filter(Boolean).join('\n');

      const res = await fetch('/api/mywai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          propertyContext: context,
          propertyId: property.id,
        }),
      });

      if (!res.ok) throw new Error('Falha ao responder');

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || data.response || 'Não consegui processar essa pergunta. Tenta reformular.'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpa, não consegui responder agora. Tenta novamente mais tarde.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all active:scale-95 ${className || 'px-5 py-3 rounded-xl text-sm'}`}
      >
        <Sparkles className="w-4 h-4" />
        Perguntar à IA
      </button>

      <AnimatePresence>
        {isOpen && variant === 'modal' && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-lg max-h-[85vh] sm:h-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {renderContent()}
            </motion.div>
          </div>
        )}

        {isOpen && variant === 'bubble' && position && (
          <div
            ref={bubbleRef}
            className="fixed z-[9999]"
            style={{
              top: position.top,
              left: Math.max(16, position.left - 120 + position.width / 2),
              transform: 'translateY(-100%) translateY(-12px)',
            }}
          >
            {/* Arrow pointing down to the card */}
            <div className="relative">
              <div
                className="absolute left-[120px] -bottom-2 w-4 h-4 bg-white rotate-45 shadow-[3px_3px_6px_rgba(0,0,0,0.08)]"
                style={{ marginLeft: -8 }}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-[340px] sm:w-[380px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
              >
                {renderContent()}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  function renderContent() {
    return (
      <>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
              <MessageCircleQuestion className="w-4 h-4 text-purple-700" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-gray-900">Perguntar à IA</h3>
              <p className="text-[10px] text-gray-500 truncate">{property.title}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-black/5 rounded-full transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[300px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 2 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-[10px] px-2.5 py-1.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 text-gray-600 rounded-full border border-gray-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(input)}
              placeholder="Pergunta sobre este imóvel..."
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </>
    );
  }
}
