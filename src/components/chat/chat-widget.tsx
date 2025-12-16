import React, { useEffect } from 'react';
import { ChatWindow } from './chat-window';
import { ChatList } from './chat-list';
import { UserSearch } from './user-search';
import { useChatStore } from '@/lib/store/chat-store';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserStore } from '@/lib/store/user-store';

export function ChatWidget() {
    const { isOpen, toggleChat, view, setView } = useChatStore();
    const { user } = useUserStore();

    // If chat is open but no user, strictly speaking we should probably show login or something,
    // but header handles login.
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    drag
                    dragMomentum={false}
                    dragElastic={0.1}
                    className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 z-50 font-sans cursor-move"
                // Use a specific handle if we want, but for now whole widget is fine or maybe just header??
                // Better to just make it draggable from anywhere or add dragListener={false} to children if needed.
                // For simply "draggable", this works.
                >
                    {view === 'list' && <ChatList />}
                    {view === 'search' && <UserSearch />}
                    {view === 'chat' && <ChatWindow onClose={toggleChat} />}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
