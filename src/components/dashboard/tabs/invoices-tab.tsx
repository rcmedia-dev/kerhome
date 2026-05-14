import React, { useState, useMemo, useCallback } from 'react';
import { DollarSign, Download, AlertTriangle, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import LoadingState from '@/app/propriedades/components/loading-state';

import { Fatura } from '@/lib/types/property';
import { useInvoiceManagement } from '@/hooks/use-invoice-management';
import { toPascalCase } from '@/lib/string-utils';

import {
  SectionHeader,
  KanbanColumn,
  EmptyState,
  ErrorBoundary
} from '@/components/dashboard/shared-ui';

type FaturasProps = {
  invoices: Fatura[] | null
}

export function Faturas({ invoices }: FaturasProps) {
  if (!invoices) return <LoadingState.LoadingList count={4} />;
  
  const {
    isDeleting,
    isDeletingAll,
    localInvoices,
    handleDeleteFatura,
    handleDeleteAllFaturas
  } = useInvoiceManagement(invoices);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [faturaToDelete, setFaturaToDelete] = useState<string | null>(null);

  const { paid, pending, hasInvoices } = useMemo(() => {
    const list = localInvoices || [];
    return {
      paid: list.filter(i => i.status?.toLowerCase() === 'paid' || i.status?.toLowerCase() === 'pago'),
      pending: list.filter(i => i.status?.toLowerCase() !== 'paid' && i.status?.toLowerCase() !== 'pago'),
      hasInvoices: list.length > 0
    };
  }, [localInvoices]);

  const handleDeleteClick = (faturaId: string) => {
    setFaturaToDelete(faturaId);
    setShowDeleteConfirm(true);
  };

  const handleExportFaturas = useCallback(() => {
    if (!localInvoices?.length) {
      toast.info('Não há faturas para exportar');
      return;
    }

    try {
      const csvContent = [
        ['Serviço', 'Valor (Kz)', 'Status', 'Data'],
        ...localInvoices.map(fatura => [
          toPascalCase(fatura.servico),
          fatura.valor.toLocaleString('pt-AO'),
          fatura.status,
          new Date(fatura.created_at).toLocaleDateString('pt-AO')
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `faturas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Faturas exportadas com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar faturas');
    }
  }, [localInvoices]);

  return (
    <ErrorBoundary>
      <div className="w-full">
        <SectionHeader
          title="Minhas Faturas"
          icon={DollarSign}
          description="Controle seus pagamentos e faturas de serviços."
          className="mb-8 px-2"
        >
          {hasInvoices && (
            <div className="flex gap-2">
              <button
                onClick={handleExportFaturas}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-border text-gray-700 rounded-button hover:bg-gray-50 transition-all shadow-card font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>

              <button
                onClick={handleDeleteAllFaturas}
                disabled={isDeletingAll}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-red-100 text-red-600 rounded-button hover:bg-red-50 transition-all disabled:opacity-50 shadow-card font-medium"
              >
                {isDeletingAll ? <LoadingSpinner className="w-4 h-4 border-red-600" /> : <AlertTriangle className="w-4 h-4" />}
                Limpar Tudo
              </button>
            </div>
          )}
        </SectionHeader>

        <AnimatePresence mode="wait">
          {!hasInvoices ? (
            <EmptyState message="Nenhuma fatura encontrada." icon={DollarSign} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
              <KanbanColumn title="Pendentes" count={pending.length} color="orange" icon={AlertTriangle}>
                <AnimatePresence mode="popLayout">
                  {pending.map((fatura) => (
                    <motion.div
                      key={fatura.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="bg-white p-6 rounded-card border border-border shadow-card hover:shadow-card-hover transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-black text-[13px] text-gray-800 uppercase tracking-tight">{toPascalCase(fatura.servico)}</span>
                        <span className="font-black text-lg text-orange-600">{fatura.valor.toLocaleString('pt-AO')} Kz</span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                          <Calendar className="w-4 h-4" />
                          {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                        </div>
                        <button
                          onClick={() => handleDeleteClick(fatura.id)}
                          disabled={isDeleting === fatura.id}
                          className="p-2.5 text-red-500 bg-red-50/50 hover:bg-red-50 rounded-button transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          {isDeleting === fatura.id ? <LoadingSpinner className="w-4 h-4 border-red-500" /> : <Trash2 className="w-4 h-4" />}
                        </button>
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
                  {paid.map((fatura) => (
                    <motion.div
                      key={fatura.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="bg-white p-6 rounded-card border border-border shadow-card hover:shadow-card-hover transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-black text-[13px] text-gray-800 uppercase tracking-tight">{toPascalCase(fatura.servico)}</span>
                        <span className="font-black text-lg text-green-700">{fatura.valor.toLocaleString('pt-AO')} Kz</span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-badge text-[10px] font-black tracking-widest uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Liquidado
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                          <Calendar className="w-4 h-4" />
                          {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
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
          )}
        </AnimatePresence>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="rounded-3xl">
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
                className="px-6 py-2 text-sm bg-red-600 text-white rounded-button hover:bg-red-700 transition-all font-semibold shadow-card shadow-red-600/20"
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
