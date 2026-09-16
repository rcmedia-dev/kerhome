import { createClient } from '@/lib/supabase/client';
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useState } from "react";
import { toast } from 'sonner';

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

      toast.info('Solicitação enviada. A administração irá rever o teu pedido.');

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
            ? "bg-linear-to from-purple-400 to-orange-400 cursor-not-allowed shadow-sm text-white"
            : "bg-linear-to from-purple-600 to-orange-600 hover:shadow-md shadow-sm text-white hover:from-purple-700 hover:to-orange-700"
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
          ? "Agente Aprovado"
          : hasPendingRequest
          ? "Aguardando Aprovação"
          : "Tornar-se Agente"}
      </motion.button>
    </div>
  );
}
