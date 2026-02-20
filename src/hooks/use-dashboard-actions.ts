import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { notificateN8n } from '@/lib/functions/supabase-actions/n8n-notification-request';
import { useUserStore } from '@/lib/store/user-store';

export function useDashboardActions() {
    const { user, updateUser } = useUserStore();
    const [isUploading, setIsUploading] = useState(false);
    const [isRequestingAgent, setIsRequestingAgent] = useState(false);
    const supabase = createClient();

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 5MB.');
            return;
        }

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            await updateUser({ avatar_url: publicUrl });
            toast.success('Foto de perfil atualizada!');
        } catch (error) {
            console.error('Erro ao atualizar avatar:', error);
            toast.error('Erro ao atualizar a foto.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRequestAgent = async (displayName: string) => {
        if (!user) return;
        try {
            setIsRequestingAgent(true);

            const { error: dbError } = await supabase
                .from('agente_requests')
                .insert({
                    user_id: user.id,
                    status: 'pending'
                });

            if (dbError) {
                if (dbError.code === '23505') {
                    toast.info("Você já possui uma solicitação pendente.");
                    await updateUser({ current_agent_request_status: 'pending' });
                    return;
                }
                throw new Error(`Erro ao salvar solicitação: ${dbError.message}`);
            }

            await updateUser({ current_agent_request_status: 'pending' });
            toast.success('Solicitação registrada com sucesso!');

            try {
                await notificateN8n('agente_solicitation', {
                    agentName: displayName,
                });
            } catch (n8nError) {
                console.warn('Alerta de notificação falhou, mas registro foi salvo:', n8nError);
            }

        } catch (error) {
            console.error('Erro ao solicitar:', error);
            toast.error('Erro ao enviar solicitação.');
        } finally {
            setIsRequestingAgent(false);
        }
    };

    return {
        isUploading,
        isRequestingAgent,
        handleAvatarUpload,
        handleRequestAgent
    };
}
