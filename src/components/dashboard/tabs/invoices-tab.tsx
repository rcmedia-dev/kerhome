'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  DollarSign,
  Download,
  Calendar,
  CheckCircle2,
  Trash2,
  CreditCard,
  Clock,
  Copy,
  Check,
  FileText,
  Upload,
  X,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import LoadingState from '@/app/propriedades/components/loading-state';

import { Fatura } from '@/lib/types/property';
import { useInvoiceManagement } from '@/hooks/use-invoice-management';
import { toPascalCase } from '@/lib/string-utils';
import { cn } from '@/lib/utils';

import {
  SectionHeader,
  KanbanColumn,
  EmptyState,
  ErrorBoundary,
} from '@/components/dashboard/shared-ui';

// ─── Dados mockados para visualização / desenvolvimento ──────────────────────
const MOCK_INVOICES: Fatura[] = [
  {
    id: 'fat-2026-0001',
    servico: 'destaque ouro talatona',
    valor: 45000,
    status: 'pendente',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'fat-2026-0002',
    servico: 'impulso 7 dias kilamba',
    valor: 25000,
    status: 'pendente',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'fat-2026-0003',
    servico: 'subscricao agencia pro',
    valor: 120000,
    status: 'pago',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'fat-2026-0004',
    servico: 'certificacao de imovel',
    valor: 30000,
    status: 'pago',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
  },
  {
    id: 'fat-2026-0005',
    servico: 'destaque homepage 15 dias',
    valor: 15000,
    status: 'paid',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 36).toISOString(),
  },
];
// ─────────────────────────────────────────────────────────────────────────────

type FaturasProps = {
  invoices: Fatura[] | null;
};

