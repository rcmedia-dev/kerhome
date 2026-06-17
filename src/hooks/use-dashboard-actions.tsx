import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';
import { X } from 'lucide-react';

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
            const startReview = Date.now();
            fetch('/api/mywai/review-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })
            .then(async (r) => {
                const result = await r.json();

                // Garantir que a análise dura pelo menos 1.5 segundos (1500ms)
                const elapsed = Date.now() - startReview;
                const delay = Math.max(0, 1500 - elapsed);
                if (delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                // Atualizar painel de notificações
                window.dispatchEvent(new CustomEvent('new-notification'));

                if (result.decision === 'approved') {
                    setAgentRequestStatus('approved');
                    await updateUser({ role: 'agent' });
                    toast.success('Parabéns! O teu pedido para te tornares agente foi aprovado automaticamente pela nossa IA! 🎉');
                    console.log(`IA aprovou agente ${user.id} (score: ${result.score}%)`);
                } else if (result.decision === 'rejected') {
                    setAgentRequestStatus('rejected');
                    console.log(`IA rejeitou agente ${user.id}: ${result.reasons.join(', ')}`);
                    
                    // Caixa persistente de rejeição que só fecha ao clicar no X
                    toast.custom((t) => (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl shadow-lg max-w-sm flex items-start gap-3 relative">
                            <div className="flex-1">
                                <h4 className="font-bold text-red-800 text-sm">Pedido de Agente Rejeitado pela IA</h4>
                                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                                    Motivos: {result.reasons.join(', ')}.
                                </p>
                                <p className="text-[10.5px] text-red-600 mt-2 font-medium">
                                    Dica: Atualiza o teu perfil com uma foto profissional, telefone e descrição antes de tentar novamente.
                                </p>
                            </div>
                            <button 
                                onClick={() => toast.dismiss(t)} 
                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-100/50 rounded-lg transition-colors cursor-pointer shrink-0"
                                aria-label="Fechar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ), { duration: Infinity });
                } else {
                    console.log(`IA inconclusiva para agente ${user.id} — mantido como pendente`);
                }
            })
            .catch((err) => {
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

