/**
 * Hook customizado para formulário de propriedade
 * Centraliza lógica de formulário
 */

import { useState, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdatePropertySchema } from '@/lib/schemas/validation';
import { updateProperty } from '@/lib/functions/supabase-actions/update-propertie';
import { toast } from 'sonner';

export interface UsePropertyFormOptions {
  propertyId: string;
  initialData?: Record<string, any>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UsePropertyFormReturn {
  form: UseFormReturn;
  isSubmitting: boolean;
  onSubmit: (data: any) => Promise<void>;
}

export function usePropertyForm(
  options: UsePropertyFormOptions
): UsePropertyFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(UpdatePropertySchema),
    defaultValues: options.initialData || {},
  });

  const onSubmit = useCallback(
    async (data: any) => {
      setIsSubmitting(true);
      try {
        await updateProperty(options.propertyId, data);
        toast.success('Propriedade atualizada com sucesso!');
        options.onSuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Erro desconhecido');
        toast.error(err.message || 'Erro ao atualizar propriedade');
        options.onError?.(err);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  return {
    form,
    isSubmitting,
    onSubmit,
  };
}
