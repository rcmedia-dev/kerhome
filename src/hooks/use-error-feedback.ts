'use client';

import { useState, useCallback } from 'react';
import { getErrorContext, ErrorContext } from '@/lib/error-feedback';

export interface ErrorFeedbackState {
  isDialogOpen: boolean;
  errorContext: ErrorContext | null;
}

export function useErrorFeedback() {
  const [state, setState] = useState<ErrorFeedbackState>({
    isDialogOpen: false,
    errorContext: null,
  });

  const reportError = useCallback((error?: Error, additionalContext?: Partial<ErrorContext>) => {
    const context = getErrorContext(error);
    setState({
      isDialogOpen: true,
      errorContext: {
        ...context,
        ...additionalContext,
      },
    });
  }, []);

  const setIsDialogOpen = useCallback((open: boolean) => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: open,
    }));
  }, []);

  const closeDialog = useCallback(() => {
    setState({
      isDialogOpen: false,
      errorContext: null,
    });
  }, []);

  return {
    ...state,
    reportError,
    setIsDialogOpen,
    closeDialog,
  };
}
