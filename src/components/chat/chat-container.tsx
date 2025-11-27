'use client';

import React, { useRef, Suspense } from 'react';
import { useChatStore } from '@/hooks/useChatStore';
import { useChatDrag } from '@/hooks/useChatDrag';
import { ConversationsView } from '@/components/chat/conversations-view';
import { ChatView } from '@/components/chat/chat-view';
import { ContactsView } from '@/components/chat/contacts-view';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import styles from './chat-container.module.css';

export function ChatContainer() {
  const {
    isOpen,
    isMinimized,
    currentView,
    position,
    isMobile,
    setIsOpen,
    toggleMinimize,
    userId,
  } = useChatStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const { handleMouseDown, isDragging } = useChatDrag({ isMobile, isMinimized });

  if (!isOpen || !userId) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    toggleMinimize();
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      data-testid="chat-container"
    >
      {/* Header */}
      <div
        className={styles.header}
        onMouseDown={handleMouseDown}
        data-testid="chat-header"
      >
        <h2 className={styles.title}>KerChat</h2>
        <div className={styles.actions}>
          <button
            onClick={handleMinimize}
            className={styles.iconButton}
            title={isMinimized ? 'Expandir' : 'Minimizar'}
            aria-label={isMinimized ? 'Expandir chat' : 'Minimizar chat'}
          >
            {isMinimized ? (
              <Maximize2 size={18} />
            ) : (
              <Minimize2 size={18} />
            )}
          </button>
          <button
            onClick={handleClose}
            className={styles.iconButton}
            title="Fechar"
            aria-label="Fechar chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <Suspense fallback={<div className={styles.content}>Carregando...</div>}>
          <div className={styles.content}>
            {currentView === 'conversations' && <ConversationsView />}
            {currentView === 'chat' && <ChatView />}
            {currentView === 'contacts' && <ContactsView />}
          </div>
        </Suspense>
      )}
    </div>
  );
}