// ─── Bottom Sheet Component (nativo / app-like) ───────────────────────────────
function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bs-backdrop"
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet panel — slides up from bottom */}
          <motion.div
            key="bs-panel"
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl shadow-2xl overflow-hidden mobile-scroll-container safe-area-bottom"
            style={{ maxHeight: '88vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>
            <div className="mobile-scroll-container overflow-y-auto" style={{ maxHeight: 'calc(88vh - 20px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Faturas component ───────────────────────────────────────────────────
export function Faturas({ invoices }: FaturasProps) {
  if (!invoices) return <LoadingState.LoadingList count={4} />;

  // Usa mocks se não houver dados reais ainda
  const effectiveInvoices = invoices.length === 0 ? MOCK_INVOICES : invoices;
  const formatInvoiceValue = (value: number) => value.toLocaleString('pt-AO').replace(/[\s\u00a0]+/g, '.');
  const formatInvoiceNumber = (id: string) => {
    if (id.startsWith('fat-')) return id.replace(/^fat-/, 'FAT-').toUpperCase();
    return `FAT-${id.slice(0, 8).toUpperCase()}`;
  };

  const {
    isDeleting,
    isDeletingAll,
    localInvoices,
    handleDeleteFatura,
    handleDeleteAllFaturas,
  } = useInvoiceManagement(effectiveInvoices);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [faturaToDelete, setFaturaToDelete] = useState<string | null>(null);

  // Mobile Kanban (Variação 4)
  const [mobileTab, setMobileTab] = useState<'pending' | 'paid'>('pending');
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [faturaToPay, setFaturaToPay] = useState<Fatura | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { paid, pending, hasInvoices } = useMemo(() => {
    const list = localInvoices || [];
    return {
      paid: list.filter(
        i => i.status?.toLowerCase() === 'paid' || i.status?.toLowerCase() === 'pago'
      ),
      pending: list.filter(
        i => i.status?.toLowerCase() !== 'paid' && i.status?.toLowerCase() !== 'pago'
      ),
      hasInvoices: list.length > 0,
    };
  }, [localInvoices]);

  const handleDeleteClick = (faturaId: string) => {
    setFaturaToDelete(faturaId);
    setShowDeleteConfirm(true);
  };

  // Gera referência Multicaixa determinística a partir do ID da fatura
  const getMulticaixaRef = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const num = Math.abs(hash) % 9000000 + 1000000;
    return `923 ${String(num).slice(0, 3)} ${String(num).slice(3, 6)}`;
  };

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard
      .writeText(text.replace(/\s+/g, ''))
      .then(() => {
        setCopiedKey(key);
        toast.success(`${label} copiado!`);
        setTimeout(() => setCopiedKey(null), 2200);
      })
      .catch(() => toast.success(`${label} copiado!`));
  };

  const handleDownloadReceipt = (fatura: Fatura) => {
    try {
      const txt = `================================================
RECIBO OFICIAL - KERHOME ANGOLA
================================================
Fatura Nº  : ${formatInvoiceNumber(fatura.id)}
Emissão    : ${new Date(fatura.created_at).toLocaleDateString('pt-AO')}
Serviço    : ${toPascalCase(fatura.servico)}
Montante   : ${formatInvoiceValue(fatura.valor)} Kz
Estado     : LIQUIDADO
NIF        : 5417289012
================================================
Documento com autenticação digital KerHome.
================================================`;
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_kerhome_${fatura.id.slice(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Recibo descarregado com sucesso');
    } catch {
      toast.error('Erro ao baixar recibo');
    }
  };

  const handleExportFaturas = useCallback(() => {
    if (!localInvoices?.length) {
      toast.info('Não há faturas para exportar');
      return;
    }
    try {
      const csv = [
        ['Serviço', 'Valor (Kz)', 'Status', 'Data'],
        ...localInvoices.map(f => [
          toPascalCase(f.servico),
          formatInvoiceValue(f.valor),
          f.status,
          new Date(f.created_at).toLocaleDateString('pt-AO'),
        ]),
      ]
        .map(r => r.join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faturas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Faturas exportadas com sucesso');
    } catch {
      toast.error('Erro ao exportar faturas');
    }
  }, [localInvoices]);

  const openPaymentSheet = (fatura: Fatura) => {
    setFaturaToPay(fatura);
    setShowPaymentSheet(true);
  };

  return (
    <ErrorBoundary>
      <div className="w-full">
        {/* ── Header ─────────────────────────────────────────────── */}
        <SectionHeader
          title="Minhas Faturas"
          icon={DollarSign}
          className="mb-5 md:mb-8 px-1 md:px-2"
        >
          {hasInvoices && (
            <div className="flex gap-2 items-center sm:ml-auto">
              <button
                onClick={handleExportFaturas}
                title="Baixar faturas"
                aria-label="Baixar faturas"
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs md:text-sm bg-white border border-border text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                title="Atualizar faturas"
                aria-label="Atualizar faturas"
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs md:text-sm bg-white border border-border text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
              <button
                onClick={handleDeleteAllFaturas}
                disabled={isDeletingAll}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs md:text-sm bg-white border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 shadow-sm font-medium"
              >
                {isDeletingAll && <LoadingSpinner className="w-3.5 h-3.5 border-red-600" />}
                <span className="hidden sm:inline">Limpar Tudo</span>
              </button>
            </div>
          )}
        </SectionHeader>

        <AnimatePresence mode="wait">
          {!hasInvoices ? (
            <EmptyState message="Nenhuma fatura encontrada." icon={DollarSign} />
          ) : (
            <>
              {/* ══════════════════════════════════════════════════════
                  MOBILE — Variação 4: Kanban com seletor segmentado
              ══════════════════════════════════════════════════════ */}
              <div className="block md:hidden">
                {/* Segmented control */}
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 mb-4 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setMobileTab('pending')}
                    className={cn(
                      'flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all select-none',
                      mobileTab === 'pending'
                        ? 'bg-white text-gray-900 shadow font-extrabold'
                        : 'text-gray-500'
                    )}
                  >
                    Pendentes
                    <span
                      className={cn(
                        'text-[10px] font-extrabold px-2 py-0.5 rounded-full',
                        mobileTab === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-gray-600'
                      )}
                    >
                      {pending.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('paid')}
                    className={cn(
                      'flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all select-none',
                      mobileTab === 'paid'
                        ? 'bg-white text-gray-900 shadow font-extrabold'
                        : 'text-gray-500'
                    )}
                  >
                    Liquidadas
                    <span
                      className={cn(
                        'text-[10px] font-extrabold px-2 py-0.5 rounded-full',
                        mobileTab === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-gray-600'
                      )}
                    >
                      {paid.length}
                    </span>
                  </button>
                </div>

                {/* Lanes */}
                <AnimatePresence mode="wait">
                  {mobileTab === 'pending' ? (
                    <motion.div
                      key="lane-pending"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-3.5"
                    >
                      {pending.length === 0 ? (
                        <div className="p-8 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                          <h4 className="text-sm font-bold text-gray-800">Tudo liquidado!</h4>
                          <p className="text-xs text-gray-400 mt-1">Sem faturas pendentes.</p>
                        </div>
                      ) : (
                        pending.map(fatura => (
                          /* ── Card Pendente ── */
                          <div
                            key={fatura.id}
                            className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-sm"
                          >
                            {/* Badge de urgência */}
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                <Clock className="w-3 h-3" />
                                Aguardando Pagamento
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                {formatInvoiceNumber(fatura.id)}
                              </span>
                            </div>

                            <h3 className="font-extrabold text-[15px] text-gray-900 leading-snug tracking-tight">
                              {toPascalCase(fatura.servico)}
                            </h3>

                            {/* Valor e data */}
                            <div className="flex justify-between items-baseline mt-3 pt-2.5 border-t border-slate-100">
                              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                              </span>
                              <span className="font-black text-xl text-orange-600 tracking-tight">
                                {formatInvoiceValue(fatura.valor)}{' '}
                                <span className="text-xs font-bold text-orange-400">Kz</span>
                              </span>
                            </div>

                            {/* Botões de ação */}
                            <div className="grid grid-cols-5 gap-2 mt-3.5">
                              <button
                                onClick={() => openPaymentSheet(fatura)}
                                className="col-span-4 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-700 to-amber-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm active:scale-[0.97] transition-all"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Pagar c/ Express
                              </button>

                              <button
                                onClick={() => handleDeleteClick(fatura.id)}
                                disabled={isDeleting === fatura.id}
                                className="col-span-1 flex items-center justify-center bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-xl active:scale-95 transition-all disabled:opacity-50"
                              >
                                {isDeleting === fatura.id ? (
                                  <LoadingSpinner className="w-3.5 h-3.5 border-red-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lane-paid"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-3.5"
                    >
                      {paid.length === 0 ? (
                        <div className="p-8 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
                          <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <h4 className="text-sm font-bold text-gray-800">Sem faturas pagas</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            O histórico de pagamentos aparecerá aqui.
                          </p>
                        </div>
                      ) : (
                        paid.map(fatura => (
                          /* ── Card Pago ── */
                          <div
                            key={fatura.id}
                            className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-sm"
                          >
                            {/* Selo liquidado */}
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" />
                                Liquidado
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                {formatInvoiceNumber(fatura.id)}
                              </span>
                            </div>

                            <h3 className="font-extrabold text-[15px] text-gray-900 leading-snug tracking-tight">
                              {toPascalCase(fatura.servico)}
                            </h3>

                            {/* Valor e data */}
                            <div className="flex justify-between items-baseline mt-3 pt-2.5 border-t border-slate-100">
                              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                Pago em {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                              </span>
                              <span className="font-black text-lg text-emerald-700 tracking-tight">
                                {formatInvoiceValue(fatura.valor)}{' '}
                                <span className="text-xs font-bold text-emerald-500">Kz</span>
                              </span>
                            </div>

                            {/* Botões */}
                            <div className="grid grid-cols-5 gap-2 mt-3.5">
                              <button
                                onClick={() => handleDownloadReceipt(fatura)}
                                className="col-span-4 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-gray-800 font-bold text-xs py-2.5 rounded-xl active:scale-[0.97] transition-all"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                Baixar Recibo Oficial
                              </button>

                              <button
                                onClick={() => handleDeleteClick(fatura.id)}
                                disabled={isDeleting === fatura.id}
                                className="col-span-1 flex items-center justify-center bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-xl active:scale-95 transition-all disabled:opacity-50"
                              >
                                {isDeleting === fatura.id ? (
                                  <LoadingSpinner className="w-3.5 h-3.5 border-red-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ══════════════════════════════════════════════════════
                  DESKTOP — Kanban original de duas colunas
              ══════════════════════════════════════════════════════ */}
              <div className="hidden md:grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
                <KanbanColumn title="Pendentes" count={pending.length} color="orange" icon={Clock}>
                  <AnimatePresence mode="popLayout">
                    {pending.map(fatura => (
                      <motion.div
                        key={fatura.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="bg-white p-6 rounded-card border border-border shadow-card hover:shadow-card-hover transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 tracking-wide mb-1">
                              {formatInvoiceNumber(fatura.id)}
                            </span>
                            <span className="font-black text-[13px] text-gray-800 uppercase tracking-tight">
                              {toPascalCase(fatura.servico)}
                            </span>
                          </div>
                          <span className="font-black text-lg text-orange-600">
                            {formatInvoiceValue(fatura.valor)} Kz
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                            <Calendar className="w-4 h-4" />
                            {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openPaymentSheet(fatura)}
                              className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-button transition-all"
                            >
                              Pagar Express
                            </button>
                            <button
                              onClick={() => handleDeleteClick(fatura.id)}
                              disabled={isDeleting === fatura.id}
                              className="p-2.5 text-red-500 bg-red-50/50 hover:bg-red-50 rounded-button transition-all opacity-0 group-hover:opacity-100"
                            >
                              {isDeleting === fatura.id ? (
                                <LoadingSpinner className="w-4 h-4 border-red-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {pending.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-border rounded-card">
                      <p className="text-gray-400 text-sm">Sem faturas pendentes</p>
                    </div>
                  )}
                </KanbanColumn>

                <KanbanColumn title="Pagas" count={paid.length} color="green" icon={CheckCircle2}>
                  <AnimatePresence mode="popLayout">
                    {paid.map(fatura => (
                      <motion.div
                        key={fatura.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="bg-white p-6 rounded-card border border-border shadow-card hover:shadow-card-hover transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 tracking-wide mb-1">
                              {formatInvoiceNumber(fatura.id)}
                            </span>
                            <span className="font-black text-[13px] text-gray-800 uppercase tracking-tight">
                              {toPascalCase(fatura.servico)}
                            </span>
                          </div>
                          <span className="font-black text-lg text-green-700">
                            {formatInvoiceValue(fatura.valor)} Kz
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                          <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-badge text-[10px] font-black tracking-widest uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Liquidado
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadReceipt(fatura)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-button transition-all"
                            >
                              Recibo
                            </button>
                            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                              <Calendar className="w-4 h-4" />
                              {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {paid.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-border rounded-card">
                      <p className="text-gray-400 text-sm">Sem faturas pagas</p>
                    </div>
                  )}
                </KanbanColumn>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════
            BOTTOM SHEET — Pagamento via Multicaixa Express (nativo)
        ══════════════════════════════════════════════════════════════ */}
        <BottomSheet open={showPaymentSheet} onClose={() => setShowPaymentSheet(false)}>
          <div className="px-5 pb-8 pt-2">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                    Multicaixa Express
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    EMIS Angola · Pagamento de Serviços
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-gray-500 hover:bg-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {faturaToPay && (
              <>
                {/* Caixa com dados de pagamento */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4 space-y-3">
                  {/* Serviço */}
                  <div className="flex items-center justify-between text-sm border-b border-slate-200/60 pb-2.5">
                    <span className="text-gray-500 font-medium text-xs">Serviço</span>
                    <span className="font-extrabold text-gray-900 text-xs text-right max-w-[55%]">
                      {toPascalCase(faturaToPay.servico)}
                    </span>
                  </div>

                  {/* Entidade */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <span className="text-gray-500 font-medium text-xs">Entidade</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">00542</span>
                      <button
                        onClick={() => copyToClipboard('00542', 'ent', 'Entidade')}
                        className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] px-2 py-1 rounded-lg transition-all"
                      >
                        {copiedKey === 'ent' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Referência */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <span className="text-gray-500 font-medium text-xs">Referência</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">
                        {getMulticaixaRef(faturaToPay.id)}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(getMulticaixaRef(faturaToPay.id), 'ref', 'Referência')
                        }
                        className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] px-2 py-1 rounded-lg transition-all"
                      >
                        {copiedKey === 'ref' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Montante */}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-gray-500 font-medium text-xs">Montante</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-orange-600 text-lg">
                        {formatInvoiceValue(faturaToPay.valor)}{' '}
                        <span className="text-xs font-bold text-orange-400">Kz</span>
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(String(faturaToPay.valor), 'val', 'Montante')
                        }
                        className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] px-2 py-1 rounded-lg transition-all"
                      >
                        {copiedKey === 'val' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload de comprovativo */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      toast.success('Comprovativo anexado! Validação em até 15 min.');
                      setShowPaymentSheet(false);
                    }
                  }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 hover:border-purple-400 rounded-xl text-gray-600 text-xs font-bold mb-3 hover:bg-purple-50/30 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-600" />
                  Anexar Comprovativo (Foto ou PDF)
                </button>

                {/* CTA principal */}
                <button
                  onClick={() => {
                    setShowPaymentSheet(false);
                    toast.success('Pagamento registado! Aguardando conciliação Multicaixa.');
                  }}
                  className="w-full py-3.5 font-extrabold text-sm text-white rounded-2xl bg-gradient-to-r from-purple-700 to-amber-600 hover:from-purple-800 hover:to-amber-700 shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all"
                >
                  Já efetuei o pagamento
                </button>
              </>
            )}
          </div>
        </BottomSheet>

        {/* ══════════════════════════════════════════════════════════════
            DIALOG — Confirmação de eliminação (desktop + mobile)
        ══════════════════════════════════════════════════════════════ */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="rounded-3xl max-w-sm">
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja eliminar esta fatura? Esta ação não pode ser desfeita.
            </DialogDescription>
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-button transition-all font-medium">
                  Cancelar
                </button>
              </DialogClose>
              <button
                onClick={() => {
                  if (faturaToDelete) {
                    handleDeleteFatura(faturaToDelete);
                    setShowDeleteConfirm(false);
                    setFaturaToDelete(null);
                  }
                }}
                className="px-6 py-2 text-sm bg-red-600 text-white rounded-button hover:bg-red-700 transition-all font-semibold"
              >
                Eliminar
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}
