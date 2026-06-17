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

            // Verificar se já existe uma solicitação para o utilizador
            const { data: existingRequest } = await supabase
                .from('agente_requests')
                .select('id, status')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingRequest) {
                if (existingRequest.status === 'pending') {
                    toast.info("Você já possui uma solicitação pendente.");
                    setAgentRequestStatus('pending');
                    return;
                }
                if (existingRequest.status === 'approved') {
                    toast.info("Você já é um agente aprovado.");
                    setAgentRequestStatus('approved');
                    return;
                }

                // Se foi rejeitada, atualizamos o estado para pending e a data de criação
                const { error: updateError } = await supabase
                    .from('agente_requests')
                    .update({
                        status: 'pending',
                        created_at: new Date().toISOString()
                    })
                    .eq('id', existingRequest.id);

                if (updateError) {
                    throw new Error(`Erro ao atualizar solicitação: ${updateError.message}`);
                }
            } else {
                // Se não existir, inserimos uma nova solicitação
                const { error: insertError } = await supabase
                    .from('agente_requests')
                    .insert({
                        user_id: user.id,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    });

                if (insertError) {
                    throw new Error(`Erro ao criar solicitação: ${insertError.message}`);
                }
            }

            setAgentRequestStatus('pending');
            toast.success('Solicitação registrada com sucesso!');

            // Revisão automática por IA (não bloqueia)
            fetch('/api/mywai/review-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            }).then((r) => r.json()).then(async (result) => {
                // Atualizar painel de notificações
                window.dispatchEvent(new CustomEvent('new-notification'));

                if (result.decision === 'approved') {
                    setAgentRequestStatus('approved');
                    await updateUser({ role: 'agent' });
                    toast.success('Parabéns! O teu pedido para te tornares agente foi aprovado automaticamente pela nossa IA! 🎉');
                    console.log(`IA aprovou agente ${user.id} (score: ${result.score}%)`);
                } else if (result.decision === 'rejected') {
                    setAgentRequestStatus('rejected');
                    toast.error(`O teu pedido para ser agente foi rejeitado pela IA. Motivos: ${result.reasons.join(', ')}`, {
                        duration: 10000,
                    });
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

