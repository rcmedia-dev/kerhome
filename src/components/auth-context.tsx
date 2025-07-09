"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getSession, onAuthStateChange } from "@/lib/supabase-auth";

export type AuthUser = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicializa do localStorage para evitar flicker/logout em navegação client-side
  const [user, setUserState] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kerhome_user');
      if (stored) return JSON.parse(stored);
    }
    return null;
  });

  useEffect(() => {
    // Sempre tenta restaurar sessão do Supabase
    getSession().then(({ data }) => {
      const session = data?.session;
      if (session?.user) {
        const u = session.user;
        setUserState({
          id: u.id,
          email: u.email!,
          first_name: u.user_metadata?.first_name,
          last_name: u.user_metadata?.last_name,
          avatar_url: u.user_metadata?.avatar_url,
          role: u.role || "free",
        });
      }
    });
    // Escuta mudanças de autenticação
    const { data: listener } = onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUserState({
          id: u.id,
          email: u.email!,
          first_name: u.user_metadata?.first_name,
          last_name: u.user_metadata?.last_name,
          avatar_url: u.user_metadata?.avatar_url,
          role: u.role || "free",
        });
      } else {
        // Só faz logout se não houver usuário no localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('kerhome_user');
          if (!stored) setUserState(null);
        } else {
          setUserState(null);
        }
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Persistência no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("kerhome_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("kerhome_user");
      }
    }
  }, [user]);

  const setUser = (user: AuthUser | null) => {
    setUserState(user);
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("kerhome_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("kerhome_user");
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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
