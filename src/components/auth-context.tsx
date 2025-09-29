'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// =======================
// Tipos
// =======================
interface PlanoAgente {
  id: string
  nome: string
  limite: number
  restante: number
  destaques: boolean
  destaques_permitidos: number
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  primeiro_nome: string
  ultimo_nome: string
  username?: string | null
  telefone?: string | null
  empresa?: string | null
  licenca?: string | null
  website?: string | null
  facebook?: string | null
  linkedin?: string | null
  instagram?: string | null
  youtube?: string | null
  sobre_mim?: string | null
  pacote_agente?: PlanoAgente | null
  avatar_url?: string | null
  role?: string | null
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  setUser: (user: UserProfile | null) => void
  updateUser: (updates: Partial<UserProfile>) => void
}

// =======================
// Contexto
// =======================
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  setUser: () => {},
  updateUser: () => {},
})

const queryClient = new QueryClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // 🔎 Busca perfil no banco
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          pacote_agente:planos_agente(*)
        `)
        .eq('id', userId)
        .single()

      if (error || !profile) {
        throw error || new Error('Profile not found')
      }

      const formattedUser: UserProfile = {
        id: userId,
        email: profile.email || '',
        primeiro_nome: profile.primeiro_nome || '',
        ultimo_nome: profile.ultimo_nome || '',
        username: profile.username || null,
        telefone: profile.telefone || null,
        empresa: profile.empresa || null,
        licenca: profile.licenca || null,
        website: profile.website || null,
        facebook: profile.facebook || null,
        linkedin: profile.linkedin || null,
        instagram: profile.instagram || null,
        youtube: profile.youtube || null,
        sobre_mim: profile.sobre_mim || null,
        pacote_agente: profile.pacote_agente || null,
        role: profile.role || null,
        avatar_url: profile.avatar_url || null,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }

      return formattedUser
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      return null
    }
  }

  // 🚀 Inicialização
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        // 1️⃣ Tenta recuperar do localStorage
        const cached = localStorage.getItem('user-profile')
        if (cached && isMounted) {
          setUser(JSON.parse(cached))
          setIsLoading(false)
        }

        // 2️⃣ Pega sessão atual do Supabase
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          if (profile && isMounted) {
            setUser(profile)
            localStorage.setItem('user-profile', JSON.stringify(profile))
          }
        } else if (isMounted) {
          setUser(null)
        }
      } catch (err) {
        console.error('❌ Auth init error:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initializeAuth()

    // 🔔 Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        if (profile) {
          setUser(profile)
          localStorage.setItem('user-profile', JSON.stringify(profile))
        }
      } else {
        setUser(null)
        localStorage.removeItem('user-profile')
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ✏️ Atualiza perfil no state + banco
  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return

    try {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user-profile', JSON.stringify(updatedUser))

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
    } catch (error) {
      console.error('❌ Error updating user:', error)
      setUser(user) // rollback
    }
  }

  // 🚪 Logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem('user-profile')
      router.push('/')
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, isLoading, signOut, setUser, updateUser }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
