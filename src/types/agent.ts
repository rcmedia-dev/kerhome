/**
 * Tipos relacionados a Agentes de Imóveis
 */
import type { Dispatch, SetStateAction } from 'react';

export interface AgentProfile {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  avatar_url?: string | null;
  sobre_mim?: string | null;
  telefone?: string | null;
  empresa?: string | null;
  licenca?: string | null;
  website?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AgentProperty {
  id: string;
  title: string;
  description?: string;
  image?: string | null;
  gallery?: string[];
  price?: number | null;
  preco?: string; // Formatado para exibição
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  endereco?: string;
  status: 'para comprar' | 'para arrendar';
  ownerId: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentStats {
  propertiesSold: number;
  yearsExperience: number;
  clientSatisfaction: number;
  averageDaysOnMarket: number;
}

export interface AgentContextType {
  profile: AgentProfile | null;
  agentStats: AgentStats;
  agentProperties: AgentProperty[];
  isLoading: boolean;
  error: string | null;
}

export interface PropertiesTabProps {
  agentProperties: AgentProperty[];
  onOpenMessageBox?: () => void;
}

export interface AboutTabProps {
  profile: AgentProfile | null;
  agentStats: AgentStats;
}

export interface HeroSectionProps {
  profile: AgentProfile | null;
  agentStats: AgentStats;
}

export interface MessageSystemProps {
  profile: AgentProfile | null;
  showMessageBox?: boolean;
  message?: string;
  setMessage?: Dispatch<SetStateAction<string>>;
  isSending?: boolean;
  onSendMessage?: () => Promise<void> | void;
  onCloseMessageBox?: () => void;
}

export interface SidebarProps {
  profile: AgentProfile | null;
  agentStats: AgentStats;
  onOpenMessageBox?: () => void;
}

export interface MainContentProps {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  profile: AgentProfile | null;
  agentProperties: AgentProperty[];
  agentStats: AgentStats;
  onOpenMessageBox?: () => void;
}
