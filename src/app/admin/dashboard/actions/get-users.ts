'use server';

import { createClient } from "@/lib/supabase/server";

export interface User {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  role: 'admin' | 'agent' | string;
  username: string;
  telefone: string;
  empresa: string;
  status: 'active' | 'offline' | string;
  licenca: string;
  website: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  sobre_mim: string;
  created_at: string;
  updated_at: string;
}

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      primeiro_nome,
      ultimo_nome,
      email,
      role,
      username,
      telefone,
      empresa,
      status,
      licenca,
      website,
      facebook,
      linkedin,
      instagram,
      youtube,
      sobre_mim,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar usuários: ${error.message}`);
  }

  return data || [];
}

export async function getUsersById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      primeiro_nome,
      ultimo_nome,
      email,
      role,
      username,
      telefone,
      empresa,
      status,
      licenca,
      website,
      facebook,
      linkedin,
      instagram,
      youtube,
      sobre_mim,
      created_at,
      updated_at
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar usuário: ${error.message}`);
  }

  return data || null;
}
