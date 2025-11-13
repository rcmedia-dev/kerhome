'use client';

import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { getUserPlan } from "@/lib/functions/supabase-actions/get-user-package-action";
import { useRouter } from "next/navigation";
import { handleRequestPlanChange } from "../admin/dashboard/actions/update-user-plan";
import { notificateN8n } from "@/lib/functions/supabase-actions/n8n-notification-request";
import { PaymentModal } from "@/components/payment-modal";
import { useUserStore } from "@/lib/store/user-store";

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

type PlanName = "Plano Básico" | "Plano Professional" | "Plano Super";

export default function PlanosPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | null>(null);

  // PLANOS ATUALIZADOS
  const PLANS: Plans = {
    "Plano Básico": {
      badge: "BÁSICO",
      iconBg: "bg-purple-100",
      badgeBg: "bg-purple-100 text-purple-700",
      titleColor: "text-purple-700",
      border: "border-purple-200",
      button: "bg-purple-700 hover:bg-purple-800",
      limite: 10,
      destaquesPermitidos: 1,
      price: 69000,
      benefits: [
        "Até 10 imóveis ativos",
        "1 anúncio nas redes sociais",
        "Suporte via WhatsApp",
        "Atendimento das 8h às 17h (Seg. a Sex.)"
      ],
    },
    "Plano Professional": {
      badge: "PROFESSIONAL",
      iconBg: "bg-orange-100",
      badgeBg: "bg-orange-100 text-orange-700",
      titleColor: "text-orange-700",
      border: "border-orange-200",
      button: "bg-orange-600 hover:bg-orange-700",
      limite: 50,
      destaquesPermitidos: 10,
      price: 118000,
      benefits: [
        "Até 50 imóveis ativos",
        "10 anúncios nas redes sociais",
        "Suporte via WhatsApp",
        "Atendimento das 8h às 17h (Seg. a Sex.)"
      ],
    },
    "Plano Super": {
      badge: "SUPER",
      iconBg: "bg-pink-100",
      badgeBg: "bg-pink-100 text-pink-700",
      titleColor: "text-pink-700",
      border: "border-pink-200",
      button: "bg-pink-600 hover:bg-pink-700",
      limite: Infinity,
      destaquesPermitidos: 50,
      price: 250000,
      benefits: [
        "Imóveis ilimitados",
        "50 anúncios nas redes sociais",
        "Suporte VIP 24h"
      ],
    },
  };

  const PLAN_NAME_MAP: Record<string, string> = {
    "BÁSICO": "Plano Básico",
    "PROFESSIONAL": "Plano Professional",
    "SUPER": "Plano Super",
  };

  const fetchUserPlan = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const plan = await getUserPlan(user.id);
      const rawPlanName = plan?.nome || null;

      if (rawPlanName === "FREE") {
        setLoading(false);
        return;
      }

      const mappedPlanName = rawPlanName ? PLAN_NAME_MAP[rawPlanName] || null : null;
      setCurrentPlan(mappedPlanName);
    } catch {
      setError("Erro ao carregar seu plano atual");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  const handlePlanSelection = useCallback((planName: PlanName) => {
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
        // await notificateN8n("plan_subscription", {
        //   agentName: user.primeiro_nome,
        //   planType: selectedPlan,
        // });
        setTimeout(() => {
          setSuccess(`Solicitação de atualização para o plano ${selectedPlan} enviada com sucesso.`);
          setShowPaymentModal(false);
          setUpgrading(null);
          setPaymentStatus(null);
        }, 300);
      } else {
        throw new Error(result.error || "Erro ao solicitar atualização de plano");
      }
    } catch (err) {
      console.error("Erro ao solicitar plano:", err);
      setError("Erro ao solicitar atualização de plano");
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-16 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Escolha seu plano
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Expanda seu negócio com os planos criados para cada fase da sua imobiliária.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(PLANS).map(([planName, planConfig]) => (
          <Card
            key={planName}
            className={`relative rounded-2xl border-2 ${planConfig.border} bg-white p-8 flex flex-col transition-all duration-300 hover:shadow-xl ${
              isCurrentPlan(planName)
                ? "ring-2 ring-purple-700 ring-offset-2 scale-105"
                : "hover:scale-105"
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className={`px-4 py-2 rounded-full ${planConfig.badgeBg} text-sm font-bold`}>
                {planConfig.badge}
              </span>
              {isCurrentPlan(planName) && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Atual
                </span>
              )}
            </div>

            <h3 className={`text-2xl font-bold mb-2 ${planConfig.titleColor}`}>
              {planName.replace("Plano ", "")}
            </h3>

            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">
                {planConfig.price.toLocaleString("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                })}
              </p>
              <p className="text-gray-500 text-sm">por mês</p>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {planConfig.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
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
                className={`w-full ${planConfig.button} text-white py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center ${
                  isUpgrading(planName)
                    ? "opacity-75 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handlePlanSelection(planName as PlanName)}
                disabled={isUpgrading(planName)}
              >
                {isUpgrading(planName) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  "Escolher Plano"
                )}
              </button>
            )}
          </Card>
        ))}
      </div>

      <PaymentModal
        showPaymentModal={showPaymentModal}
        paymentStatus={paymentStatus}
        selectedPlan={selectedPlan}
        cancelPayment={cancelPayment}
        confirmPayment={confirmPayment}
      />

      {success && (
        <div className="fixed top-4 right-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-6 py-3.5 rounded-xl animate-in fade-in slide-in-from-top-5 z-50">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-6 py-3.5 rounded-xl animate-in fade-in slide-in-from-top-5 z-50">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </section>
  );
}
