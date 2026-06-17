'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircleQuestion, Send, X, Loader2, Sparkles,
  MapPin, Bed, Bath, Maximize2, Tag, ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const QUICK_QUESTIONS = [
  'Qual a distância do centro?',
  'Aceita animais de estimação?',
  'Tem mobilha incluída?',
  'Qual o condomínio?',
  'Está disponível para visita?',
];

export function PropertyAiChat({
  property,
  className,
}: {
  property: any;
  className?: string;
  variant?: 'modal' | 'bubble'; // kept for compatibility, always uses split modal now
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Tira as tuas dúvidas sobre este imóvel. Podes usar as perguntas rápidas abaixo ou escrever a tua própria pergunta.`
      }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
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

      const res = await fetch('/api/mywai/property-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          propertyContext: context,
          propertyId: property.id,
          history: messages.map(m => ({ role: m.role, content: m.content })),
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

  const propertyImage = property.image ||
    (Array.isArray(property.gallery) && property.gallery.length > 0 ? property.gallery[0] : null);

  const propertyHref = property.slug
    ? `/propriedades/${property.slug}`
    : `/propriedades/${property.id}`;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
            style={{ minHeight: '540px' }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-105"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* ── LEFT: Property Summary ── */}
            <div className="md:w-[340px] shrink-0 flex flex-col bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-900 text-white md:rounded-l-3xl rounded-t-3xl md:rounded-tr-none overflow-hidden">
              {/* Image */}
              <div className="relative h-48 md:h-52 shrink-0 overflow-hidden">
                {propertyImage ? (
                  <Image
                    src={propertyImage}
                    alt={property.title || 'Imóvel'}
                    fill
                    unoptimized={true}
                    priority
                    className="object-cover"
                    sizes="340px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center">
                    <Maximize2 className="w-12 h-12 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                {/* Status badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${property.status === 'comprar' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                    {property.status === 'comprar' ? 'À Venda' : 'Arrendar'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
                <div>
                  <h2 className="font-bold text-lg leading-tight text-white line-clamp-2">
                    {property.title || 'Imóvel sem título'}
                  </h2>
                  {(property.bairro || property.cidade) && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-white/70 text-sm">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{[property.bairro, property.cidade].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="bg-white/10 rounded-2xl px-4 py-3">
                  <p className="text-xs text-white/60 mb-0.5">Preço</p>
                  <p className="text-xl font-bold text-white">
                    Kz {Number(property.price || 0).toLocaleString()}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {property.bedrooms != null && (
                    <div className="bg-white/10 rounded-xl p-2.5 text-center">
                      <Bed className="w-4 h-4 text-white/70 mx-auto mb-1" />
                      <p className="text-sm font-bold">{property.bedrooms}</p>
                      <p className="text-[10px] text-white/50">Quartos</p>
                    </div>
                  )}
                  {property.bathrooms != null && (
                    <div className="bg-white/10 rounded-xl p-2.5 text-center">
                      <Bath className="w-4 h-4 text-white/70 mx-auto mb-1" />
                      <p className="text-sm font-bold">{property.bathrooms}</p>
                      <p className="text-[10px] text-white/50">Banhos</p>
                    </div>
                  )}
                  {(property.size || property.area_terreno) && (
                    <div className="bg-white/10 rounded-xl p-2.5 text-center">
                      <Maximize2 className="w-4 h-4 text-white/70 mx-auto mb-1" />
                      <p className="text-sm font-bold">{property.size || property.area_terreno}</p>
                      <p className="text-[10px] text-white/50">m²</p>
                    </div>
                  )}
                </div>

                {/* Tipo */}
                {property.tipo && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="capitalize">{property.tipo}</span>
                  </div>
                )}

                {/* Link to full page */}
                <Link
                  href={propertyHref}
                  onClick={handleClose}
                  className="mt-auto flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver página completa
                </Link>
              </div>
            </div>

            {/* ── RIGHT: Chat ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Perguntar à IA</h3>
                  <p className="text-xs text-gray-500">Tira dúvidas sobre este imóvel</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 mr-2 mt-0.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 mr-2 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick questions */}
              {messages.length <= 2 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-[11px] px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full border border-purple-200 transition-colors font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                    placeholder="Faz uma pergunta sobre este imóvel..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl transition-all active:scale-95 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md transition-all active:scale-95 cursor-pointer ${className || 'px-5 py-3 rounded-xl text-sm'}`}
      >
        <Sparkles className="w-5 h-5" />
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
