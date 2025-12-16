import { CreditCard, X, Sparkles, Building2, CheckCircle2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";



export type PlanDetails = {
  name: string;
  price: number;
  limite: number; // or "Infinity" represented as a number if needed, but handled as logic
  destaquesPermitidos: number;
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

  return (
    <Dialog open={showPaymentModal} onOpenChange={(open) => !open && cancelPayment()}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl bg-white">
        <DialogTitle />

        {/* Header fixo */}
        <div className="bg-purple-700 p-6 sticky top-0 z-10">
          <div className="relative flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Confirmar Pagamento</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Ative seu plano agora mesmo
                </p>
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
          {plan && (
            <>
              {/* Resumo do Plano */}
              <div className="relative overflow-hidden bg-purple-50 p-6 rounded-2xl border border-purple-200 shadow-sm">
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">
                      Plano Selecionado
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedPlan}</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-purple-700">
                      {plan.price.toLocaleString("pt-AO", {
                        style: "currency",
                        currency: "AOA",
                      })}
                    </span>
                    <span className="text-gray-600 text-sm">/mês</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    {plan.limite === 1000 ? "Ilimitadas" : plan.limite} propriedades
                  </p>
                </div>
              </div>

              {/* Detalhes Bancários */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Building2 className="w-5 h-5 text-purple-700" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Dados para Transferência
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { label: "Banco", value: "Banco BIC" },
                    { label: "Conta", value: "0051.0000.7755.1051.1014.9" },
                    { label: "NIF", value: "5000873160" },
                    { label: "Favorecido", value: "RC Gestão de Projectos" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-4 bg-white rounded-xl border border-gray-100"
                    >
                      <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">
                        {item.label}:
                      </span>
                      <span className="text-sm font-semibold font-mono text-gray-900 break-all sm:text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp */}
              <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c..." />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-semibold text-green-800">Enviar Comprovativo</h5>
                    <p className="text-sm text-green-700">
                      Envie o comprovante para confirmarmos seu pagamento
                    </p>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Número do WhatsApp:
                    </span>
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
                  Abrir conversa no WhatsApp
                </a>
              </div>

              {/* Estados do Pagamento */}
              {paymentStatus === "confirmed" ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-800 mb-1 text-lg">
                        Pagamento Confirmado!
                      </h3>
                      <p className="text-sm text-green-700">
                        Estamos processando seu pagamento. Você receberá uma confirmação por
                        e-mail em breve.
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
              ) : paymentStatus === "pending" ? (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-7 h-7 text-orange-600 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-bold text-orange-800 mb-1 text-lg">
                        Processando Pagamento...
                      </h3>
                      <p className="text-sm text-orange-700">
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
}
