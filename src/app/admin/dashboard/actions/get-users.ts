import { supabase } from "@/lib/supabase";

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