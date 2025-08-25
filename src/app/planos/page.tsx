'use client';

import { Star, CheckCircle2, X, CreditCard, Building2, Clock, Sparkles, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-context";
import { updateUserPlan } from "@/lib/actions/update-user-plan";
import { getUserPlan } from "@/lib/actions/supabase-actions/get-user-package-action";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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

  // Memoize a função para evitar recriações desnecessárias
  const fetchUserPlan = useCallback(async () => {
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
    setError(""); // Limpa erros anteriores
  }, [user, router]);

  const confirmPayment = useCallback(async () => {
    if (!selectedPlan || !user?.id) return;
    
    setUpgrading(selectedPlan);
    setPaymentStatus('pending');
    setError(""); // Limpa erros anteriores
    
    try {
      const planConfig = PLANS[selectedPlan];
      
      const result = await updateUserPlan(user.id, {
        nome: selectedPlan,
        limite: planConfig.limite,
        restante: planConfig.limite,
        destaques: true,
        destaques_permitidos: planConfig.destaquesPermitidos,
      });

      if (result.success) {
        setPaymentStatus('confirmed');
        // Usar setTimeout para melhor UX
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
  }, [selectedPlan, user, PLANS]);

  const cancelPayment = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setPaymentStatus(null);
    setError(""); // Limpa erros ao cancelar
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

// Componente do Modal de Pagamento separado para melhor performance
const PaymentModal = () => (
  <Dialog open={showPaymentModal} onOpenChange={(open) => !open && cancelPayment()}>
    <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl bg-white">
      <DialogTitle></DialogTitle>
      {/* Header com gradient */}
      <div className="bg-purple-700 p-6 sticky top-0 z-10">
        <div className="relative flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Confirmar Pagamento</h2>
              <p className="text-purple-100 text-sm mt-1">Ative seu plano agora mesmo</p>
            </div>
          </div>
          <button 
            onClick={cancelPayment} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {selectedPlan && (
          <>
            {/* Resumo do Plano */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50/70 to-orange-50/70 p-6 rounded-2xl border border-purple-200 shadow-sm">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-purple-700/10 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">
                    Plano Selecionado
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedPlan}
                </h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-orange-600 bg-clip-text text-transparent">
                    {PLANS[selectedPlan].price.toLocaleString('pt-AO', { 
                      style: 'currency', 
                      currency: 'AOA' 
                    })}
                  </span>
                  <span className="text-gray-600 text-sm">/mês</span>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  {PLANS[selectedPlan].limite === 1000 ? 'Ilimitadas' : PLANS[selectedPlan].limite} propriedades
                </p>
              </div>
            </div>

            {/* Detalhes Bancários */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Building2 className="w-5 h-5 text-purple-700" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Dados para Transferência</h4>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { label: 'Banco', value: 'Banco BIC' },
                  { label: 'Conta', value: '0051.0000.7755.1051.1014.9' },
                  { label: 'NIF', value: '5000873160' },
                  { label: 'Favorecido', value: 'RC Gestão de Projectos' }
                ].map((item) => (
                  <div key={item.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-4 bg-white rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">{item.label}:</span>
                    <span className="text-sm font-semibold font-mono text-gray-900 break-all sm:text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp para envio do comprovativo */}
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.864 3.488"/>
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-green-800">Enviar Comprovativo</h5>
                  <p className="text-sm text-green-700">
                    Envie o comprovante para confirmarmos seu pagamento
                  </p>
                </div>
              </div>
              
              {/* Número de telefone sempre visível */}
              <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Número do WhatsApp:</span>
                  <span className="text-sm font-semibold text-green-800 bg-green-100 px-2 py-1 rounded-md">
                    +244 929 884 781
                  </span>
                </div>
              </div>
              
              <a 
                href="https://wa.me/244929884781?text=Olá!%20Acabei%20de%20realizar%20o%20pagamento%20do%20plano%20e%20gostaria%20de%20enviar%20o%20comprovante."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.864 3.488"/>
                </svg>
                Abrir conversa no WhatsApp
              </a>
            </div>

            {/* Estados do Pagamento */}
            {paymentStatus === 'confirmed' ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 mb-1 text-lg">Pagamento Confirmado!</h3>
                    <p className="text-sm text-green-700">
                      Estamos processando seu pagamento. Você receberá uma confirmação por e-mail em breve.
                    </p>
                  </div>
                </div>
                <button
                  onClick={cancelPayment}
                  className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Concluir
                </button>
              </div>
            ) : paymentStatus === 'pending' ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Clock className="w-7 h-7 text-amber-600 animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 mb-1 text-lg">Processando Pagamento...</h3>
                    <p className="text-sm text-amber-700">
                      Aguarde enquanto confirmamos sua transação.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={cancelPayment}
                  className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmPayment}
                  className="flex-1 px-6 py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
);

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
      <PaymentModal />

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