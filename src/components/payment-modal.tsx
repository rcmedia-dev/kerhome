import { CreditCard, X, Sparkles, Building2, CheckCircle2, Clock, Copy, Landmark, Smartphone, ReceiptText, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";



export type PlanDetails = {
  name: string;
  price: number;
  limite: number;
  destaquesPermitidos: number;
  billingCycle?: 'monthly' | 'annually';
};

type PaymentModalProps = {
  showPaymentModal: boolean;
  selectedPlan: string | null; // Just the name for display if needed
  planDetails: PlanDetails | null; // The full details
  paymentStatus: "pending" | "confirmed" | null;
  cancelPayment: () => void;
  confirmPayment: () => void;
};

// Componente do Modal de Pagamento
export function PaymentModal({
  showPaymentModal,
  paymentStatus,
  selectedPlan,
  planDetails,
  cancelPayment,
  confirmPayment,
}: PaymentModalProps) {
  const plan = planDetails;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado com sucesso!`);
  };

  return (
    <Dialog open={showPaymentModal} onOpenChange={(open) => !open && cancelPayment()}>
      <DialogContent className="sm:max-w-[850px] p-0 rounded-[2.5rem] border-0 shadow-2xl bg-white overflow-hidden">
        <DialogTitle className="sr-only">Confirmar Pagamento do Plano</DialogTitle>
        <DialogDescription className="sr-only">Confirmar a subscrição do plano selecionado e visualizar dados de pagamento.</DialogDescription>

        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* COLUNA ESQUERDA: Resumo do Plano (Estilo Premium) */}
          <div className="md:w-[380px] bg-gradient-to-br from-purple-800 to-indigo-900 p-10 text-white flex flex-col relative overflow-hidden">
            {/* Elementos Decorativos */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex-1">
              <div className="flex justify-between items-start mb-12">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <button
                  onClick={cancelPayment}
                  className="md:hidden p-2 hover:bg-white/20 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="mb-8">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60">Plano Selecionado</span>
                <h3 className="text-4xl font-black mt-2 tracking-tight">{selectedPlan}</h3>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl mb-8">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black text-white">
                    {plan?.price.toLocaleString("pt-AO", { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm font-medium opacity-70">
                    Kz {plan?.billingCycle === 'annually' ? "/ano" : "/mês"}
                  </span>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <p className="text-sm font-medium">
                      {plan?.limite === Infinity ? "Imóveis ilimitados" : `${plan?.limite} propriedades ativas`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <p className="text-sm font-medium">
                      {plan?.destaquesPermitidos} destaques de rede social
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <p className="text-sm font-medium">Suporte prioritário 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-xs opacity-50 font-medium">
                KerCasa • Experiência Imobiliária Digital
              </p>
            </div>
          </div>

          {/* COLUNA DIREITA: Instruções e Ação */}
          <div className="flex-1 bg-gray-50/50 p-8 md:p-12 relative flex flex-col">
            <button
              onClick={cancelPayment}
              className="hidden md:flex absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-all hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <AnimatePresence mode="wait">
              {paymentStatus === "confirmed" ? (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-10"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Pedido Recebido!</h3>
                  <p className="text-gray-600 font-medium max-w-xs mb-8 leading-relaxed">
                    A sua solicitação está a ser processada. O seu plano será ativado assim que o comprovativo for validado.
                  </p>
                  <button
                    onClick={cancelPayment}
                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
                  >
                    Entendido
                  </button>
                </motion.div>
              ) : paymentStatus === "pending" ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-10"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-purple-100 rounded-full animate-spin border-t-purple-600" />
                    <Clock className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Processando...</h3>
                  <p className="text-gray-500 font-medium italic animate-pulse">A aguardar confirmação do sistema</p>
                </motion.div>
              ) : (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col"
                >
                  <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Landmark size={24} className="text-purple-600" />
                    Pagamento via Transferência
                  </h4>

                  <div className="space-y-3 mb-8">
                    {[
                      { label: "Banco", value: "Banco BIC", icon: <Building2 size={16} /> },
                      { label: "IBAN", value: "0051.0000.7755.1051.1014.9", icon: <ReceiptText size={16} />, copy: true },
                      { label: "NIF", value: "5000873160", icon: <AlertCircle size={16} />, copy: true },
                      { label: "Favorecido", value: "RC Gestão de Projectos", icon: <ShieldAlert size={16} /> },
                    ].map((item) => (
                      <div key={item.label} className="group relative bg-white border border-gray-200 rounded-2xl p-4 transition-all hover:shadow-md hover:border-purple-200">
                        <div className="flex justify-between items-center capitalize">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 tracking-[0.2em] mb-1">{item.label}</span>
                            <span className="text-sm font-bold text-gray-900 font-mono tracking-tighter">{item.value}</span>
                          </div>
                          {item.copy && (
                            <button
                              onClick={() => handleCopy(item.value, item.label)}
                              className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-purple-100 hover:text-purple-700 transition-all active:scale-90"
                              title="Copiar dados"
                            >
                              <Copy size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp Support Section */}
                  <div className="bg-green-50 rounded-[2rem] p-6 border border-green-100 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                        <Smartphone size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-black text-green-900 text-sm">Validar Pagamento</h5>
                        <p className="text-[11px] text-green-700 font-medium">Envie o comprovativo via WhatsApp</p>
                      </div>
                      <a
                        href="https://wa.me/244929884781?text=Olá!%20Acabei%20de%20realizar%20o%20pagamento%20do%20plano%20e%20gostaria%20de%20enviar%20o%20comprovante."
                        target="_blank"
                        className="p-2.5 bg-white text-green-600 rounded-xl shadow-sm border border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-green-200/50"
                      >
                        <ArrowRight size={20} />
                      </a>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex gap-4">
                    <button
                      onClick={cancelPayment}
                      className="px-6 py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-900 transition-all"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={confirmPayment}
                      className="flex-1 bg-orange-600 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-700 hover:-translate-y-1 transition-all"
                    >
                      Já Realizei o Pagamento
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

