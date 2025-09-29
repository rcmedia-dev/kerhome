'use client';

import { useState } from 'react';
import { Mail, Phone, Clock, CheckCircle, XCircle, Loader2, UserCircle2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { aproveAgent, rejectAgent } from '../dashboard/actions/agent';

// =========================
// Tipos
// =========================
type AgentStatus = "Todos" | "Pendentes" | "Aprovados" | "Rejeitados";

const statusMap: Record<string, { label: string; tab: AgentStatus }> = {
  pending: { label: "Aguardando aprovação", tab: "Pendentes" },
  aproved: { label: "Aprovado", tab: "Aprovados" },
  rejected: { label: "Rejeitado", tab: "Rejeitados" },
};

interface AgentSubscription {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string;
  dataInscricao: string;
  status: AgentStatus;
  created_at: string;
  especialidade?: string;
  experiencia?: string;
  localizacao?: string;
  empresa?: string;
}

interface AgentRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
}

interface Profile {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  telefone: string;
  especialidade?: string;
  experiencia?: string;
  localizacao?: string;
  empresa?: string;
  created_at: string;
}

const AGENT_PLANS = {
  "Agente Premium": {
    name: "Agente Premium",
    badge: "Premium",
    badgeBg: "bg-purple-100 text-purple-700",
    border: "border-purple-200",
    gradient: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-500",
    button: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
};

// =========================
// Componentes auxiliares
// =========================
const MessageAlert = ({ type, text }: { type: 'success' | 'error'; text: string }) => (
  <div
    className={`mb-4 p-4 rounded-lg ${
      type === 'success'
        ? 'bg-green-100 text-green-700 border border-green-200'
        : 'bg-red-100 text-red-700 border border-red-200'
    }`}
  >
    {text}
  </div>
);

const Tabs = ({
  activeTab,
  setActiveTab,
  agents,
}: {
  activeTab: AgentStatus;
  setActiveTab: (tab: AgentStatus) => void;
  agents: AgentSubscription[];
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
      {(["Todos", "Pendentes", "Aprovados", "Rejeitados"] as AgentStatus[]).map((tab) => (
        <button
          key={tab}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === tab
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
          }`}
          onClick={() => setActiveTab(tab)}
        >
          <div className="flex items-center justify-center gap-2">
            {tab === "Pendentes" && <Clock size={16} />}
            {tab === "Aprovados" && <CheckCircle size={16} />}
            {tab === "Rejeitados" && <XCircle size={16} />}
            {tab}
            {tab !== "Todos" && (
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                }`}
              >
                {agents.filter((a) => a.status === tab).length}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  </div>
);

const AgentCard = ({
  agent,
  processing,
  handleApprove,
  handleReject,
}: {
  agent: AgentSubscription;
  processing: string | null;
  handleApprove: (id: string, userId: string) => void;
  handleReject: (id: string, userId: string) => void;
}) => {
  const plan = AGENT_PLANS["Agente Premium"];
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-AO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div
      key={agent.id}
      className={`bg-white rounded-2xl shadow-lg border ${plan.border} overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${plan.gradient} p-6 relative`}>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.badgeBg}`}>
            {plan.badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 font-semibold text-gray-900">
            <UserCircle2 size={16} />
            {agent.nome}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={16} className="text-gray-400" />
            {agent.email}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone size={16} className="text-gray-400" />
            {agent.telefone ? `+244 ${agent.telefone}` : "Não informado"}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock size={16} className="text-gray-400" />
            Inscrito em {formatDate(agent.dataInscricao)}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="border-t pt-4">
          {agent.status === "Pendentes" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(agent.id, agent.user_id)}
                disabled={processing === agent.id}
                className={`flex-1 py-2 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:shadow-lg ${plan.button} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing === agent.id ? (
                  <Loader2 size={16} className="animate-spin inline mr-1" />
                ) : (
                  <CheckCircle size={16} className="inline mr-1" />
                )}
                Aprovar
              </button>
              <button
                onClick={() => handleReject(agent.id, agent.user_id)}
                disabled={processing === agent.id}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:from-gray-200 hover:to-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === agent.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} className="inline mr-1" />
                )}
                Rejeitar
              </button>
            </div>
          )}

          {agent.status === "Aprovados" && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle size={16} />
              <span>{statusMap["aproved"].label}</span>
            </div>
          )}

          {agent.status === "Rejeitados" && (
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <XCircle size={16} />
              <span>{statusMap["rejected"].label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ activeTab }: { activeTab: AgentStatus }) => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <UserCircle2 size={40} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agente encontrado</h3>
    <p className="text-gray-600">Não há agentes com o status "{activeTab}" no momento.</p>
  </div>
);


