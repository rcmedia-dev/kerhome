'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'


export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let redirectTo: string | null = null

  try {
    if (!email || !password) {
      console.error('Email ou senha não fornecidos')
      redirectTo = '/error'
      return
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('Erro no login:', error.message)
      redirectTo = '/error'
      return
    }
    if (!data.user) {
      console.error('Usuário não autenticado')
      redirectTo = '/error'
      return
    }

    // login bem sucedido
    redirectTo = '/dashboard'
  } catch (err) {
    console.error('Exceção inesperada no login:', err)
    redirectTo = '/error'
  } finally {
    if (redirectTo) {
      revalidatePath('/', 'layout') // se precisar invalidar cache
      redirect(redirectTo)
    }
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!firstName || !lastName || !email || !password) {
    redirect('/error')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  })

  if (error) {
    console.error('Erro no signup:', error.message)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}