'use client';

import { CreditCard, CheckCircle2, Clock, Copy, Landmark, Smartphone, ReceiptText, Building2, AlertCircle, ShieldAlert, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PlanDetails } from "./payment-modal";

type CheckoutViewProps = {
  selectedPlan: string | null;
  planDetails: PlanDetails | null;
  paymentStatus: "pending" | "confirmed" | null;
  onBack: () => void;
  onConfirm: () => void;
};

export function CheckoutView({
  selectedPlan,
  planDetails,
  paymentStatus,
  onBack,
  onConfirm,
}: CheckoutViewProps) {
  const plan = planDetails;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado com sucesso!`);
  };

  if (paymentStatus === "confirmed") {
    return (
      <motion.div
        key="confirmed-view"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-md p-12 text-center shadow-sm border border-slate-200 mt-12"
      >
        <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Pedido Enviado com Sucesso</h3>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          O plano <span className="font-semibold text-slate-900">{selectedPlan}</span> será ativado logo que validarmos o seu comprovativo.
        </p>
        <button
          onClick={onBack}
          className="w-full py-3 bg-purple-600 text-white rounded-md font-bold text-sm uppercase tracking-widest hover:bg-purple-700 transition-all"
        >
          Voltar ao Dashboard
        </button>
      </motion.div>
    );
  }

  if (paymentStatus === "pending") {
    return (
      <motion.div
        key="pending-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-md p-12 text-center shadow-sm border border-slate-200 mt-12"
      >
        <div className="w-16 h-16 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin mx-auto mb-6" />
        <h3 className="text-xl font-bold text-slate-900 mb-1">A Processar...</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aguardando confirmação segura</p>
      </motion.div>
    );
  }

  return (
    <main className="px-4 md:px-8 mt-6">
      <div className="max-w-2xl mx-auto lg:max-w-7xl">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finalizar Pagamento</h1>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Coluna da Esquerda: Itens e Pagamento */}
          <div className="lg:col-span-2">
            <ul className="space-y-12 sm:space-y-8 mb-12">
               <li className="grid sm:grid-cols-3 items-start gap-4">
                  <div className="flex flex-col sm:items-center sm:flex-row gap-6 sm:col-span-2">
                     <div className="shrink-0 bg-slate-100 p-4 rounded-md sm:w-28 sm:h-28 flex items-center justify-center">
                        <Landmark size={48} className="text-purple-600" />
                     </div>

                     <div>
                        <h3 className="text-base font-semibold text-slate-900">{selectedPlan}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Subscrição Profissional KerCasa</p>
                        <button 
                          onClick={onBack}
                          type="button" 
                          className="text-xs font-medium text-red-600 cursor-pointer mt-2 focus:outline-none hover:underline"
                        >
                          Alterar Plano
                        </button>

                        <div className="flex gap-4 mt-6">
                           <div className="px-3 py-1.5 border border-slate-300 text-slate-900 text-xs rounded-md bg-slate-50">
                              {plan?.billingCycle === 'annually' ? "Faturamento Anual" : "Faturamento Mensal"}
                           </div>
                           <div className="px-3 py-1.5 border border-slate-300 text-slate-900 text-xs rounded-md bg-slate-50">
                              {plan?.limite === Infinity ? "Ilimitado" : `${plan?.limite} Imóveis`}
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="sm:ml-auto">
                     <h3 className="text-lg font-bold text-slate-900">
                        {plan?.price.toLocaleString("pt-AO", { maximumFractionDigits: 0 })} Kz
                     </h3>
                  </div>
               </li>
            </ul>

            <hr className="mb-10 border-slate-200" />

            {/* Dados de Pagamento Section */}
            <div className="mb-12">
               <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-purple-600 rounded-full" />
                  Dados para Transferência
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Banco", value: "Banco BIC", icon: <Building2 className="text-slate-400" size={18} /> },
                    { label: "IBAN", value: "0051.0000.7755.1051.1014.9", icon: <ReceiptText className="text-slate-400" size={18} />, copy: true },
                    { label: "NIF Empresa", value: "5000873160", icon: <AlertCircle className="text-slate-400" size={18} />, copy: true },
                    { label: "Favorecido", value: "RC Gestão de Projectos", icon: <ShieldAlert className="text-slate-400" size={18} /> },
                  ].map((item) => (
                    <div key={item.label} className="p-4 border border-slate-300 rounded-md bg-white flex flex-col justify-between hover:border-purple-300 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        {item.icon}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 overflow-hidden">
                        <span className="text-sm font-bold text-slate-900 truncate tracking-tight">{item.value}</span>
                        {item.copy && (
                          <button 
                            onClick={() => handleCopy(item.value, item.label)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 transition-all shrink-0"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
               </div>

               {/* WhatsApp Support Section */}
               <div className="mt-8 p-6 border border-green-200 bg-green-50 rounded-md flex flex-col sm:flex-row items-center gap-6">
                  <div className="shrink-0 bg-white p-3 rounded-md border border-green-200 shadow-sm">
                     <Smartphone size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                     <h4 className="font-bold text-green-900 text-sm">Ativação Prioritária</h4>
                     <p className="text-xs text-green-700 font-medium">Envie o comprovativo via WhatsApp para ativação em minutos.</p>
                  </div>
                  <a 
                    href="https://wa.me/244929884781?text=Olá!%20Acabei%20de%20realizar%20o%20pagamento%20do%20plano%20e%20gostaria%20de%20enviar%20o%20comprovante."
                    target="_blank"
                    className="py-2 px-6 text-sm font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                     WhatsApp
                     <ArrowRight size={16} />
                  </a>
               </div>
            </div>
          </div>

          {/* Coluna da Direita: Order Details Sidebar */}
          <div>
            <div className="bg-slate-100 border border-slate-200 rounded-md p-6 h-max lg:sticky lg:top-8">
               <h2 className="text-xl font-bold text-slate-900">Resumo da Ordem</h2>

               <ul className="text-slate-600 font-medium mt-8 space-y-4">
                  <li className="flex justify-between items-center text-sm">
                    Subtotal 
                    <span className="text-slate-900 font-bold">
                       {plan?.price.toLocaleString()} Kz
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    Desconto 
                    <span className="text-slate-900 font-bold">0.00 Kz</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    Taxa 
                    <span className="text-slate-900 font-bold">0.00 Kz</span>
                  </li>
                  <li className="pt-4 border-t border-slate-300 flex justify-between items-center text-slate-900">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-orange-600">
                       {(plan?.price || 0).toLocaleString()} Kz
                    </span>
                  </li>
               </ul>

               <div className="mt-8 space-y-3">
                  <button 
                    onClick={onConfirm}
                    type="button"
                    className="w-full px-4 py-3 text-white text-sm font-bold rounded-md cursor-pointer bg-orange-600 hover:bg-orange-700 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    Finalizar Pagamento
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={onBack}
                    className="w-full block text-slate-500 text-sm font-semibold hover:text-slate-900 transition-all text-center"
                  >
                    Continuar a Escolher
                  </button>
               </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