export default function AgentSubscriptionsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AgentStatus>("Todos");
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents-subscriptions"],
    queryFn: async () => {
      const { data: agentRequestsData, error: agentRequestsError } = await supabase
        .from("agente_requests")
        .select("*");

      if (agentRequestsError) throw new Error(agentRequestsError.message);

      const userIds = agentRequestsData.map((r: AgentRequest) => r.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError) throw new Error(profilesError.message);

      return agentRequestsData.map((request: AgentRequest) => {
        const profile = profilesData.find((p: Profile) => p.id === request.user_id);
        return {
          id: request.id,
          user_id: request.user_id,
          nome: profile ? `${profile.primeiro_nome} ${profile.ultimo_nome}` : "Usuário",
          email: profile?.email || "",
          telefone: profile?.telefone || "",
          dataInscricao: request.created_at,
          status: statusMap[request.status]?.tab ?? "Pendentes",
          created_at: request.created_at,
          especialidade: profile?.especialidade,
          experiencia: profile?.experiencia,
          localizacao: profile?.localizacao,
          empresa: profile?.empresa,
        };
      });
    },
  });

  const filteredAgents =
    activeTab === "Todos" ? agents || [] : (agents || []).filter((a) => a.status === activeTab);

  const handleApprove = async (requestId: string, userId: string) => {
    setProcessing(requestId);
    setMessage(null);

    try {
      const result = await aproveAgent(requestId, userId);
      if (result.success) {
        setMessage({ type: "success", text: result.message });

        // ✅ Atualiza cache da lista
        queryClient.setQueryData(["agents-subscriptions"], (oldData: any) => {
          if (!oldData) return [];
          return oldData.map((agent: any) =>
            agent.id === requestId ? { ...agent, status: "Aprovados" } : agent
          );
        });

        // ✅ Invalida o cache do perfil individual para atualizar a role dele
        await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      console.error("Erro ao aprovar agente:", err);
      setMessage({ type: "error", text: "Erro ao processar solicitação" });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string, userId: string) => {
    setProcessing(requestId);
    setMessage(null);

    try {
      const result = await rejectAgent(requestId);
      if (result.success) {
        setMessage({ type: "success", text: result.message });

        // ✅ Atualiza cache da lista
        queryClient.setQueryData(["agents-subscriptions"], (oldData: any) => {
          if (!oldData) return [];
          return oldData.map((agent: any) =>
            agent.id === requestId ? { ...agent, status: "Rejeitados" } : agent
          );
        });

        // ✅ Invalida o cache do perfil individual também
        await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      console.error("Erro ao rejeitar agente:", err);
      setMessage({ type: "error", text: "Erro ao processar solicitação" });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Agentes</h1>
          <p className="text-gray-600">Gerencie as solicitações de agentes imobiliários</p>
        </div>

        {/* Alert */}
        {message && <MessageAlert type={message.type} text={message.text} />}

        {/* Tabs */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} agents={agents || []} />

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 mt-2">Carregando solicitações...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  processing={processing}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                />
              ))}
            </div>

            {filteredAgents.length === 0 && <EmptyState activeTab={activeTab} />}
          </>
        )}
      </div>
    </div>
  );
}
