/**
 * Constantes da aplicação
 * Centralizar valores que são replicados em vários arquivos
 */

// ========== TIPOS DE PROPRIEDADE ==========
export const PROPERTY_TYPES = ['Apartamento', 'Casa', 'Prédio', 'Vivenda'] as const;
export type PropertyType = typeof PROPERTY_TYPES[number];

// ========== STATUS DE PROPRIEDADE ==========
export const PROPERTY_STATUS = ['arrendar', 'comprar'] as const;
export type PropertyStatus = typeof PROPERTY_STATUS[number];

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  arrendar: 'Para Arrendar',
  comprar: 'Para Comprar',
};

// ========== APROVAÇÃO DE PROPRIEDADE ==========
export const APPROVAL_STATUS = ['pendente', 'aprovado', 'rejeitado'] as const;
export type ApprovalStatus = typeof APPROVAL_STATUS[number];

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  aprovado: 'bg-green-100 text-green-800',
  rejeitado: 'bg-red-100 text-red-800',
};

// ========== MOEDAS ==========
export const CURRENCIES = ['Kwanza', 'Dólar', 'Euro'] as const;
export type Currency = typeof CURRENCIES[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  'Kwanza': 'Kz',
  'Dólar': '$',
  'Euro': '€',
};

export const CURRENCY_CODES: Record<Currency, string> = {
  'Kwanza': 'AOA',
  'Dólar': 'USD',
  'Euro': 'EUR',
};

// ========== TIPOS DE PREÇO ==========
export const PRICE_CALL_OPTIONS = ['Preço Fixo', 'Preço Negociável', 'Sob Consulta'] as const;
export type PriceCallOption = typeof PRICE_CALL_OPTIONS[number];

// ========== CARACTERÍSTICAS DE PROPRIEDADE ==========
export const PROPERTY_FEATURES = [
  'Piscina',
  'Academia',
  'Garagem',
  'Elevador',
  'Portaria 24h',
  'Churrasqueira',
  'Salão de Festas',
  'Quadra Esportiva',
  'Varanda',
  'Jardim',
  'Mobiliado',
  'Ar Condicionado',
  'Aquecimento',
  'Cozinha Equipada',
] as const;

export type PropertyFeature = typeof PROPERTY_FEATURES[number];

// ========== PAPÉIS DE USUÁRIO ==========
export const USER_ROLES = ['admin', 'agent', 'user'] as const;
export type UserRole = typeof USER_ROLES[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  agent: 'Agente Imobiliário',
  user: 'Utilizador',
};

// ========== STATUS DE USUÁRIO ==========
export const USER_STATUS = ['active', 'inactive', 'pending', 'banned'] as const;
export type UserStatus = typeof USER_STATUS[number];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  banned: 'Bloqueado',
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  banned: 'bg-red-100 text-red-800',
};

// ========== PÁGINAS E ROTAS ==========
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROPERTIES: '/propriedades',
  AGENTS: '/agentes',
  ABOUT: '/sobre',
  CONTACT: '/contato',
  BLOG: '/blog',
  POLICY: '/policy',
  TERMS: '/terms',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// ========== PAGINATION ==========
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  LIMITS: [10, 20, 50, 100] as const,
} as const;

// ========== CACHE DURATIONS ==========
export const CACHE_DURATION = {
  SHORT: 2 * 60 * 1000, // 2 minutos
  MEDIUM: 5 * 60 * 1000, // 5 minutos
  LONG: 15 * 60 * 1000, // 15 minutos
  VERY_LONG: 1 * 60 * 60 * 1000, // 1 hora
  DAY: 24 * 60 * 60 * 1000, // 24 horas
} as const;

// ========== VALIDAÇÃO ==========
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 255,
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 5000,
} as const;

// ========== ERROS ==========
export const ERRORS = {
  GENERIC: 'Ocorreu um erro. Tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  AUTH: 'Autenticação falhou. Faça login novamente.',
  UNAUTHORIZED: 'Você não tem permissão para acessar isso.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER_ERROR: 'Erro no servidor. Tente mais tarde.',
  VALIDATION: 'Por favor, verifique os dados fornecidos.',
} as const;

// ========== MENSAGENS DE SUCESSO ==========
export const SUCCESS_MESSAGES = {
  SAVED: 'Dados salvos com sucesso!',
  DELETED: 'Item deletado com sucesso!',
  CREATED: 'Item criado com sucesso!',
  UPDATED: 'Item atualizado com sucesso!',
  LOGIN: 'Bem-vindo!',
  LOGOUT: 'Sessão encerrada com sucesso.',
} as const;

// ========== IMAGENS PADRÃO ==========
export const DEFAULT_IMAGES = {
  PROPERTY_PLACEHOLDER: '/images/placeholder-property.jpg',
  USER_PLACEHOLDER: '/images/placeholder-user.jpg',
  NO_IMAGE: '/images/no-image.jpg',
} as const;

// ========== DIMENSÕES DE IMAGEM ==========
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150 },
  SMALL: { width: 300, height: 300 },
  MEDIUM: { width: 600, height: 400 },
  LARGE: { width: 1200, height: 800 },
  HERO: { width: 1920, height: 1080 },
} as const;

// ========== TIMEOUTS ==========
export const TIMEOUTS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000,
} as const;
