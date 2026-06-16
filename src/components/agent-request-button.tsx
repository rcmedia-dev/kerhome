import { createClient } from '@/lib/supabase/client';
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useState } from "react";

const supabase = createClient();

type AgentRequestButtonProps = {
  userId: string;
  userName: string;
  queryClient: any;
}

export function AgentRequestButton({ userId, userName, queryClient }: AgentRequestButtonProps) {
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
      const { error } = await supabase
        .from("agente_requests")
        .insert([{ 
          user_id: userId, 
          status: "pending",
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Revisão automática por IA (não bloqueia)
      fetch('/api/mywai/review-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).then((r) => r.json()).then((result) => {
        queryClient.invalidateQueries({ queryKey: ["agent-request", userId] });
        if (result.decision === 'approved') {
          console.log(`IA aprovou agente ${userId} (score: ${result.score}%)`);
        } else if (result.decision === 'rejected') {
          console.log(`IA rejeitou agente ${userId}: ${result.reasons.join(', ')}`);
        } else {
          console.log(`IA inconclusiva para agente ${userId} — mantido como pendente`);
        }
      }).catch((err) => {
        console.warn('Erro na revisão de IA do agente:', err);
      });

      await queryClient.invalidateQueries({ queryKey: ["agent-request", userId] });

      alert("✅ Solicitação para se tornar agente enviada com sucesso!\n\nA equipa entrará em contacto em breve.");

    } catch (err: any) {
      console.error('Erro no processo:', err);
      alert(`❌ Erro ao enviar solicitação: ${err.message || 'Tente novamente'}`);
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
