import { createClient } from '@/lib/supabase/client';
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, X } from "lucide-react";
import { useState } from "react";
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';

const supabase = createClient();

type AgentRequestButtonProps = {
  userId: string;
  userName: string;
}

export function AgentRequestButton({ userId, userName }: AgentRequestButtonProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: latestRequest, isLoading: isChecking } = useQuery<{ id: string; status: string } | null>({
    queryKey: ["agent-request", userId],
    queryFn: async (): Promise<{ id: string; status: string } | null> => {
      const { data, error } = await supabase
        .from("agente_requests")
        .select("id, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const hasPendingRequest = latestRequest?.status === 'pending';
  const isApproved = latestRequest?.status === 'approved';
  const isRejected = latestRequest?.status === 'rejected';

  const handleBecomeAgent = async () => {
    setIsLoading(true);
    
    try {
      // Verificar se já existe uma solicitação para o utilizador
      const { data: existingRequest } = await supabase
        .from('agente_requests')
        .select('id, status')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          toast.info("Você já possui uma solicitação pendente.");
          setIsLoading(false);
          return;
        }
        if (existingRequest.status === 'approved') {
          toast.info("Você já é um agente aprovado.");
          setIsLoading(false);
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

        if (updateError) throw updateError;
      } else {
        // Se não existir, inserimos uma nova solicitação
        const { error: insertError } = await supabase
          .from("agente_requests")
          .insert([{ 
            user_id: userId, 
            status: "pending",
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }
      // Atualizar queries e notificações
      await queryClient.invalidateQueries({ queryKey: ["agent-request", userId] });
      await queryClient.invalidateQueries({ queryKey: ["agent-request-status", userId] });
      window.dispatchEvent(new CustomEvent('new-notification'));

      toast.info('Solicitação enviada. A IA está a analisar o teu perfil...');

      // Executar e aguardar revisão automática por IA (com delay mínimo de 1.5 segundos)
      const startReview = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      let result;
      try {
        const res = await fetch('/api/mywai/review-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error(`Servidor respondeu com status ${res.status}`);
        }
        result = await res.json();
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        if (fetchErr.name === 'AbortError') {
          throw new Error('A verificação da IA demorou demasiado tempo. O pedido foi registado mas será revisto manualmente.');
        }
        throw fetchErr;
      }

      const elapsed = Date.now() - startReview;
      const delay = Math.max(0, 1500 - elapsed);
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Atualizar queries e notificações finais
      await queryClient.invalidateQueries({ queryKey: ["agent-request", userId] });
      await queryClient.invalidateQueries({ queryKey: ["agent-request-status", userId] });
      window.dispatchEvent(new CustomEvent('new-notification'));

      if (result.decision === 'approved') {
        console.log(`IA aprovou agente ${userId} (score: ${result.score}%)`);
        await useUserStore.getState().updateUser({ role: 'agent' });
        toast.success('Parabéns! O teu pedido para te tornares agente foi aprovado pela nossa IA! 🎉');
      } else if (result.decision === 'rejected') {
        console.log(`IA rejeitou agente ${userId}: ${result.reasons.join(', ')}`);
        
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
        console.log(`IA inconclusiva para agente ${userId} — mantido como pendente`);
        toast.info("A IA não pôde tomar uma decisão imediata. O teu pedido será revisto manualmente pela administração.");
      }

    } catch (err: any) {
      console.error('Erro no processo:', err);
      toast.error(`Erro ao enviar solicitação: ${err.message || 'Tente novamente'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={!isLoading && !isChecking && !hasPendingRequest ? { scale: 1.02 } : {}}
        whileTap={!isLoading && !isChecking && !hasPendingRequest ? { scale: 0.98 } : {}}
        onClick={handleBecomeAgent}
        disabled={isLoading || isChecking || hasPendingRequest}
        className={cn(
          "flex justify-center items-center px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 text-sm md:text-base w-full md:w-auto font-medium relative",
          isLoading || isChecking || hasPendingRequest
            ? "bg-gradient-to-r from-purple-400 to-orange-400 cursor-not-allowed shadow-sm text-white"
            : "bg-gradient-to-r from-purple-600 to-orange-600 hover:shadow-md shadow-sm text-white hover:from-purple-700 hover:to-orange-700"
        )}
      >
        <motion.div
          animate={isLoading ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
        >
          <User className="w-4 h-4 mr-2" />
        </motion.div>
        {isLoading
          ? "Enviando..."
          : isChecking
          ? "Verificando..."
          : isApproved
          ? "Agente Aprovado ✅"
          : hasPendingRequest
          ? "Aguardando Aprovação"
          : "Tornar-se Agente"}
      </motion.button>
    </div>
  );
}
