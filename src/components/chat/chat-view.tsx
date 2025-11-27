'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { useChatStore } from '@/hooks/useChatStore';
import { useMessages } from '@/hooks/useChatQueries';
import { Send } from 'lucide-react';
import styles from './chat-view.module.css';

function ChatContent() {
  const {
    selectedConversation,
    messageText,
    isSending,
    messages,
    currentUser,
    setMessageText,
    setIsSending,
    addMessage,
    setCurrentView,
  } = useChatStore();

  const { isLoading } = useMessages(selectedConversation?.id || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[selectedConversation?.id || '']]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || !currentUser) return;

    setIsSending(true);
    try {
      const newMessage = {
        id: Date.now().toString(),
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        content: messageText,
        created_at: new Date().toISOString(),
        status: 'pending' as const,
        retryCount: 0,
        read_by_receiver: false,
      };

      addMessage(selectedConversation.id, newMessage);
      setMessageText('');

      // Simular envio
      setTimeout(() => {
        // Aqui você chamaria a API para enviar
      }, 500);
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedConversation) {
    return (
      <div className={styles.empty}>
        <p>Selecione uma conversa para começar</p>
      </div>
    );
  }

  const conversationMessages = messages[selectedConversation.id] || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => setCurrentView('conversations')}
        >
          ← Voltar
        </button>
        <h2 className={styles.title}>
          {selectedConversation.other_user?.display_name}
        </h2>
      </div>

      <div className={styles.messagesContainer}>
        {isLoading ? (
          <div className={styles.loading}>Carregando mensagens...</div>
        ) : conversationMessages.length === 0 ? (
          <div className={styles.noMessages}>
            Nenhuma mensagem nesta conversa
          </div>
        ) : (
          <div className={styles.messages}>
            {conversationMessages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.sender_id === currentUser?.id
                    ? styles.sent
                    : styles.received
                }`}
              >
                <div className={styles.bubble}>
                  <p className={styles.text}>{message.content}</p>
                  <span className={styles.time}>
                    {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Digite uma mensagem..."
          disabled={isSending}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={!messageText.trim() || isSending}
          className={styles.sendButton}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export function ChatView() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ChatContent />
    </Suspense>
  );
}
