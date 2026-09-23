'use client';

import { CheckCircle2, XCircle, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { getUserPlan } from "@/lib/functions/supabase-actions/get-user-package-action";
import { useRouter } from "next/navigation";
import { handleRequestPlanChange } from "@/app/admin/dashboard/actions/update-user-plan";
import { motion, AnimatePresence } from "framer-motion";
import { CheckoutView } from "@/components/checkout-view";
import { useUserStore } from "@/lib/store/user-store";
import ClientOnly from "@/components/layout/ClientOnly";

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

  const PLAN_KEY_MAP: Record<string, string> = {
    "Plano Básico": "BÁSICO",
    "Plano Professional": "PROFESSIONAL",
    "Plano Super": "SUPER",
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

  const handlePlanSelection = (planKey: string) => {
    if (!user?.id) {
      router.push("/login?redirect=/planos");
      return;
    }
    const planDisplayName = PLAN_NAME_MAP[planKey] || planKey;
    setSelectedPlan(planDisplayName as PlanName);
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

  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-white font-sans text-gray-900 overflow-x-hidden pt-10 md:pt-24 pb-24">
        <AnimatePresence mode="wait">
        {view === 'pricing' ? (
          <motion.div
            key="pricing-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="container px-4 sm:px-5 mx-auto"
          >
            <div className="flex flex-col items-center text-center w-full mb-8 md:mb-16">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black tracking-[0.16em] uppercase text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.5l7.1-.6L12 2z"/></svg>
                Planos Kercasa
              </span>
              <h1 className="mt-3 md:mt-4 text-[1.75rem] leading-tight sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                Escolha o plano certo para si
              </h1>
              <p className="mt-2.5 md:mt-3 max-w-xl text-[15px] md:text-base leading-relaxed text-gray-500 font-medium">
                Comece e evolua quando fizer sentido. Sem surpresas — cancele quando quiser.
              </p>
              <div
                className="mt-5 md:mt-8 flex w-full max-w-[320px] border-2 border-purple-600 rounded-2xl overflow-hidden p-1 bg-gray-50"
                role="group"
                aria-label="Ciclo de faturação"
              >
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  aria-pressed={billingCycle === 'monthly'}
                  className={`flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-bold transition-all duration-300 relative z-10 ${
                    billingCycle === 'monthly' ? "text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:text-purple-600"
                  }`}
                >
                  {billingCycle === 'monthly' && (
                    <motion.div layoutId="cycle-bg" className="absolute inset-0 bg-purple-600 rounded-xl -z-10" />
                  )}
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annually')}
                  aria-pressed={billingCycle === 'annually'}
                  className={`flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-bold transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 ${
                    billingCycle === 'annually' ? "text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:text-purple-600"
                  }`}
                >
                  {billingCycle === 'annually' && (
                    <motion.div layoutId="cycle-bg" className="absolute inset-0 bg-purple-600 rounded-xl -z-10" />
                  )}
                  Anual
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    billingCycle === 'annually'
                      ? "bg-orange-500 text-white"
                      : "bg-orange-100 text-orange-600"
                  }`}>
                    −20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto items-stretch">
              {Object.entries(PLANS).map(([planName, planConfig]) => {
                const isRecommended = planName === 'PROFESSIONAL';
                const isCurrent = isCurrentPlan(planName);

                const displayPrice = billingCycle === 'annually'
                  ? planConfig.price * 0.8
                  : planConfig.price;

                const annualSavings = Math.round(planConfig.price * 0.2);

                const ctaLabel =
                  planName === 'PROFESSIONAL'
                    ? 'Escolher Professional'
                    : planName === 'SUPER'
                      ? 'Escolher Super'
                      : 'Começar';

                return (
                  <article
                    key={planName}
                    className={`relative h-full p-5 sm:p-7 md:p-8 rounded-[20px] border-[1.5px] flex flex-col transition-all duration-300 ${
                      isRecommended
                        ? "border-purple-600 bg-gradient-to-b from-white to-purple-50/60 shadow-[0_24px_60px_rgba(59,7,100,0.18)] md:scale-105 z-10"
                        : isCurrent
                          ? "border-orange-500 bg-orange-50/20 shadow-lg"
                          : "border-gray-200 bg-white hover:border-purple-300 hover:-translate-y-1 shadow-sm"
                    }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-px right-0 bg-gradient-to-br from-purple-600 to-orange-500 text-white px-5 py-1.5 text-[10px] font-black tracking-[0.12em] uppercase rounded-tr-[20px] rounded-bl-[14px]">
                        Mais popular
                      </span>
                    )}

                    <div className={`text-[11px] md:text-xs font-black tracking-[0.14em] uppercase mb-2.5 ${
                      isRecommended ? "text-purple-600" : "text-gray-400"
                    }`}>
                      {planConfig.badge}
                    </div>

                    <div className="flex items-end gap-1 leading-none">
                      <span className="text-base md:text-lg font-extrabold text-gray-900 pb-1.5">Kz</span>
                      <span className={`text-[2.5rem] sm:text-5xl font-black tracking-tight tabular-nums ${
                        isRecommended ? "text-purple-900" : "text-gray-900"
                      }`}>
                        {Math.round(displayPrice).toLocaleString("pt-AO", { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-sm md:text-base font-extrabold text-gray-500 pb-1.5">/mês</span>
                    </div>
                    <p className="mt-2 text-[12px] md:text-xs font-semibold text-gray-500">
                      {billingCycle === 'annually' ? (
                        <>
                          Faturado anualmente · <span className="text-green-600 font-extrabold">poupe {annualSavings.toLocaleString("pt-AO")} Kz/mês</span>
                        </>
                      ) : (
                        <>
                          por mês · cobrado mensalmente
                        </>
                      )}
                    </p>

                    <div className={`h-px my-4 md:my-5 ${isRecommended ? "bg-purple-200" : "bg-gray-100"}`} />

                    <ul className="space-y-3 flex-1 mb-6 md:mb-8">
                      {planConfig.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-[13px] md:text-sm font-semibold text-gray-700 leading-snug">
                          <span className={`mt-0.5 w-5 h-5 shrink-0 inline-flex items-center justify-center rounded-full text-white ${
                            isRecommended ? "bg-purple-600" : "bg-orange-600"
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <button
                        type="button"
                        disabled
                        className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200 cursor-not-allowed"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          O Seu Plano Ativo
                          <ShieldCheck size={18} />
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePlanSelection(planName)}
                        disabled={isUpgrading(planName)}
                        className={`group w-full min-h-[48px] py-3.5 px-5 rounded-2xl font-black text-[13px] md:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                          isRecommended
                            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/20 hover:-translate-y-0.5"
                            : planName === 'SUPER'
                              ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
                              : "bg-white text-purple-700 border-[1.5px] border-purple-300 hover:bg-purple-50"
                        } ${isUpgrading(planName) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {isUpgrading(planName) ? "Processando..." : ctaLabel}
                        {!isUpgrading(planName) && (
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        )}
                      </button>
                    )}

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-tight text-gray-400 text-center">
                      Sem cartão · cancele quando quiser
                    </p>
                  </article>
                );
              })}
            </div>

            <p className="mt-8 md:mt-10 text-center text-xs font-semibold text-gray-500 max-w-xl mx-auto">
              IVA incluso quando aplicável · Preços em Kwanzas (AOA).{" "}
              <strong className="text-gray-900">Cancele quando quiser.</strong>
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Pagamento seguro
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Ativação imediata
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
                Suporte humano
              </span>
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
              selectedPlan={selectedPlan}
              planDetails={selectedPlan ? {
                name: selectedPlan,
                price: billingCycle === 'annually' ? PLANS[PLAN_KEY_MAP[selectedPlan]].price * 0.8 * 12 : PLANS[PLAN_KEY_MAP[selectedPlan]].price,
                limite: PLANS[PLAN_KEY_MAP[selectedPlan]].limite,
                destaquesPermitidos: PLANS[PLAN_KEY_MAP[selectedPlan]].destaquesPermitidos,
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
    </ClientOnly>
  );
}

