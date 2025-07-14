'use server'

import bcrypt from 'bcrypt'
import prisma from '../prisma'
import { Plano, PlanoAgente } from '../types/plan'

interface LoginResult {
  success: boolean
  error?: string
  user?: {
    id: string
    email: string
    primeiro_nome?: string | null
    ultimo_nome?: string | null
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
    role?: string | null
  }
}


export async function login(formData: FormData): Promise<LoginResult> {

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      success: false,
      error: 'Preencha todos os campos obrigatórios.',
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      pacote_agente: true, // <- isso traz os dados do plano
    },
  })


  if (!user) {
    return {
      success: false,
      error: 'Usuário não encontrado.',
    }
  }

  const passwordIsValid = await bcrypt.compare(password, user.password)
  if (!passwordIsValid) {
    return {
      success: false,
      error: 'Senha incorreta.',
    }
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      primeiro_nome: user.primeiro_nome,
      ultimo_nome: user.ultimo_nome,
      username: user.username,
      telefone: user.telefone,
      empresa: user.empresa,
      licenca: user.licenca,
      website: user.website,
      facebook: user.facebook,
      linkedin: user.linkedin,
      instagram: user.instagram,
      youtube: user.youtube,
      sobre_mim: user.sobre_mim,
      pacote_agente: user.pacote_agente
       ? {
          ...user.pacote_agente,
          nome: user.pacote_agente.nome as Plano, // <- conversão correta
            criadoEm: user.pacote_agente.criadoEm.toISOString(),     // ← string
            atualizadoEm: user.pacote_agente.atualizadoEm.toISOString(),
        }
      : null,
    },
  }
}
