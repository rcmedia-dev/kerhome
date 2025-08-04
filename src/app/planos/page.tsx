'use client';

import { Star, CheckCircle2, X, CreditCard, Building2, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { updateUserPlan } from "@/lib/actions/update-user-plan";
import { getUserPlan } from "@/lib/actions/supabase-actions/get-user-package-action";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const PLANS = {
    "Plano Básico": {
      badge: "BÁSICO",
      iconBg: "bg-blue-500",
      badgeBg: "bg-blue-100 text-blue-700",
      titleColor: "text-blue-800",
      border: "border-blue-200 bg-blue-50/80",
      button: "bg-blue-600 hover:bg-blue-700",
      limite: 10,
      destaquesPermitidos: 1,
      price: 99.90,
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
      price: 199.90,
      benefits: [
        "Até 50 imóveis ativos",
        "3 anúncios em destaque",
        "Relatórios de desempenho",
        "Suporte prioritário"
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
      price: 499.90,
      benefits: [
        "Imóveis ilimitados",
        "5 anúncios em destaque",
        "Consultoria exclusiva",
        "Suporte VIP 24h"
      ]
    }
  };

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const plan = await getUserPlan(user.id);
        setCurrentPlan(plan?.nome || null);
      } catch (err) {
        console.error("Erro ao carregar plano:", err);
        setError("Erro ao carregar seu plano atual");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [user]);

  const handlePlanSelection = (planName: string) => {
    if (!user?.id) {
      router.push("/login?redirect=/planos");
      return;
    }
    
    setSelectedPlan(planName);
    setShowPaymentModal(true);
    setPaymentStatus(null);
  };

  const confirmPayment = async () => {
    if (!selectedPlan || !user?.id) return;
    
    setUpgrading(selectedPlan);
    setPaymentStatus('pending');
    
    try {
      const planConfig = PLANS[selectedPlan as keyof typeof PLANS];
      
      const result = await updateUserPlan(user.id, {
        nome: selectedPlan,
        limite: planConfig.limite,
        restante: planConfig.limite,
        destaques: true,
        destaques_permitidos: planConfig.destaquesPermitidos,
      });

      if (result.success) {
        setPaymentStatus('confirmed');
        setTimeout(() => {
          setCurrentPlan(selectedPlan);
          setSuccess(`Plano atualizado com sucesso para ${selectedPlan}`);
          setShowPaymentModal(false);
          setUpgrading(null);
          setPaymentStatus(null);
        }, 2000);
      } else {
        throw new Error(result.error || "Erro ao atualizar plano");
      }
    } catch (err) {
      console.error("Erro ao atualizar plano:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar plano");
      setShowPaymentModal(false);
      setUpgrading(null);
      setPaymentStatus(null);
    }
  };

  const cancelPayment = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setPaymentStatus(null);
  };

  const isCurrentPlan = (planName: string) => currentPlan === planName;
  const isUpgrading = (planName: string) => upgrading === planName;

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

      {/* Payment Confirmation Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          {/* Header com gradient */}
          <div className="relative bg-gradient-to-r from-purple-700 via-purple-600 to-orange-500 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Confirmar Pagamento</h2>
                  <p className="text-purple-100 text-sm">Ative seu plano agora mesmo</p>
                </div>
              </div>
              <button 
                onClick={cancelPayment} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {selectedPlan && (
              <>
                {/* Cartão de resumo do plano */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-orange-50 p-6 rounded-xl border border-purple-100">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-purple-700/20 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                        Plano Selecionado
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedPlan}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
                        {PLANS[selectedPlan as keyof typeof PLANS].price.toLocaleString('pt-AO', { 
                          style: 'currency', 
                          currency: 'AOA' 
                        })}
                      </span>
                      <span className="text-gray-600 text-sm">/mês</span>
                    </div>
                  </div>
                </div>

                {/* Detalhes bancários */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-700" />
                    </div>
                    <h4 className="font-bold text-gray-900">Dados para Transferência</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Banco', value: 'Banco do Brasil' },
                      { label: 'Agência', value: '1234-5' },
                      { label: 'Conta', value: '98765-4' },
                      { label: 'CNPJ', value: '12.345.678/0001-90' },
                      { label: 'Favorecido', value: 'Imobiliária Digital Ltda' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-100">
                        <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                        <span className="text-sm font-mono text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mensagens de status */}
                {paymentStatus === 'confirmed' ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-green-800 mb-1">Pagamento Confirmado!</h3>
                        <p className="text-sm text-green-700">
                          Estamos processando seu pagamento. Você receberá uma confirmação por e-mail em breve.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : paymentStatus === 'pending' ? (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-amber-600 animate-spin" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-800 mb-1">Processando Pagamento...</h3>
                        <p className="text-sm text-amber-700">
                          Aguarde enquanto confirmamos sua transação.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={cancelPayment}
                      className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmPayment}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-700 to-orange-500 text-white rounded-xl font-medium hover:from-purple-800 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      Confirmar Pagamento
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {success && (
        <div className="mt-8 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="mt-8 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-lg animate-in fade-in">
          <span className="font-medium">{error}</span>
        </div>
      )}
    </section>
  );
}