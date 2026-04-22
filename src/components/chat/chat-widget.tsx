import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChatWindow } from './chat-window';
import { ChatList } from './chat-list';
import { UserSearch } from './user-search';
import { useChatStore } from '@/lib/store/chat-store';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserStore } from '@/lib/store/user-store';

export function ChatWidget() {
    const { isOpen, toggleChat, view, setView } = useChatStore();
    const { user } = useUserStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    drag
                    dragMomentum={false}
                    dragElastic={0.1}
                    className="fixed bottom-4 right-4 w-[calc(100vw-32px)] sm:w-96 h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 z-[9999] font-sans cursor-move"
                >
                    {view === 'list' && <ChatList />}
                    {view === 'search' && <UserSearch />}
                    {view === 'chat' && <ChatWindow onClose={toggleChat} />}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

