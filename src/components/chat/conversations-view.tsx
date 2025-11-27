'use client';

import React, { Suspense } from 'react';
import { useChatStore } from '@/hooks/useChatStore';
import { useConversations } from '@/hooks/useChatQueries';
import { MessageCircle } from 'lucide-react';
import styles from './conversations-view.module.css';

function ConversationsContent() {
  const {
    userId,
    conversations,
    selectedConversation,
    searchTerm,
    setSearchTerm,
    setSelectedConversation,
    setCurrentView,
  } = useChatStore();

  const { isLoading } = useConversations(userId);

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user?.display_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    setCurrentView('chat');
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Carregando conversas...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Buscar conversa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />
      </div>

      {filteredConversations.length === 0 ? (
        <div className={styles.empty}>
          <MessageCircle size={32} />
          <p>Nenhuma conversa</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`${styles.item} ${
                selectedConversation?.id === conversation.id
                  ? styles.active
                  : ''
              }`}
            >
              <div className={styles.avatar}>
                {conversation.other_user?.avatar_url ? (
                  <img
                    src={conversation.other_user.avatar_url}
                    alt={conversation.other_user.display_name}
                  />
                ) : (
                  <div className={styles.placeholder}>
                    {conversation.other_user?.primeiro_nome?.[0]}
                  </div>
                )}
              </div>
              <div className={styles.content}>
                <h3 className={styles.name}>
                  {conversation.other_user?.display_name}
                </h3>
                {conversation.unread_count > 0 && (
                  <span className={styles.badge}>
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ConversationsView() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConversationsContent />
    </Suspense>
  );
}
