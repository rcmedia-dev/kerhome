'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ErrorFeedbackDialog } from './error-feedback-dialog';
import { getErrorContext, ErrorContext } from '@/lib/error-feedback';

interface ErrorFeedbackTriggerProps {
  errorMessage?: string;
  errorStack?: string;
  componentStack?: string;
  className?: string;
}

export function ErrorFeedbackTrigger({
  errorMessage,
  errorStack,
  componentStack,
  className = '',
}: ErrorFeedbackTriggerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorContext, setErrorContext] = useState<ErrorContext | null>(null);

  const handleClick = () => {
    const context = getErrorContext(errorMessage ? new Error(errorMessage) : undefined);
    setErrorContext({
      ...context,
      stack: errorStack,
      componentStack,
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors ${className}`}
      >
        <Flag className="h-4 w-4" />
        Reportar Este Erro
      </button>

      <ErrorFeedbackDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        errorInfo={errorContext}
      />
    </>
  );
}
