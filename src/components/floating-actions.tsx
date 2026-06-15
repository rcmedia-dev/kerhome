'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleMore, MessageSquareText, X, Bot } from 'lucide-react';
import { VirtualAssistant } from './virtual-assistant';
import { useChatStore } from '@/lib/store/chat-store';

export default function FloatingActions() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const { toggleChat, totalUnreadCount, isDashboardMessages } = useChatStore();

  if (isDashboardMessages) return null;

  const handleOpenAssistant = () => {
    setAssistantOpen(true);
    setMenuOpen(false);
  };

  const handleOpenMessages = () => {
    toggleChat();
    setMenuOpen(false);
  };

  return (
    <>
      <VirtualAssistant isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />

      <div className="fixed md:bottom-6 bottom-24 right-6 z-[9999] flex flex-col items-center">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 mb-3"
            >
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-3 justify-end w-full"
              >
                <span className="text-sm font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap select-none">
                  Chat de Mensagens
                </span>
                <button
                  onClick={handleOpenMessages}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white shadow-lg border-2 border-white flex items-center justify-center shrink-0"
                  aria-label="Chat de Mensagens"
                >
                  <MessageSquareText className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  )}
                </button>
              </motion.div>

              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.05 }}
                className="flex items-center gap-3 justify-end w-full"
              >
                <span className="text-sm font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap select-none">
                  Chatbot de Suporte
                </span>
                <button
                  onClick={handleOpenAssistant}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white shadow-lg border-2 border-white flex items-center justify-center shrink-0"
                  aria-label="Chatbot de Suporte"
                >
                  <Bot className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setMenuOpen(prev => !prev)}
          animate={{ rotate: isMenuOpen ? 180 : 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white shadow-floating border-2 border-white flex items-center justify-center"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMenuOpen ? <X size={24} /> : <MessageCircleMore size={24} />}
        </motion.button>
      </div>
    </>
  );
}
