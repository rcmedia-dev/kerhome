export interface Profile {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  avatar_url: string | null;
  username: string | null;
  telefone: string | null;
  status: string;
  last_seen_at: string;
  empresa: string | null;
  role: string;
  display_name: string;
  has_existing_conversation: boolean;
  conversation_id: string | null;
}

export interface Contact {
  contacts: Profile[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface Agent { 
  id: string; 
  primeiro_nome: string; 
  ultimo_nome: string; 
  email: string; 
  avatar_url: string | null; 
}

export interface Client { 
  id: string; 
  primeiro_nome: string; 
  ultimo_nome: string; 
  email: string; 
  avatar_url: string | null; 
}

export interface Property { 
  id: string; 
  title: string; 
}

export interface Conversation {
  id: string;
  agent_id: string;
  client_id: string;
  property_id: string;
  created_at: string;
  updated_at: string;
  agent: Agent;
  client: Client;
  property: Property;
  other_user?: Profile;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  read_by_receiver: boolean;
  profiles?: { 
    id: string; 
    primeiro_nome: string; 
    ultimo_nome: string; 
    email: string; 
    avatar_url: string | null; 
  };
}

export interface Position { 
  x: number; 
  y: number; 
}

export interface DraggableChatProps { 
  isOpen: boolean; 
  onClose: () => void; 
  userId: string; 
}

export type ViewType = 'conversations' | 'chat' | 'contacts';