import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getErrorContext, toastErrorWithFeedback } from './error-feedback';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('error-feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/test' },
      writable: true,
    });
  });

  describe('getErrorContext', () => {
    it('deve capturar mensagem do erro', () => {
      const error = new Error('Teste error');
      const context = getErrorContext(error);
      expect(context.message).toBe('Teste error');
    });

    it('deve retornar mensagem padrão quando não há erro', () => {
      const context = getErrorContext();
      expect(context.message).toBe('Erro desconhecido');
    });

    it('deve capturar URL actual', () => {
      const context = getErrorContext();
      expect(context.url).toBe('http://localhost:3000/test');
    });

    it('deve capturar user agent', () => {
      const context = getErrorContext();
      expect(context.userAgent).toBeDefined();
    });

    it('deve capturar timestamp ISO', () => {
      const context = getErrorContext();
      const timestamp = new Date(context.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('deve capturar stack trace do erro', () => {
      const error = new Error('Teste');
      const context = getErrorContext(error);
      expect(context.stack).toBeDefined();
      expect(context.stack).toContain('Error: Teste');
    });
  });

  describe('toastErrorWithFeedback', () => {
    it('deve chamar toast.error com mensagem correcta', () => {
      toastErrorWithFeedback('Erro ao carregar');
      expect(toast.error).toHaveBeenCalledWith(
        'Erro ao carregar',
        expect.objectContaining({
          description: 'Clique em "Reportar" para enviar feedback à equipa.',
          duration: 8000,
        })
      );
    });

    it('deve incluir botão "Reportar" no toast', () => {
      toastErrorWithFeedback('Erro teste');
      expect(toast.error).toHaveBeenCalledWith(
        'Erro teste',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Reportar',
            onClick: expect.any(Function),
          }),
        })
      );
    });

    it('deve dispatchar custom event ao clicar Reportar', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      toastErrorWithFeedback('Erro teste');

      const callArgs = (toast.error as any).mock.calls[0];
      const onClick = callArgs[1].action.onClick;

      onClick();

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'kerhome:error-feedback:open',
          detail: expect.objectContaining({
            errorContext: expect.objectContaining({
              message: 'Erro desconhecido',
            }),
          }),
        })
      );

      dispatchSpy.mockRestore();
    });

    it('deve incluir contexto do erro no evento', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      const error = new Error('Erro custom');
      toastErrorWithFeedback('Erro teste', error);

      const callArgs = (toast.error as any).mock.calls[0];
      const onClick = callArgs[1].action.onClick;

      onClick();

      const eventCall = dispatchSpy.mock.calls.find(
        (call: [Event]) => call[0]?.type === 'kerhome:error-feedback:open'
      );
      expect(eventCall).toBeDefined();
      expect((eventCall![0] as CustomEvent).detail.errorContext.message).toBe('Erro custom');

      dispatchSpy.mockRestore();
    });
  });
});
