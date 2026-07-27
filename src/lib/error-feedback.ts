import { toast } from 'sonner';

export interface ErrorContext {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
}

export interface ErrorFeedbackPayload {
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  error_message?: string;
  error_stack?: string;
  component_stack?: string;
  url: string;
  user_agent: string;
  user_id?: string;
  user_email?: string;
  include_tech_info: boolean;
  screenshotFiles?: File[];
  metadata?: Record<string, unknown>;
}

export interface ErrorFeedbackResponse {
  success: boolean;
  id?: string;
  error?: string;
}

const RATE_LIMIT_KEY = 'error_feedback_rate_limit';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return true;

    const { count, timestamp } = JSON.parse(stored);
    const now = Date.now();

    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      localStorage.removeItem(RATE_LIMIT_KEY);
      return true;
    }

    return count < RATE_LIMIT_MAX;
  } catch {
    return true;
  }
}

function incrementRateLimit(): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();

    if (!stored) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, timestamp: now }));
      return;
    }

    const { count, timestamp } = JSON.parse(stored);

    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, timestamp: now }));
      return;
    }

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: count + 1, timestamp }));
  } catch {
    // Ignorar erros de localStorage
  }
}

export function getErrorContext(error?: Error): ErrorContext {
  return {
    message: error?.message || 'Erro desconhecido',
    stack: error?.stack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
  };
}

async function uploadScreenshot(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/feedback/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.publicUrl || null;
  } catch {
    return null;
  }
}

export async function submitErrorFeedback(
  payload: ErrorFeedbackPayload
): Promise<ErrorFeedbackResponse> {
  if (!checkRateLimit()) {
    return {
      success: false,
      error: 'Limite de feedbacks atingido. Tente novamente mais tarde.',
    };
  }

  try {
    let screenshotUrls: string[] = [];
    if (payload.screenshotFiles && payload.screenshotFiles.length > 0) {
      const uploaded = await Promise.all(
        payload.screenshotFiles.map((file) => uploadScreenshot(file))
      );
      screenshotUrls = uploaded.filter((url): url is string => url !== null);
    }

    const formData = new FormData();
    formData.append('message', payload.message);
    formData.append('severity', payload.severity);
    formData.append('url', payload.url);
    formData.append('user_agent', payload.user_agent);
    formData.append('include_tech_info', String(payload.include_tech_info));

    if (payload.error_message) formData.append('error_message', payload.error_message);
    if (payload.error_stack) formData.append('error_stack', payload.error_stack);
    if (payload.component_stack) formData.append('component_stack', payload.component_stack);
    if (payload.user_id) formData.append('user_id', payload.user_id);
    if (payload.user_email) formData.append('user_email', payload.user_email);
    if (payload.metadata) formData.append('metadata', JSON.stringify(payload.metadata));

    screenshotUrls.forEach((url) => {
      formData.append('screenshots', url);
    });

    const response = await fetch('/api/feedback', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Erro ao enviar feedback' };
    }

    incrementRateLimit();

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão',
    };
  }
}

export function toastErrorWithFeedback(
  message: string,
  error?: Error
): void {
  const context = getErrorContext(error);

  toast.error(message, {
    description: 'Clique em "Reportar" para enviar feedback à equipa.',
    action: {
      label: 'Reportar',
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('kerhome:error-feedback:open', {
              detail: { errorContext: context },
            })
          );
        }
      },
    },
    duration: 8000,
  });
}
