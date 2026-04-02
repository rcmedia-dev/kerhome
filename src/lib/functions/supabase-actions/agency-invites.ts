'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function getAgencyInvites(agencyId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('agency_invites')
            .select('*')
            .eq('imobiliaria_id', agencyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar convites:', error);
        return [];
    }
}

export async function sendAgencyInvite(email: string, agencyId: string) {
    try {
        const supabase = await createClient();
        
        // 1. Validar se o utilizador é owner
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Não autenticado");

        const { data: agency } = await supabase
            .from('imobiliarias')
            .select('id, nome, owner_id')
            .eq('id', agencyId)
            .single();

        if (!agency || agency.owner_id !== user.id) {
            throw new Error("Não autorizado: Apenas o dono da agência pode enviar convites.");
        }

        // 2. Gerar Token e salvar na base de dados (para tracking no dashboard e página de aceitação)
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

        const { error: inviteError } = await supabase
            .from('agency_invites')
            .insert([{
                email: email.toLowerCase(),
                imobiliaria_id: agencyId,
                token,
                status: 'pending',
                expires_at: expiresAt
            }]);

        if (inviteError) {
            if (inviteError.code === '23505') throw new Error("Já existe um convite pendente para este e-mail.");
            throw inviteError;
        }

        // 3. Enviar o e-mail via Resend
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        try {
            const { sendAgencyInviteEmail } = await import('./send-email');
            const emailResult = await sendAgencyInviteEmail(email.toLowerCase(), agency.nome, token);
            
            if (!emailResult.success) {
                console.error("Aviso: Falha ao enviar e-mail via Resend, mas o convite foi criado na base de dados.", emailResult.error);
            }
            console.log(`\n✅ CONVITE ENVIADO VIA RESEND: ${origin}/aceitar-convite?token=${token}\n`);
        } catch (inviteAuthError) {
            console.error('\n⚠️ AVISO: Erro ao disparar o e-mail via Resend.', inviteAuthError);
            console.log(`🔗 Link Direto (Copie e cole no browser): ${origin}/aceitar-convite?token=${token}\n`);
        }

        revalidatePath('/dashboard');
        return { success: true, agencyName: agency.nome };
    } catch (error: any) {
        console.error('Erro ao enviar convite:', error);
        return { success: false, error: error.message };
    }
}

export async function getInviteByToken(token: string, supabaseClient?: any) {
    try {
        // Usar o admin client por defeito para fazer bypass de RLS 
        // (já que utilizadores anónimos precisam de ler o convite na página de aceitar)
        const supabase = supabaseClient || await createAdminClient();
        const { data, error } = await supabase
            .from('agency_invites')
            .select(`
                *,
                imobiliaria:imobiliaria_id(id, nome, logo)
            `)
            .eq('token', token)
            .single();

        if (error) throw error;

        // Validar expiração
        if (new Date(data.expires_at) < new Date()) {
            return { invite: null, error: 'Este convite expirou.' };
        }

        if (data.status !== 'pending') {
            return { invite: null, error: 'Este convite já foi processado.' };
        }

        return { invite: data };
    } catch (error) {
        console.error('Erro ao buscar convite por token:', error);
        return { invite: null, error: 'Convite não encontrado ou inválido.' };
    }
}

export async function acceptAgencyInvite(token: string, supabaseClient?: any) {
    try {
        const supabase = supabaseClient || await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Deves estar logado para aceitar um convite.");

        // 1. Validar convite
        const { invite, error: inviteError } = await getInviteByToken(token, supabase);
        if (inviteError || !invite) throw new Error(inviteError || "Convite inválido.");

        // 2. Validar e-mail
        if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
            throw new Error(`Este convite foi enviado para ${invite.email}, mas tu estás logado como ${user.email}.`);
        }

        // 3. Atualizar perfil e convite diretamente (KISS)
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ imobiliaria_id: invite.imobiliaria_id })
            .eq('id', user.id);

        if (profileError) throw profileError;

        await supabase
            .from('agency_invites')
            .update({ status: 'accepted' })
            .eq('id', invite.id);

        try {
            revalidatePath('/dashboard');
        } catch (e) {
            // No custom logic needed for test environment
        }
        return { success: true, agencyName: invite.imobiliaria.nome };
    } catch (error: any) {
        console.error('Erro ao aceitar convite:', error);
        return { success: false, error: error.message };
    }
}

export async function rejectAgencyInvite(token: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Deves estar logado para processar um convite.");

        const { invite, error: inviteError } = await getInviteByToken(token, supabase);
        if (inviteError || !invite) throw new Error(inviteError || "Convite inválido.");

        if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
            throw new Error("E-mail não corresponde ao convite.");
        }

        await supabase
            .from('agency_invites')
            .update({ status: 'rejected' })
            .eq('id', invite.id);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Erro ao aceitar convite:', error);
        return { success: false, error: error.message };
    }
}

