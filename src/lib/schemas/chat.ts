import { z } from 'zod';

// Profile/User Schema
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  primeiro_nome: z.string().min(1),
  ultimo_nome: z.string().min(1),
  email: z.string().email(),
  avatar_url: z.string().url().nullable().optional(),
  username: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  status: z.enum(['online', 'offline', 'away']).default('offline'),
  last_seen_at: z.coerce.date().optional(),
  empresa: z.string().nullable().optional(),
  role: z.enum(['user', 'agent', 'admin']).default('user'),
  display_name: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Message Status
export const MessageStatusSchema = z.enum(['pending', 'sent', 'delivered', 'read', 'error']);
export type MessageStatus = z.infer<typeof MessageStatusSchema>;

// Message Schema
export const MessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional(),
  read_by_receiver: z.boolean().default(false),
  read_at: z.coerce.date().nullable().optional(),
  delivered_at: z.coerce.date().nullable().optional(),
  status: MessageStatusSchema.default('sent'),
  retryCount: z.number().int().min(0).default(0),
  sender: ProfileSchema.optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// Create Message Input
export const CreateMessageSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
  conversation_id: z.string().uuid(),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;

// Conversation Schema
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  user1_id: z.string().uuid().optional(),
  user2_id: z.string().uuid().optional(),
  agent_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  property_id: z.string().uuid().nullable().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  other_user: ProfileSchema.nullable().optional(),
  agent: ProfileSchema.optional(),
  client: ProfileSchema.optional(),
  property: z.object({
    id: z.string().uuid(),
    title: z.string(),
  }).nullable().optional(),
  unread_count: z.number().int().min(0).default(0),
  last_message: MessageSchema.optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// Create Conversation Input
export const CreateConversationSchema = z.object({
  user2_id: z.string().uuid().optional(),
  agent_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional(),
});

export type CreateConversation = z.infer<typeof CreateConversationSchema>;

// Contact/Search Schema
export const ContactSchema = ProfileSchema.extend({
  has_existing_conversation: z.boolean().default(false),
  conversation_id: z.string().uuid().nullable().optional(),
});

export type Contact = z.infer<typeof ContactSchema>;

// Paginated Response
export const PaginatedSchema = z.object({
  data: z.array(z.unknown()),
  page: z.number().int().min(1),
  per_page: z.number().int().min(1),
  total: z.number().int().min(0),
  total_pages: z.number().int().min(0),
  has_more: z.boolean(),
});

// Batch Message Update
export const BatchUpdateMessageStatusSchema = z.object({
  conversation_id: z.string().uuid(),
  message_ids: z.array(z.string().uuid()).min(1),
  status: MessageStatusSchema,
});

export type BatchUpdateMessageStatus = z.infer<typeof BatchUpdateMessageStatusSchema>;
