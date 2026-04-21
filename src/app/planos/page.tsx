'use client';

import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { getUserPlan } from "@/lib/functions/supabase-actions/get-user-package-action";
import { useRouter } from "next/navigation";
import { handleRequestPlanChange } from "@/app/admin/dashboard/actions/update-user-plan";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShieldCheck, Zap, ArrowLeft, ArrowRight } from "lucide-react";
import { CheckoutView } from "@/components/checkout-view";
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
  const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [view, setView] = useState<'pricing' | 'checkout'>('pricing');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // PLANOS ATUALIZADOS
  const PLANS: Plans = {
    "BÁSICO": {
      badge: "BÁSICO",
      iconBg: "bg-purple-100",
      badgeBg: "bg-purple-100 text-purple-700",
      titleColor: "text-purple-700",
      border: "border-purple-200",
      button: "bg-purple-700 hover:bg-purple-800",
      limite: 15,
      destaquesPermitidos: 2,
      price: 15000,
      benefits: [
        "Até 15 imóveis ativos",
        "2 destaques mensais",
        "Gestão básica de leads",
        "Suporte via e-mail"
      ]
    },
    "PROFESSIONAL": {
      badge: "PROFESSIONAL",
      iconBg: "bg-orange-100",
      badgeBg: "bg-orange-100 text-orange-700",
      titleColor: "text-orange-700",
      border: "border-orange-200",
      button: "bg-orange-600 hover:bg-orange-700",
      limite: 100,
      destaquesPermitidos: 10,
      price: 35000,
      benefits: [
        "Até 100 imóveis ativos",
        "10 destaques mensais",
        "CRM imobiliário completo",
        "Estatísticas avançadas",
        "Suporte priorizado"
      ]
    },
    "SUPER": {
      badge: "SUPER",
      iconBg: "bg-pink-100",
      badgeBg: "bg-pink-100 text-pink-700",
      titleColor: "text-pink-700",
      border: "border-pink-200",
      button: "bg-pink-600 hover:bg-pink-700",
      limite: 1000,
      destaquesPermitidos: 50,
      price: 85000,
      benefits: [
        "Imóveis Ilimitados",
        "50 destaques mensais",
        "Gestão de equipas",
        "Destaque em newsletter",
        "Gestor de conta dedicado"
      ]
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

      setCurrentPlan(rawPlanName);
    } catch {
      setError("Erro ao carregar seu plano atual");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  const handlePlanSelection = (planName: PlanName) => {
    if (!user?.id) {
      router.push("/login?redirect=/planos");
      return;
    }
    setSelectedPlan(planName);
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmPayment = useCallback(async () => {
    if (!selectedPlan || !user?.id) return;

    setUpgrading(selectedPlan);
    setPaymentStatus("pending");
    setError("");

    try {
      const result = await handleRequestPlanChange(user.id, selectedPlan, {
        nome: user.primeiro_nome,
        email: user.email,
      });

      if (result.success) {
        setPaymentStatus("confirmed");
        setTimeout(() => {
          setSuccess(`Solicitação de atualização para o plano ${selectedPlan} enviada com sucesso.`);
          setView('pricing');
          setUpgrading(null);
          setPaymentStatus(null);
        }, 300);
      } else {
        throw new Error(result.error || "Erro ao solicitar atualização de plano");
      }
    } catch (err) {
      console.error("Erro ao solicitar plano:", err);
      setError("Erro ao solicitar atualização de plano");
      setUpgrading(null);
      setPaymentStatus(null);
    }
  }, [selectedPlan, user]);

  const isCurrentPlan = useCallback((planName: string) => currentPlan === planName, [currentPlan]);
  const isUpgrading = useCallback((planName: string) => upgrading === planName, [upgrading]);

  if (!hasMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden pt-12 md:pt-24 pb-24">
      <AnimatePresence mode="wait">
        {view === 'pricing' ? (
          <motion.div
            key="pricing-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="container px-5 mx-auto"
          >
            <div className="flex flex-col text-center w-full mb-20">
              <h1 className="sm:text-5xl text-4xl font-black title-font mb-4 text-gray-900 tracking-tight">
                Planos e Preços
              </h1>
              <p className="lg:w-2/3 mx-auto leading-relaxed text-lg text-gray-500 font-medium">
                Escolha a solução ideal para acelerar o crescimento da sua imobiliária e dominar o mercado.
              </p>
              <div className="flex mx-auto border-2 border-purple-600 rounded-2xl overflow-hidden mt-8 p-1 bg-gray-50">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`py-2 px-8 rounded-xl font-bold transition-all duration-300 relative z-10 ${
                    billingCycle === 'monthly' ? "text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:text-purple-600"
                  }`}
                >
                  {billingCycle === 'monthly' && (
                    <motion.div layoutId="cycle-bg" className="absolute inset-0 bg-purple-600 rounded-xl -z-10" />
                  )}
                  Mensal
                </button>
                <button 
                  onClick={() => setBillingCycle('annually')}
                  className={`py-2 px-8 rounded-xl font-bold transition-all duration-300 relative z-10 ${
                    billingCycle === 'annually' ? "text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:text-purple-600"
                  }`}
                >
                  {billingCycle === 'annually' && (
                    <motion.div layoutId="cycle-bg" className="absolute inset-0 bg-purple-600 rounded-xl -z-10" />
                  )}
                  Anual <span className="ml-1 text-[10px] text-orange-400 font-black">-20%</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap -m-4 justify-center">
              {Object.entries(PLANS).map(([planName, planConfig]) => {
                const isRecommended = planName === 'PROFESSIONAL';
                const isCurrent = isCurrentPlan(planName);
                
                const displayPrice = billingCycle === 'annually' 
                  ? planConfig.price * 0.8 * 12 
                  : planConfig.price;

                return (
                  <div key={planName} className="p-4 xl:w-1/3 md:w-1/2 w-full">
                    <div className={`h-full p-8 rounded-[2rem] border-2 flex flex-col relative overflow-hidden transition-all duration-500 ${
                      isRecommended 
                        ? "border-purple-600 shadow-2xl shadow-purple-500/10 bg-white scale-105 z-10" 
                        : isCurrent 
                          ? "border-orange-500 bg-orange-50/10 shadow-lg"
                          : "border-gray-200 hover:border-purple-200 bg-white"
                    }`}>
                      {isRecommended && (
                        <span className="bg-purple-600 text-white px-6 py-1.5 tracking-widest text-[10px] font-black absolute right-0 top-0 rounded-bl-3xl uppercase">
                          MAIS POPULAR
                        </span>
                      )}
                      
                      <div className="mb-6">
                        <h2 className="text-sm tracking-[0.2em] title-font mb-1 font-black text-gray-400 uppercase">
                          {planConfig.badge}
                        </h2>
                        <div className="pb-6 mb-6 border-b border-gray-100 mt-2">
                          <h1 className="text-5xl text-gray-900 leading-none flex items-center font-black italic tracking-tighter">
                            <span className="text-2xl mr-1 font-bold not-italic">Kz</span>
                            {displayPrice.toLocaleString("pt-AO", { maximumFractionDigits: 0 })}
                          </h1>
                          <p className="text-gray-400 mt-2 font-medium">
                            {billingCycle === 'annually' ? "cobrado anualmente" : "por mês"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-10 flex-1">
                        {planConfig.benefits.map((benefit, index) => (
                          <p key={index} className="flex items-center text-gray-600 font-medium text-sm leading-relaxed">
                            <span className={`w-5 h-5 mr-3 inline-flex items-center justify-center rounded-full flex-shrink-0 ${
                              isRecommended ? "bg-purple-600 shadow-lg shadow-purple-200" : "bg-orange-600 shadow-lg shadow-orange-100"
                            } text-white`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                            {benefit}
                          </p>
                        ))}
                      </div>

                      {isCurrent ? (
                        <div className="mt-auto space-y-3">
                          <button
                            disabled
                            className="flex items-center justify-center mt-auto text-orange-600 bg-orange-50 border-0 py-4 px-6 w-full focus:outline-none rounded-2xl font-black text-sm uppercase tracking-wider"
                          >
                            O Seu Plano Ativo
                            <ShieldCheck size={18} className="ml-2" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handlePlanSelection(planName as PlanName)}
                          disabled={isUpgrading(planName)}
                          className={`flex items-center mt-auto text-white border-0 py-4 px-6 w-full focus:outline-none rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 group ${
                            isRecommended 
                              ? "bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-500/20 hover:-translate-y-1" 
                              : "bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20 hover:-translate-y-1"
                          } ${isUpgrading(planName) ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isUpgrading(planName) ? "Processando..." : "Subscrever"}
                          {!isUpgrading(planName) && (
                            <ArrowRight size={20} className="ml-auto transition-transform group-hover:translate-x-2" />
                          )}
                        </button>
                      )}
                      
                      <p className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-tighter">
                        Subscrição segura e suporte dedicado
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="checkout-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="container px-5 mx-auto max-w-6xl"
          >
            <CheckoutView 
              selectedPlan={PLAN_NAME_MAP[selectedPlan as PlanName] || selectedPlan}
              planDetails={selectedPlan ? {
                name: selectedPlan,
                price: billingCycle === 'annually' ? PLANS[selectedPlan].price * 0.8 * 12 : PLANS[selectedPlan].price,
                limite: PLANS[selectedPlan].limite,
                destaquesPermitidos: PLANS[selectedPlan].destaquesPermitidos,
                billingCycle: billingCycle
              } : null}
              paymentStatus={paymentStatus}
              onBack={() => setView('pricing')}
              onConfirm={confirmPayment}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-4 right-4 flex items-center gap-3 bg-white border-2 border-green-500 text-green-800 px-6 py-4 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <span className="font-black text-sm">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-4 right-4 flex items-center gap-3 bg-white border-2 border-red-500 text-red-800 px-6 py-4 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="font-black text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

