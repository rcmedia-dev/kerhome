import { supabase } from '@/lib/supabase';
import { TPropertyResponseSchema } from '../types/property';

interface PropertyOwner {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  telefone: string;
  avatar_url?: string;
  empresa?: string;
  sobre_mim?: string;
}

export async function getPropertyOwner(propertyId: string): Promise<PropertyOwner> {
  // Validação básica
  if (!propertyId || typeof propertyId !== 'string') {
    throw new Error('ID da propriedade inválido');
  }

  try {
    // Primeiro busca a propriedade para obter o user_id
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error(propertyError?.message || 'Propriedade não encontrada');
    }

    // Agora busca os dados do usuário/proprietário
    const { data: owner, error: ownerError } = await supabase
      .from('profiles')
      .select(`
        id,
        primeiro_nome,
        ultimo_nome,
        email,
        telefone,
        empresa,
        sobre_mim
      `)
      .eq('id', property.owner_id)
      .single();

    if (ownerError || !owner) {
      throw new Error(ownerError?.message || 'Proprietário não encontrado');
    }

    return {
      id: owner.id,
      primeiro_nome: owner.primeiro_nome || '',
      ultimo_nome: owner.ultimo_nome || '',
      email: owner.email || '',
      telefone: owner.telefone || '',
      empresa: owner.empresa || undefined,
      sobre_mim: owner.sobre_mim
    };

  } catch (error) {
    console.error('Erro ao buscar proprietário:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao buscar proprietário'
    );
  }
}

export interface AgentProfile {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  sobre_mim?: string;
  licenca?: string;
}

export async function getAgentByEmail(email: string): Promise<AgentProfile> {
  // Validação do email
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Email inválido');
  }

  try {
    // Busca o perfil do agente pelo email
    console.log('email:', email)
    const { data: agent, error } = await supabase
      .from('profiles')
      .select(`
        id,
        primeiro_nome,
        ultimo_nome,
        email,
        telefone,
        empresa,
        sobre_mim,
        licenca
      `)
      .eq('email', email.toLowerCase().trim()) // Normaliza o email
      .single();

    if (error || !agent) {
      throw new Error(error?.message || 'Agente não encontrado');
    }

    return {
      id: agent.id,
      primeiro_nome: agent.primeiro_nome || '',
      ultimo_nome: agent.ultimo_nome || '',
      email: agent.email || email, // Fallback para o email buscado
      telefone: agent.telefone || '',
      empresa: agent.empresa || undefined,
      sobre_mim: agent.sobre_mim || undefined,
      licenca: agent.licenca || undefined
    };

  } catch (error) {
    console.error('Erro ao buscar agente:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao buscar agente'
    );
  }
}

export async function getAgentProperties(userId: string): Promise<TPropertyResponseSchema[]> {
  try {
    const properties = await supabase.from('properties')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
      

    return properties.data as TPropertyResponseSchema[];
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    throw new Error('Erro ao buscar propriedades');
  }
}
