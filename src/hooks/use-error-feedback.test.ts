import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorFeedback } from './use-error-feedback';

describe('useErrorFeedback', () => {
  it('deve inicializar com dialog fechado', () => {
    const { result } = renderHook(() => useErrorFeedback());
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.errorContext).toBeNull();
  });

  it('deve abrir dialog ao reportar erro', () => {
    const { result } = renderHook(() => useErrorFeedback());

    act(() => {
      result.current.reportError(new Error('Teste'));
    });

    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.errorContext).not.toBeNull();
    expect(result.current.errorContext?.message).toBe('Teste');
  });

  it('deve fechar dialog via setIsDialogOpen', () => {
    const { result } = renderHook(() => useErrorFeedback());

    act(() => {
      result.current.reportError(new Error('Teste'));
    });

    expect(result.current.isDialogOpen).toBe(true);

    act(() => {
      result.current.setIsDialogOpen(false);
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  it('deve limpar errorContext ao fechar via closeDialog', () => {
    const { result } = renderHook(() => useErrorFeedback());

    act(() => {
      result.current.reportError(new Error('Teste'));
    });

    expect(result.current.errorContext).not.toBeNull();

    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.errorContext).toBeNull();
  });

  it('deve aceitar contexto adicional', () => {
    const { result } = renderHook(() => useErrorFeedback());

    act(() => {
      result.current.reportError(new Error('Teste'), {
        componentStack: 'at App (app.tsx:10)',
        userId: 'user-123',
      });
    });

    expect(result.current.errorContext?.componentStack).toBe('at App (app.tsx:10)');
    expect(result.current.errorContext?.userId).toBe('user-123');
  });

  it('deve funcionar sem erro (erro desconhecido)', () => {
    const { result } = renderHook(() => useErrorFeedback());

    act(() => {
      result.current.reportError();
    });

    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.errorContext?.message).toBe('Erro desconhecido');
  });
});
