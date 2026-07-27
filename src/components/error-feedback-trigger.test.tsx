import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

import { ErrorFeedbackTrigger } from './error-feedback-trigger';

describe('ErrorFeedbackTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar botão de reportar', () => {
    render(<ErrorFeedbackTrigger errorMessage="Erro teste" />);
    expect(screen.getByText(/Reportar Este Erro/)).toBeInTheDocument();
  });

  it('deve abrir dialog ao clicar', () => {
    render(<ErrorFeedbackTrigger errorMessage="Erro teste" />);
    fireEvent.click(screen.getByText(/Reportar Este Erro/));
    expect(screen.getByText('Reportar Erro')).toBeInTheDocument();
  });

  it('deve aceitar className personalizado', () => {
    render(<ErrorFeedbackTrigger errorMessage="Erro teste" className="custom-class" />);
    const button = screen.getByText(/Reportar Este Erro/);
    expect(button).toHaveClass('custom-class');
  });

  it('deve funcionar sem errorMessage', () => {
    render(<ErrorFeedbackTrigger />);
    expect(screen.getByText(/Reportar Este Erro/)).toBeInTheDocument();
  });
});
