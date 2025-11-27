'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useChatStore } from './useChatStore';
import {
  getConversations,
  getMessages,
  getContacts,
} from '@/lib/functions/message-action';
import { ConversationSchema, MessageSchema, ContactSchema } from '@/lib/schemas/chat';

export function useConversations(userId: string | null) {
  const { setConversations, setIsLoadingConversations } = useChatStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      setIsLoadingConversations(true);
      try {
        const raw = await getConversations(userId!);
        // Convertir Date strings to strings si es necesario
        const normalized = raw.map((r: any) => ({
          ...r,
          updated_at: typeof r.updated_at === 'string' ? r.updated_at : r.updated_at?.toISOString?.() || new Date().toISOString(),
        }));
        setConversations(normalized);
        return normalized;
      } finally {
        setIsLoadingConversations(false);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return { conversations: data || [], isLoading, error, refetch };
}

export function useMessages(conversationId: string | null) {
  const { setMessages, setIsLoadingMessages, messages } = useChatStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      setIsLoadingMessages(true);
      try {
        const raw = await getMessages(conversationId);
        const normalized = raw.map((r: any) => ({
          ...r,
          created_at: typeof r.created_at === 'string' ? r.created_at : r.created_at?.toISOString?.() || new Date().toISOString(),
        }));
        setMessages(conversationId, normalized);
        return normalized;
      } finally {
        setIsLoadingMessages(false);
      }
    },
    enabled: !!conversationId,
    staleTime: 0, // Messages sempre frescos
    gcTime: 1000 * 60 * 5,
  });

  const addMessage = useCallback(
    (message: any) => {
      if (!conversationId) return;

      queryClient.setQueryData(
        ['messages', conversationId],
        (old: any[] = []) => [...old, message]
      );
    },
    [conversationId, queryClient]
  );

  return {
    messages: messages[conversationId || ''] || data || [],
    isLoading,
    error,
    refetch,
    addMessage,
  };
}

export function useContacts(
  userId: string | null,
  page: number = 1,
  search: string = ''
) {
  const { setContacts, setIsLoadingContacts } = useChatStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['contacts', userId, page, search],
    queryFn: async () => {
      setIsLoadingContacts(true);
      try {
        const raw = await getContacts(userId!, page, 20, search);
        setContacts(raw.contacts);
        return {
          contacts: raw.contacts,
          total: raw.totalCount,
          totalPages: raw.totalPages,
          hasMore: raw.hasMore,
        };
      } finally {
        setIsLoadingContacts(false);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    contacts: data?.contacts || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
  };
}
