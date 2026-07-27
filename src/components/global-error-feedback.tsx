'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorFeedbackDialog } from './error-feedback-dialog';
import { ErrorContext, getErrorContext } from '@/lib/error-feedback';
import { toast } from 'sonner';

const FEEDBACK_EVENT = 'kerhome:error-feedback:open';

export interface FeedbackEventData {
  errorContext?: ErrorContext | null;
}

export function emitFeedbackEvent(data?: FeedbackEventData) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FEEDBACK_EVENT, { detail: data }));
  }
}

const IGNORED_PATTERNS = [
  'Hydration failed',
  'hydrate',
  'Expected server HTML',
  'Text content does not match',
  'There was an error while hydrating',
  'The result of getSnapshot should be cached',
  'useEffect must not return anything besides a function',
  'Download the React DevTools',
  'ErrorBoundary',
  'error boundary',
  'error-boundary',
  'componentStack',
  'Info do erro',
  'LocalErrorBoundary',
  'CrashChild',
  'ErrorTestButton',
];

function shouldIgnore(args: unknown[]): boolean {
  const text = args
    .map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.message : ''))
    .join(' ');
  return IGNORED_PATTERNS.some((p) => text.includes(p));
}

function showReportToast(ctx: ErrorContext) {
  toast.error(ctx.message.slice(0, 120), {
    description: 'Clique em "Reportar" para enviar feedback à equipa.',
    action: {
      label: 'Reportar',
      onClick: () => {
        window.dispatchEvent(
          new CustomEvent(FEEDBACK_EVENT, { detail: { errorContext: ctx } })
        );
      },
    },
    duration: 8000,
  });
}

export function GlobalErrorFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [errorContext, setErrorContext] = useState<ErrorContext | null>(null);
  const lastErrorTime = useRef(0);
  const isDev = process.env.NODE_ENV === 'development';

  const handleFeedbackEvent = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<FeedbackEventData>;
    setErrorContext(customEvent.detail?.errorContext || null);
    setIsOpen(true);
  }, []);

  // Listen for feedback open events (always active)
  useEffect(() => {
    window.addEventListener(FEEDBACK_EVENT, handleFeedbackEvent);
    return () => window.removeEventListener(FEEDBACK_EVENT, handleFeedbackEvent);
  }, [handleFeedbackEvent]);

  // Dev-only: intercept console.error, window errors, unhandled rejections
  useEffect(() => {
    if (!isDev) return;

    const cooldown = () => {
      const now = Date.now();
      if (now - lastErrorTime.current < 5000) return false;
      lastErrorTime.current = now;
      return true;
    };

    // console.error
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      originalError.apply(console, args);
      if (shouldIgnore(args)) return;
      if (!cooldown()) return;

      const text = args
        .map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.message : JSON.stringify(a)))
        .join(' ')
        .slice(0, 300);

      const errorObj = args.find((a) => a instanceof Error) as Error | undefined;
      const ctx = getErrorContext(errorObj);
      ctx.message = text;
      showReportToast(ctx);
    };

    // window error
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault();
      if (!cooldown()) return;

      const ctx: ErrorContext = {
        message: event.message || 'Erro desconhecido',
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      showReportToast(ctx);
    };

    // unhandled promise rejection
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      if (!cooldown()) return;

      const reason = event.reason;
      const message = reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
          ? reason
          : JSON.stringify(reason);

      const errorObj = reason instanceof Error ? reason : undefined;
      const ctx = getErrorContext(errorObj);
      ctx.message = message;
      showReportToast(ctx);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      console.error = originalError;
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, [isDev]);

  return (
    <ErrorFeedbackDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      errorInfo={errorContext}
    />
  );
}
