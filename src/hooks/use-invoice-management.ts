import { useState, useCallback, useEffect } from 'react';
import { Fatura } from '@/lib/types/property';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const MOCK_ID_PREFIX = 'fat-2026-';

function isMockId(id: string) {
  return id.startsWith(MOCK_ID_PREFIX);
}

export function useInvoiceManagement(initialInvoices: Fatura[] | null) {
  const { user } = useUserStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [localInvoices, setLocalInvoices] = useState<Fatura[] | null>(initialInvoices);
  const supabase = createClient();

  useEffect(() => {
    setLocalInvoices(initialInvoices);
  }, [initialInvoices]);

  const handleDeleteFatura = useCallback(async (faturaId: string) => {
    // Dados mockados — apenas remove da UI, sem tocar na DB
    if (isMockId(faturaId)) {
      setLocalInvoices(prev => prev?.filter(f => f.id !== faturaId) ?? null);
      toast.success('Fatura removida');
      return;
    }

    if (!user) {
      toast.warning('Utilizador não autenticado');
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

      setLocalInvoices(prev => prev?.filter(f => f.id !== faturaId) ?? null);
      toast.success('Fatura eliminada com sucesso');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao eliminar fatura');
    } finally {
      setIsDeleting(null);
    }
  }, [user, supabase]);

  const handleDeleteAllFaturas = useCallback(async () => {
    if (!localInvoices?.length) return;

    // Se todos forem mocks, apenas limpa a UI
    const allMock = localInvoices.every(f => isMockId(f.id));
    if (allMock) {
      setLocalInvoices([]);
      toast.success('Faturas removidas');
      return;
    }

    if (!user) {
      toast.warning('Utilizador não autenticado');
      return;
    }

    setIsDeletingAll(true);
    try {
      // Elimina apenas IDs reais (exclui mocks que possam estar misturados)
      const realIds = localInvoices
        .filter(f => !isMockId(f.id))
        .map(f => f.id);

      const { error } = await supabase
        .from('faturas')
        .delete()
        .in('id', realIds)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);

      setLocalInvoices([]);
      toast.success('Todas as faturas foram eliminadas');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao eliminar faturas');
    } finally {
      setIsDeletingAll(false);
    }
  }, [user, localInvoices, supabase]);

  return {
    isDeleting,
    isDeletingAll,
    localInvoices,
    handleDeleteFatura,
    handleDeleteAllFaturas,
  };
}
