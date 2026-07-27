import { useState, useCallback } from 'react';
import { Fatura } from '@/lib/types/property';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { toastErrorWithFeedback } from '@/lib/error-feedback';

export function useInvoiceManagement(initialInvoices: Fatura[] | null) {
  const { user } = useUserStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [localInvoices, setLocalInvoices] = useState<Fatura[] | null>(initialInvoices);
  const supabase = createClient();

  const handleDeleteFatura = useCallback(async (faturaId: string) => {
    if (!user) {
      toast.warning('Usuário não autenticado');
      return;
    }

    setIsDeleting(faturaId);
    try {
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('id', faturaId)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);

      setLocalInvoices(prev => prev?.filter(fatura => fatura.id !== faturaId) || null);
      toast.success('Fatura eliminada com sucesso');
    } catch (error) {
      toastErrorWithFeedback(error instanceof Error ? error.message : 'Erro ao eliminar fatura', error instanceof Error ? error : undefined);
    } finally {
      setIsDeleting(null);
    }
  }, [user]);

  const handleDeleteAllFaturas = useCallback(async () => {
    if (!user || !localInvoices?.length) return;

    setIsDeletingAll(true);
    try {
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);

      setLocalInvoices([]);
      toast.success(`Todas as faturas foram eliminadas`);
    } catch (error) {
      toastErrorWithFeedback(error instanceof Error ? error.message : 'Erro ao eliminar faturas', error instanceof Error ? error : undefined);
    } finally {
      setIsDeletingAll(false);
    }
  }, [user, localInvoices]);

  return {
    isDeleting,
    isDeletingAll,
    localInvoices,
    handleDeleteFatura,
    handleDeleteAllFaturas
  };
}

