import { supabase } from "@/lib/supabase";



type UserRole = 'admin' | 'agent' ; // Ajuste os valores conforme necessário
type UserStatus = 'active' | 'offline' | string; // Exemplo de status

export interface User {
  id: number;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  role: UserRole;
  username: string;
  telefone: string;
  empresa: string;
  status: UserStatus;
  licenca: string;
  website: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  sobre_mim: string;
  created_at: string; // ISO 8601 format, ex: "2025-08-22T14:55:00Z"
  updated_at: string;
}


export async function getUsers() {
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

  console.log('User data:', data);

  return data || null;
}