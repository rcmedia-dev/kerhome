'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function getAgencyInvites(agencyId: string) {
    try {
        const supabase = createServiceClient();
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

export async function sendAgencyInvite(email: string, agencyId: string, userId: string) {
    try {
        const supabase = createServiceClient();

        // 1. Validar se o utilizador é owner da agência
        const { data: agency } = await supabase
            .from('imobiliarias')
            .select('id, nome, owner_id')
            .eq('id', agencyId)
            .single();

        if (!agency || agency.owner_id !== userId) {
            return { success: false, error: "Não autorizado: Apenas o dono da agência pode enviar convites." };
        }

        // 2. Validar se o e-mail pertence a um utilizador existente
        const { data: inviteeProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (!inviteeProfile) {
            return { success: false, error: 'Este e-mail não pertence a um usuário do Kercasa. Apenas usuários cadastrados podem ser convidados.' };
        }

        // 3. Gerar Token e salvar na base de dados
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

        // 4. Criar notificação no dashboard do convidado
        try {
            const { insertNotification } = await import('./notifications-actions');
            await insertNotification({
                userId: inviteeProfile.id,
                type: 'agency_invite',
                title: `Convite para ${agency.nome}`,
                message: `Você foi convidado para fazer parte da agência ${agency.nome} no Kercasa. Aceite ou recuse este convite.`,
                data: { token, agencyName: agency.nome, imobiliaria_id: agencyId }
            });
        } catch (notifError) {
            console.error('Aviso: Falha ao criar notificação de convite:', notifError);
        }

        // 5. Enviar o e-mail via Resend
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

export async function acceptAgencyInvite(token: string, userId: string, userEmail: string) {
    try {
        const supabase = createServiceClient();

        // 1. Validar convite
        const { invite, error: inviteError } = await getInviteByToken(token, supabase);
        if (inviteError || !invite) throw new Error(inviteError || "Convite inválido.");

        // 2. Validar e-mail
        if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new Error(`Este convite foi enviado para ${invite.email}, mas tu és ${userEmail}.`);
        }

        // 3. Atualizar perfil e convite diretamente
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ imobiliaria_id: invite.imobiliaria_id })
            .eq('id', userId);

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

export async function rejectAgencyInvite(token: string, userId: string, userEmail: string) {
    try {
        const supabase = createServiceClient();

        const { invite, error: inviteError } = await getInviteByToken(token, supabase);
        if (inviteError || !invite) throw new Error(inviteError || "Convite inválido.");

        if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new Error("E-mail não corresponde ao convite.");
        }

        await supabase
            .from('agency_invites')
            .update({ status: 'rejected' })
            .eq('id', invite.id);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Erro ao rejeitar convite:', error);
        return { success: false, error: error.message };
    }
}
