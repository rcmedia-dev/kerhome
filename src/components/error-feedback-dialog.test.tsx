import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/lib/error-feedback', () => ({
  submitErrorFeedback: vi.fn().mockResolvedValue({ success: true, id: 'test-id' }),
  getErrorContext: vi.fn().mockReturnValue({
    message: 'TypeError: Cannot read property map',
    url: 'http://localhost:3000/test',
    userAgent: 'test-agent',
    timestamp: '2026-01-01T00:00:00.000Z',
  }),
}));

import { ErrorFeedbackDialog } from './error-feedback-dialog';
import { toast } from 'sonner';

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  errorInfo: {
    message: 'TypeError: Cannot read property map of undefined',
    url: 'http://localhost:3000/test',
    userAgent: 'Mozilla/5.0',
    timestamp: '2026-01-01T00:00:00.000Z',
  },
};

describe('ErrorFeedbackDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar quando aberto', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByText('Reportar Erro')).toBeInTheDocument();
  });

  it('não deve renderizar quando fechado', () => {
    render(<ErrorFeedbackDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Reportar Erro')).not.toBeInTheDocument();
  });

  it('deve mostrar campos do formulário', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Estava a tentar/)).toBeInTheDocument();
    expect(screen.getByText('Baixa')).toBeInTheDocument();
    expect(screen.getByText('Média')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Crítica')).toBeInTheDocument();
  });

  it('deve mostrar mensagem do erro detectado', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByText(/TypeError/)).toBeInTheDocument();
  });

  it('deve ter botão de upload de imagem', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByText(/Adicionar Imagem/)).toBeInTheDocument();
  });

  it('deve ter checkbox de informações técnicas marcado por defecto', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('deve chamar onOpenChange ao cancelar', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('deve ter botão de enviar desactivado sem descrição', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    const submitButton = screen.getByText('Enviar');
    expect(submitButton).toBeDisabled();
  });

  it('deve activar botão de enviar com descrição', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Estava a tentar/);
    fireEvent.change(textarea, { target: { value: 'Estava a preencher o formulário' } });
    const submitButton = screen.getByText('Enviar');
    expect(submitButton).not.toBeDisabled();
  });

  it('deve permitir desmarcar checkbox de info técnica', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('deve mostrar descrição do utilizador como obrigatória', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByText(/Descreve o que estavas a fazer/)).toBeInTheDocument();
  });

  it('deve mostrar opção de severidade', () => {
    render(<ErrorFeedbackDialog {...defaultProps} />);
    expect(screen.getByText('Severidade')).toBeInTheDocument();
  });
});
