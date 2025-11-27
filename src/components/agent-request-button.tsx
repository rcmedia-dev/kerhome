import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

type AgentRequestButtonProps = {
  userId: string;
  userName: string;
  queryClient: any;
}

type WebhookPayload = {
  evento: string;
  dados: {
    nome: string;
    email: string;
    telefone: string;
    user_id: string;
    tipo_solicitacao: string;
    data_solicitacao: string;
  };
};

async function sendAgentRequestNotification(userData: {
  nome: string;
  email: string;
  telefone: string;
  user_id: string;
}): Promise<any> {
  const webhookUrl = 'https://n8n.srv1157846.hstgr.cloud/webhook/notificate';

  const payload: WebhookPayload = {
    evento: 'solicitacao_agente',
    dados: {
      ...userData,
      tipo_solicitacao: 'solicitacao_agente',
      data_solicitacao: new Date().toISOString(),
    },
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Notificação enviada com sucesso na tentativa ${attempt}`);
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      console.warn(`Tentativa ${attempt} falhou: ${lastError.message}`);

      if (attempt < 3) {
        // Delay crescente: 1s, 2s, 3s
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw lastError || new Error('Falha ao enviar notificação após 3 tentativas');
}


async function getUserData(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('primeiro_nome, ultimo_nome, email, telefone')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    throw error;
  }

  return data;
}

export function AgentRequestButton({ userId, userName, queryClient }: AgentRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
    setNotificationStatus('idle');
    
    try {
      // 1. Buscar dados do usuário
      const userData = await getUserData(userId);
      
      // 2. Criar requisição no Supabase
      const { data: requestData, error } = await supabase
        .from("agente_requests")
        .insert([{ 
          user_id: userId, 
          status: "pending",
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // 3. Enviar notificação (não bloqueia o fluxo principal)
      sendAgentRequestNotification({
        nome: `${userData.primeiro_nome} ${userData.ultimo_nome || ''}`.trim(),
        email: userData.email,
        telefone: userData.telefone || 'Não informado',
        user_id: userId
      })
      .then(() => {
        setNotificationStatus('success');
        console.log('Notificação enviada com sucesso');
      })
      .catch((error) => {
        setNotificationStatus('error');
        console.error('Falha na notificação:', error);
        // Não mostra alerta de erro para o usuário, apenas log
      });

      // 4. Atualizar cache
      await queryClient.invalidateQueries({ 
        queryKey: ["agent-request", userId] 
      });

      alert("✅ Solicitação para se tornar agente enviada com sucesso!\n\nA equipe entrará em contato em breve.");

    } catch (err: any) {
      console.error('Erro no processo:', err);
      alert(`❌ Erro ao enviar solicitação: ${err.message || 'Tente novamente'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPendingRequest = Boolean(pendingRequest);

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
          : hasPendingRequest
          ? "Aguardando Aprovação"
          : "Tornar-se Agente"}
      </motion.button>

      {/* Indicador de status da notificação */}
      {notificationStatus !== 'idle' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-2 -right-2"
        >
          {notificationStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
        </motion.div>
      )}
    </div>
  );
}