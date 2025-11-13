import { notificateN8n } from "@/lib/functions/supabase-actions/n8n-notification-request";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useState } from "react";

type AgentRequestButtonProps = {
  userId: string;
  userName: string;
  queryClient: any;
}

// AgentRequestButton atualizado com animações suaves
export function AgentRequestButton({ userId, userName, queryClient }: AgentRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: pendingRequest, isLoading: isChecking } = useQuery<{ id: string; status: string } | null>({
    queryKey: ["agent-request", userId],
    queryFn: async (): Promise<{ id: string; status: string } | null> => {
      const { data, error } = await supabase
        .from("agente_requests")
        .select("id, status")
        .eq("user_id", userId)
        .eq("status", "pending")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleBecomeAgent = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("agente_requests")
        .insert([{ user_id: userId, status: "pending" }])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar requisição:", error.message);
        alert("Erro ao enviar solicitação");
        return;
      }

      await queryClient.invalidateQueries({ 
        queryKey: ["agent-request", userId] 
      });

      await notificateN8n("agente_solicitation", { agentName: userName });

      alert("Solicitação para se tornar agente enviada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao enviar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const hasPendingRequest = Boolean(pendingRequest);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleBecomeAgent}
      disabled={isLoading || isChecking || hasPendingRequest}
      className={cn(
        "flex justify-center items-center px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 text-sm md:text-base w-full md:w-auto font-medium",
        isLoading || isChecking || hasPendingRequest
          ? "bg-gradient-to-r from-purple-400 to-orange-400 cursor-not-allowed shadow-sm"
          : "bg-gradient-to-r from-purple-600 to-orange-600 hover:shadow-md shadow-sm text-white"
      )}
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
      >
        <User className="w-4 h-4 mr-2" />
      </motion.div>
      {isLoading
        ? "Enviando..."
        : isChecking
        ? "Verificando..."
        : hasPendingRequest
        ? "Aguardando Aprovação"
        : "Tornar-se Agente"}
    </motion.button>
  );
}