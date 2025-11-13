import { useState, useCallback } from 'react';
import { Fatura } from '@/lib/types/property';
import { useUserStore } from '@/lib/store/user-store';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useInvoiceManagement(initialInvoices: Fatura[]) {
  const { user } = useUserStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [localInvoices, setLocalInvoices] = useState<Fatura[] | null>(initialInvoices);

  const handleDeleteFatura = useCallback(async (faturaId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
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
      toast.error(error instanceof Error ? error.message : 'Erro ao eliminar fatura');
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
      toast.error(error instanceof Error ? error.message : 'Erro ao eliminar faturas');
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
