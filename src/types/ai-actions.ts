export interface SearchParams {
  tipo?: string;
  cidade?: string;
  bairro?: string;
  quartos?: number;
  quartos_min?: number;
  quartos_max?: number;
  banheiros?: number;
  garagens?: number;
  area_min?: number;
  area_max?: number;
  preco_min?: number;
  preco_max?: number;
  status?: string;
  q?: string;
}

export type AIActionType =
  | 'SEARCH_PROPERTIES'
  | 'SORT_PROPERTIES'
  | 'CLEAR_FILTERS'
  | 'CHANGE_VIEW'
  | 'CHAT';

export interface AIAction {
  type: AIActionType;
  params?: SearchParams;
  sortBy?: string;
  order?: 'asc' | 'desc';
  view?: 'grid' | 'list';
  description?: string;
}

export interface AIResponse {
  intent: 'property_search' | 'chat' | 'action';
  action: AIAction;
  message?: string;
  description?: string;
  confidence: number;
  count?: number;
  suggestions?: string[];
}

export interface Property {
  id: string;
  title: string;
  tipo: string;
  cidade: string;
  bairro?: string;
  bedrooms: number;
  bathrooms: number;
  garagens: number;
  area: number;
  price: number;
  status: string;
  description?: string;
  features: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
