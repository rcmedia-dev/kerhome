'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleMore, X } from 'lucide-react';
import { VirtualAssistant } from './virtual-assistant';
import { useChatStore } from '@/lib/store/chat-store';

export function AssistantLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDashboardMessages } = useChatStore();

  if (isDashboardMessages) return null;

  return (
    <>
      <VirtualAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        animate={{ rotate: isOpen ? 180 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed md:bottom-6 bottom-24 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white shadow-floating border-2 border-white flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageCircleMore size={24} />}
      </motion.button>
    </>
  );
}
