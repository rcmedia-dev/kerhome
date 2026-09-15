'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleMore, MessageSquareText, X, Bot, MessageSquare } from 'lucide-react';
import { VirtualAssistant } from './virtual-assistant';
import { useChatStore } from '@/lib/store/chat-store';
import { FeedbackDialog } from './feedback-dialog';

const PROMPT_INTERVAL_MS = 3 * 60 * 1000

export default function FloatingActions() {
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isPromptExpanded, setPromptExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toggleChat, totalUnreadCount, isDashboardMessages } = useChatStore();

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const updateViewport = () => setIsMobile(mediaQuery.matches)

    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)

    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    if (isMenuOpen || isMobile) {
      setPromptExpanded(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setPromptExpanded((prev) => !prev)
    }, PROMPT_INTERVAL_MS)

    return () => window.clearTimeout(timeoutId)
  }, [isMenuOpen, isMobile, isPromptExpanded])

  const handleCloseFeedback = () => {
    setFeedbackOpen(false)
  }

  if (isDashboardMessages) return null;

  // Só renderiza na página inicial do site
  if (pathname !== '/') return null;

  const handleOpenAssistant = () => {
    setAssistantOpen(true);
    setMenuOpen(false);
  };

  const handleOpenMessages = () => {
    toggleChat();
    setMenuOpen(false);
  };

  const handleOpenFeedback = () => {
    setFeedbackOpen(true);
    setMenuOpen(false);
  };

  return (
    <>
      <VirtualAssistant isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />
      <FeedbackDialog isOpen={isFeedbackOpen} onClose={handleCloseFeedback} />

      <div className="fixed md:bottom-6 bottom-28 right-5 z-[9999] flex flex-col items-center">
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

              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                className="flex items-center gap-3 justify-end w-full"
              >
                <span className="text-sm font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap select-none">
                  Central de Feedback
                </span>
                <button
                  onClick={handleOpenFeedback}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white shadow-lg border-2 border-white flex items-center justify-center shrink-0"
                  aria-label="Central de Feedback"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-end">
          {!isMobile && (
            <motion.div
              initial={false}
              animate={{
                width: isMenuOpen ? 0 : isPromptExpanded ? 180 : 0,
                opacity: isMenuOpen ? 0 : isPromptExpanded ? 1 : 0,
                x: isMenuOpen ? 20 : isPromptExpanded ? 0 : 14,
              }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              className="pointer-events-auto overflow-hidden"
              onClick={() => setMenuOpen(prev => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setMenuOpen(prev => !prev);
                }
              }}
              aria-label="Abrir opções de ajuda"
            >
              <div className="flex items-center justify-center rounded-full border border-white/30 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_25px_rgba(109,40,217,0.35)] backdrop-blur-sm whitespace-nowrap cursor-pointer select-none">
                Precisa de ajuda?
              </div>
            </motion.div>
          )}

          <motion.button
            onClick={() => setMenuOpen(prev => !prev)}
            animate={{ rotate: isMenuOpen ? 180 : 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative z-10 ml-[-8px] w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white shadow-floating border-2 border-white flex items-center justify-center"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X size={24} /> : <MessageCircleMore size={24} />}
            {isMobile && !isMenuOpen && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg"
              >
                1
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
}
