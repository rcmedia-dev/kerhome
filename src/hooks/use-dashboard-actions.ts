import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';

function setAgentRequestStatus(status: string | null) {
  useUserStore.setState((state) => {
    if (!state.user) return state;
    return { user: { ...state.user, current_agent_request_status: status } };
  });
}

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
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('user-avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('user-avatars')
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
                    setAgentRequestStatus('pending');
                    return;
                }
                throw new Error(`Erro ao salvar solicitação: ${dbError.message}`);
            }

            setAgentRequestStatus('pending');
            toast.success('Solicitação registrada com sucesso!');

            // Revisão automática por IA (não bloqueia)
            fetch('/api/mywai/review-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            }).then((r) => r.json()).then(async (result) => {
                if (result.decision === 'approved') {
                    setAgentRequestStatus('approved');
                    await updateUser({ role: 'agent' });
                    console.log(`IA aprovou agente ${user.id} (score: ${result.score}%)`);
                } else if (result.decision === 'rejected') {
                    setAgentRequestStatus('rejected');
                    console.log(`IA rejeitou agente ${user.id}: ${result.reasons.join(', ')}`);
                } else {
                    console.log(`IA inconclusiva para agente ${user.id} — mantido como pendente`);
                }
            }).catch((err) => {
                console.warn('Erro na revisão de IA do agente:', err);
            });

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

