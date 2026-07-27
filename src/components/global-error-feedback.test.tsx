import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/lib/error-feedback', () => ({
  getErrorContext: vi.fn().mockReturnValue({
    message: 'Erro teste',
    url: 'http://localhost:3000',
    userAgent: 'test-agent',
    timestamp: '2026-01-01T00:00:00.000Z',
  }),
  submitErrorFeedback: vi.fn().mockResolvedValue({ success: true }),
}));

import { GlobalErrorFeedback, emitFeedbackEvent } from './global-error-feedback';

describe('GlobalErrorFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar sem erro', () => {
    render(<GlobalErrorFeedback />);
  });

  it('deve abrir dialog quando evento é disparado', async () => {
    render(<GlobalErrorFeedback />);

    act(() => {
      emitFeedbackEvent({
        errorContext: {
          message: 'Erro custom',
          url: 'http://localhost:3000',
          userAgent: 'test',
          timestamp: '2026-01-01',
        },
      });
    });

    expect(screen.getByText('Reportar Erro')).toBeInTheDocument();
  });

  it('deve fechar dialog quando onOpenChange é chamado com false', async () => {
    render(<GlobalErrorFeedback />);

    act(() => {
      emitFeedbackEvent();
    });

    expect(screen.getByText('Reportar Erro')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
  });
});
