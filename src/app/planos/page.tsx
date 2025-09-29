'use client';

import { Star, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-context";
import { getUserPlan } from "@/lib/actions/supabase-actions/get-user-package-action";
import { useRouter } from "next/navigation";
import { handleRequestPlanChange } from "../admin/dashboard/actions/update-user-plan";
import { notificateN8n } from "@/lib/actions/supabase-actions/n8n-notification-request";
import { PaymentModal } from "@/components/payment-modal";

// Tipagem para os planos
interface PlanConfig {
  badge: string;
  iconBg: string;
  badgeBg: string;
  titleColor: string;
  border: string;
  button: string;
  limite: number;
  destaquesPermitidos: number;
  price: number;
  benefits: string[];
}

interface Plans {
  [key: string]: PlanConfig;
}

export default function PlanosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | null>(null);

  // Plan configuration with prices
  const PLANS: Plans = {
    "Plano Básico": {
      badge: "BÁSICO",
      iconBg: "bg-blue-500",
      badgeBg: "bg-blue-100 text-blue-700",
      titleColor: "text-blue-800",
      border: "border-blue-200 bg-blue-50/80",
      button: "bg-blue-600 hover:bg-blue-700",
      limite: 10,
      destaquesPermitidos: 1,
      price: 99000.00,
      benefits: [
        "Até 10 imóveis ativos",
        "1 anúncio em destaque",
        "Suporte prioritário"
      ]
    },
    "Plano Professional": {
      badge: "PRO",
      iconBg: "bg-purple-600",
      badgeBg: "bg-purple-100 text-purple-700",
      titleColor: "text-purple-800",
      border: "border-purple-200 bg-purple-50/80",
      button: "bg-purple-600 hover:bg-purple-700",
      limite: 50,
      destaquesPermitidos: 3,
      price: 199000.00,
      benefits: [
        "Até 50 imóveis ativos",
        "3 anúncios em destaque",
        "Relatórios de desempenho",
        "Suporte prioritário",
        "Exposição em Redes Sociais"
      ]
    },
    "Plano Super": {
      badge: "SUPER",
      iconBg: "bg-orange-500",
      badgeBg: "bg-orange-100 text-orange-600",
      titleColor: "text-orange-600",
      border: "border-orange-200 bg-orange-50/80",
      button: "bg-orange-500 hover:bg-orange-600",
      limite: 1000,
      destaquesPermitidos: 5,
      price: 499000.00,
      benefits: [
        "Imóveis ilimitados",
        "5 anúncios em destaque",
        "Consultoria exclusiva",
        "Suporte VIP 24h",
        "Exposição em Redes Sociais",
      ]
    }
  };

  const PLAN_NAME_MAP: Record<string, string> = {
    "BÁSICO": "Plano Básico",
    "PROFESSIONAL": "Plano Professional",
    "SUPER": "Plano Super"
  };

  // Memoize a função para evitar recriações desnecessárias
  const fetchUserPlan = useCallback(async () => {
  if (!user?.id) {
    setLoading(false);
    return;
  }

  try {
    const plan = await getUserPlan(user.id);

    const rawPlanName = plan?.nome || null;

    // Se for FREE, simplesmente não faz nada
    if (rawPlanName === "FREE") {
      setLoading(false);
      return;
    }

    // Converte para o nome que o código entende
    const mappedPlanName = rawPlanName ? PLAN_NAME_MAP[rawPlanName] || null : null;

    setCurrentPlan(mappedPlanName);
  } catch (err) {
    setError("Erro ao carregar seu plano atual");
  } finally {
    setLoading(false);
  }
}, [user]);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  const handlePlanSelection = useCallback((planName: string) => {
    if (!user?.id) {
      router.push("/login?redirect=/planos");
      return;
    }
    
    setSelectedPlan(planName);
    setShowPaymentModal(true);
    setPaymentStatus(null);
    setError("");
  }, [user, router]);

  const confirmPayment = useCallback(async () => {
    if (!selectedPlan || !user?.id) return;

    setUpgrading(selectedPlan);
    setPaymentStatus("pending");
    setError("");

    try {
      const result = await handleRequestPlanChange(user.id, selectedPlan);

      if (result.success) {
        setPaymentStatus("confirmed");
        await notificateN8n("plan_subscription", {
          agentName: user.primeiro_nome,
          planType: selectedPlan
        });
        setTimeout(() => {
          setSuccess(
            `Solicitação de atualização para o plano ${selectedPlan} enviada com sucesso. Aguarde aprovação do administrador.`
          );
          setShowPaymentModal(false);
          setUpgrading(null);
          setPaymentStatus(null);
        }, 2000);
      } else {
        throw new Error(result.error || "Erro ao solicitar atualização de plano");
      }
    } catch (err) {
      console.error("Erro ao solicitar plano:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao solicitar atualização de plano"
      );
      setShowPaymentModal(false);
      setUpgrading(null);
      setPaymentStatus(null);
    }
  }, [selectedPlan, user]);

  const cancelPayment = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setPaymentStatus(null);
    setError("");
  }, []);

  const isCurrentPlan = useCallback((planName: string) => currentPlan === planName, [currentPlan]);
  const isUpgrading = useCallback((planName: string) => upgrading === planName, [upgrading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-16 px-4 flex flex-col items-center">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Escolha seu plano ideal
        </h1>
        <p className="text-gray-600 text-lg mb-12">
          Compare os benefícios e encontre o plano perfeito para suas necessidades.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center flex-wrap">
        {Object.entries(PLANS).map(([planName, planConfig]) => (
          <Card
            key={planName}
            className={`relative flex-1 min-w-[280px] max-w-[350px] rounded-2xl border ${planConfig.border} p-8 flex flex-col ${
              isCurrentPlan(planName) ? "ring-2 ring-offset-2 ring-blue-500" : ""
            }`}
          >
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 ${planConfig.iconBg} text-white rounded-full p-3 shadow-md border-4 border-white`}>
              <Star className="w-6 h-6" />
            </div>

            <span className={`mt-6 mb-3 inline-block px-3 py-1 rounded-full ${planConfig.badgeBg} text-xs font-bold tracking-wide`}>
              {planConfig.badge}
            </span>

            <h3 className={`text-2xl font-bold mb-4 ${planConfig.titleColor}`}>
              {planName}
            </h3>

            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {planConfig.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                <span className="text-sm font-normal text-gray-500">/mês</span>
              </p>
              <p className="text-gray-700">
                <span className="font-bold">{planConfig.limite}</span> imóveis permitidos
              </p>
              <p className="text-gray-700">
                <span className="font-bold">{planConfig.destaquesPermitidos}</span> destaques incluídos
              </p>
            </div>

            <ul className="text-gray-700 mb-6 space-y-3 w-full text-left flex-grow">
              {planConfig.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {isCurrentPlan(planName) ? (
              <button
                disabled
                className="w-full py-3 rounded-lg font-medium text-white bg-green-500 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Plano Atual
              </button>
            ) : (
              <button
                className={`w-full ${planConfig.button} text-white py-3 rounded-lg font-medium transition-colors hover:shadow-md flex items-center justify-center ${
                  isUpgrading(planName) ? "opacity-75" : ""
                }`}
                onClick={() => handlePlanSelection(planName)}
                disabled={isUpgrading(planName)}
              >
                {isUpgrading(planName) ? "Processando..." : "Escolher Plano"}
              </button>
            )}
          </Card>
        ))}
      </div>

      {/* Modal de Pagamento */}
      <PaymentModal 
        showPaymentModal={showPaymentModal}
        paymentStatus={paymentStatus}
        selectedPlan={selectedPlan}
        cancelPayment={cancelPayment}
        confirmPayment={confirmPayment}
      />

      {/* Mensagens de Status */}
      {success && (
        <div className="mt-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-6 py-3.5 rounded-xl animate-in fade-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-6 py-3.5 rounded-xl animate-in fade-in slide-in-from-top-5">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </section>
  );
}