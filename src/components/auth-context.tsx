'use client';

import { PlanoAgente } from '@/lib/types/agent';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type AuthUser = {
  id: string;
  email?: string | null;
  primeiro_nome?: string | null;
  ultimo_nome?: string | null;
  username?: string | null;
  telefone?: string | null;
  empresa?: string | null;
  licenca?: string | null;
  website?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  sobre_mim?: string | null;
  pacote_agente?: PlanoAgente | null;
};

export type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kerhome_user');
      if (stored) return JSON.parse(stored);
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('kerhome_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('kerhome_user');
      }
    }
  }, [user]);

  const setUser = (user: AuthUser | null) => {
    setUserState(user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('kerhome_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('kerhome_user');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
