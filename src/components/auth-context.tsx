'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

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

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  setUser: () => {},
  updateUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const client = new QueryClient()

  const supabase = createClient()

  // 🔑 Pega a sessão atual e escuta mudanças
  useEffect(() => {
    let isMounted = true // Para evitar state updates em componentes desmontados

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          if (isMounted) setIsLoading(false)
          return
        }

        if (session?.user && isMounted) {
          await fetchUserProfile(session.user.id)
        } else if (isMounted) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error in auth initialization:', error)
        if (isMounted) setIsLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          // Não redirecionar automaticamente para a página inicial
          // Isso causa loops de redirecionamento em páginas públicas
          // router.push('/')
        }
        
        if (isMounted) setIsLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router])

  // 🔎 Busca perfil completo do utilizador
  const fetchUserProfile = async (userId: string) => {
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

      setUser({
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
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Não fazer logout automático - isso causa o problema de redirecionamento
      // await supabase.auth.signOut()
    } finally {
      setIsLoading(false)
    }
  }

  // ✏️ Atualiza dados do utilizador
  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return

    try {
      setUser({ ...user, ...updates })

      await supabase
        .from('profiles')
        .update({
          primeiro_nome: updates.primeiro_nome,
          ultimo_nome: updates.ultimo_nome,
          username: updates.username,
          role: updates.role,
        })
        .eq('id', user.id)
    } catch (error) {
      console.error('Error updating user:', error)
      setUser(user) // Revert changes on error
    }
  }

  // 🚪 Logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <QueryClientProvider client={client}>
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