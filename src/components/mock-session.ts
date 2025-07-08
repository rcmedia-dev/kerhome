// Mock de sessão fake para Header
export interface MockSessionUser {
  id: string
  email: string
  user_metadata?: {
    avatar_url?: string
    [key: string]: any
  }
}

export interface MockSession {
  user: MockSessionUser
}

export const mockSession: MockSession = {
  user: {
    id: '1',
    email: 'demo@kerhome.com',
    user_metadata: {
      avatar_url: '',
      first_name: 'Demo',
      last_name: 'User',
    },
  },
}

// Adiciona função para limpar sessão fake
type SetSessionFn = (session: MockSession | null) => void;

export let setMockSession: SetSessionFn = () => {};

export function registerSetMockSession(fn: SetSessionFn) {
  setMockSession = fn;
}
