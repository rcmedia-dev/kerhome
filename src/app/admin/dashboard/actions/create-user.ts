'use server'

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // 👈 precisa da chave service_role
)

interface CreateUserInput {
  email: string
  password: string
  primeiro_nome: string
  ultimo_nome: string
  telefone?: string | null
  role: 'Agente' | 'Administrador'
}

interface CreateUserResponse {
  success: boolean
  user?: {
    id: string
    email: string
    primeiro_nome: string
    ultimo_nome: string
    role: string
  }
  error?: string
}

export async function createUser(data: CreateUserInput): Promise<CreateUserResponse> {
  try {
    // 1. Criar utilizador no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Erro ao criar utilizador no Auth",
      }
    }

    const userId = authData.user.id

    // 2. Inserir dados na tabela profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email: data.email,
      primeiro_nome: data.primeiro_nome,
      ultimo_nome: data.ultimo_nome,
      telefone: data.telefone,
      role: data.role,
    })

    if (profileError) {
      // rollback → apagar o user no Auth se falhar
      await supabase.auth.admin.deleteUser(userId)
      return {
        success: false,
        error: "Erro ao criar perfil: " + profileError.message,
      }
    }

    return {
      success: true,
      user: {
        id: userId,
        email: data.email,
        primeiro_nome: data.primeiro_nome,
        ultimo_nome: data.ultimo_nome,
        role: data.role,
      },
    }
  } catch (err) {
    console.error("Erro inesperado:", err)
    return {
      success: false,
      error: "Erro inesperado ao criar utilizador",
    }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) throw error

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}