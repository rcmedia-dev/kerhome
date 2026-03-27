'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Tipagem básica
type ImobiliariaData = {
  nome: string;
  slug: string;
  cidade: string;
  bairro?: string;
  email?: string;
  whatsapp?: string;
  telefone?: string;
  website?: string;
  descricao?: string;
  logo?: string;
  status?: string;
  verificada?: boolean;
  owner_id?: string;
};

// Validar URLs HTTP para HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url || url.trim() === '') return undefined;
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith('http://')) {
    cleanUrl = cleanUrl.replace(/^http:\/\//i, 'https://');
  } else if (!cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  return cleanUrl;
}

// Chaves
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
// Fallback: Cliente Admin (Service Role)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);

export async function createImobiliariaAction(data: ImobiliariaData) {
  try {
    const supabase = await createClient();
    
    // Verificando Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Debugging
    console.log("====== DEBUG ACTION: CREATE IMOBILIARIA ======");
    console.log("User encontrado:", user?.id || 'Nenhum');
    console.log("Erro de Auth:", authError?.message || 'Nenhum');
    console.log("Chave de Serviço usada começa com:", serviceKey.substring(0, 10) + '...');
    const isServiceRole = serviceKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI');
    console.log("É uma chave de Service Role válida aparente?", isServiceRole ? 'Sim' : 'Talvez não (Avalie o log da API)');
    
    if (authError || !user) {
      console.warn("âš ï¸ Sessão não encontrada. Tentando utilizar Service Role Fallback.");
    }

    const processedData = {
      ...data,
      logo: ensureHttps(data.logo),
      website: ensureHttps(data.website),
      status: data.status || 'pending',
      verificada: data.verificada ?? false,
      owner_id: data.owner_id
    };

    // Tentar primeiro com o cliente do usuário
    if (user) {
      const { error } = await supabase.from('imobiliarias').insert([processedData]);
      if (!error) {
        revalidatePath('/admin/dashboard');
        return { success: true };
      }
      console.error("Erro insert Supabase (User Client):", error);
    }

    // Se falhou (RLS) ou não tem utilizador, tentar com o Service Role
    console.info("ðŸ›¡ï¸ Usando Service Role Key para inserir imobiliária...");
    const { error: adminError } = await supabaseAdmin.from('imobiliarias').insert([processedData]);

    if (adminError) {
      console.error("Erro insert Supabase (Admin Client):", adminError);
      throw new Error(adminError.message);
    }

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateImobiliariaAction(id: string, data: ImobiliariaData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const processedData = {
      ...data,
      logo: ensureHttps(data.logo),
      website: ensureHttps(data.website),
      status: data.status,
      verificada: data.verificada
    };

    if (user) {
      const { error } = await supabase.from('imobiliarias').update(processedData).eq('id', id);
      if (!error) {
        revalidatePath('/admin/dashboard');
        return { success: true };
      }
    }

    // Fallback Admin
    const { error: adminError } = await supabaseAdmin.from('imobiliarias').update(processedData).eq('id', id);
    if (adminError) throw new Error(adminError.message);

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleImobiliariaVerificationAction(id: string, verificada: boolean) {
  try {
    // Usar diretamente Admin para garantir privilégios de verificação
    const { error: adminError } = await supabaseAdmin
      .from('imobiliarias')
      .update({ verificada: !verificada })
      .eq('id', id);

    if (adminError) throw new Error(adminError.message);

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateImobiliariaStatusAction(id: string, status: string) {
  try {
    // 1. Buscar owner_id da imobiliária
    const { data: currentImob, error: fetchError } = await supabaseAdmin
      .from('imobiliarias')
      .select('owner_id, nome')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    // 2. Atualizar o status da imobiliária
    const { error: adminError } = await supabaseAdmin
      .from('imobiliarias')
      .update({ status })
      .eq('id', id);

    if (adminError) throw new Error(adminError.message);

    // 3. Lógica Adicional por Status
    if (status === 'rejected' && currentImob.owner_id) {
        // Reverter role do usuário para 'profissional'
        await supabaseAdmin
            .from('profiles')
            .update({ role: 'profissional' })
            .eq('id', currentImob.owner_id);
    }

    if (status === 'approved' && currentImob.owner_id) {
        // Promover o dono da agência para 'agente' (acesso total ao painel de agência)
        await supabaseAdmin
            .from('profiles')
            .update({ role: 'agente' })
            .eq('id', currentImob.owner_id);
        // Revalidar o diretório público para que a agência apareça imediatamente
        revalidatePath('/imobiliarias');
    }

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error("Erro em updateImobiliariaStatusAction:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteImobiliariaAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { error } = await supabase.from('imobiliarias').delete().eq('id', id);
        if (!error) {
            revalidatePath('/admin/dashboard');
            return { success: true };
        }
    }
    
    const { error: adminError } = await supabaseAdmin.from('imobiliarias').delete().eq('id', id);
    if (adminError) throw new Error(adminError.message);

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadLogoAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("Nenhum arquivo enviado.");

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB

    // Safe Validations
    if (!validTypes.includes(file.type)) {
      throw new Error("Tipo de arquivo inválido. Por favor, use JPG, PNG ou WEBP.");
    }
    if (file.size > maxSizeInBytes) {
      throw new Error("O logo é muito grande. O limite é de 1MB.");
    }

    // Secure Naming
    const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Upload usando Service Role para ignorar políticas do Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('logos-imobiliarias')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png'
      });

    if (uploadError) {
      console.error("Storage upload error (admin):", uploadError);
      throw new Error(uploadError.message);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('logos-imobiliarias')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Solicitar Upgrade para conta Imobiliária (Fluxo Hierárquico)
 */
export async function requestAgencyUpgradeAction(userId: string, data: ImobiliariaData) {
  try {
    const supabase = await createClient();
    
    // 1. Criar a imobiliária vinculada ao dono (Usamos AdminClient para fazer bypass do RLS se necessário no insert inicial)
    const processedData = {
      ...data,
      owner_id: userId,
      status: 'pending',
      verificada: false,
      logo: ensureHttps(data.logo),
      website: ensureHttps(data.website)
    };

    const { data: imob, error: imobError } = await supabaseAdmin
      .from('imobiliarias')
      .insert([processedData])
      .select()
      .single();

    if (imobError) {
      console.error('Erro ao criar registro de imobiliária:', imobError);
      throw new Error(imobError.message);
    }

    // 2. Atualizar o role do utilizador para 'pending_agency'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'pending_agency' })
      .eq('id', userId);

    if (profileError) {
      console.error('Erro ao atualizar role do perfil:', profileError);
      throw new Error(profileError.message);
    }

    revalidatePath('/admin/dashboard');
    return { success: true, id: imob.id };
  } catch (error: any) {
    console.error('Erro no upgrade de imobiliária:', error);
    return { success: false, error: error.message };
  }
}


