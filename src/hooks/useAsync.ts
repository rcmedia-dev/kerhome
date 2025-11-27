/**
 * Hook para operações assíncronas com tratamento robusto de erros
 */

import { useCallback, useState, useRef } from 'react';

export interface AsyncState<TData> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
}

export interface UseAsyncOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

/**
 * Hook para gerenciar estado e ciclo de vida de operações assíncronas
 * 
 * @param asyncFunction - Função assíncrona a executar
 * @param options - Callbacks opcionais
 * @returns Estado da operação e função execute
 * 
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsync(fetchData);
 * 
 * const handleClick = () => {
 *   execute().then(() => {
 *     console.log('Sucesso!');
 *   });
 * };
 * ```
 */
export function useAsync<TData, TArgs extends any[] = []>(
  asyncFunction: (...args: TArgs) => Promise<TData>,
  options?: UseAsyncOptions
) {
  const [state, setState] = useState<AsyncState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: TArgs) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({ data: null, loading: true, error: null });

      try {
        const data = await asyncFunction(...args);
        
        if (controller.signal.aborted) return;
        
        setState({ data, loading: false, error: null });
        options?.onSuccess?.(data);
        return data;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const error = err instanceof Error 
          ? err 
          : new Error('Erro desconhecido');
        
        setState({ data: null, loading: false, error });
        options?.onError?.(error);
        throw error;
      } finally {
        options?.onFinally?.();
      }
    },
    [asyncFunction, options]
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook para sequência de operações assíncronas
 * 
 * @example
 * ```tsx
 * const { execute } = useAsyncSequence([
 *   () => fetchUser(),
 *   () => fetchUserProperties(),
 *   () => fetchUserStats(),
 * ]);
 * ```
 */
export function useAsyncSequence<TData = unknown>(
  asyncFunctions: Array<() => Promise<TData>>,
  options?: UseAsyncOptions
) {
  const [state, setState] = useState<AsyncState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({ data: null, loading: true, error: null });

      try {
        let lastResult: TData | null = null;

        for (const asyncFn of asyncFunctions) {
          if (controller.signal.aborted) return;
          lastResult = await asyncFn();
        }

        setState({ data: lastResult, loading: false, error: null });
        options?.onSuccess?.(lastResult);
        return lastResult;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const error = err instanceof Error 
          ? err 
          : new Error('Erro desconhecido em sequência');
        
        setState({ data: null, loading: false, error });
        options?.onError?.(error);
        throw error;
      } finally {
        options?.onFinally?.();
      }
    },
    [asyncFunctions, options]
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook para debounce de operações assíncronas
 * 
 * @param asyncFunction - Função assíncrona a executar
 * @param delay - Delay em ms
 * @returns Estado da operação e função execute
 */
export function useAsyncDebounced<TData, TArgs extends any[] = []>(
  asyncFunction: (...args: TArgs) => Promise<TData>,
  delay: number = 300,
  options?: UseAsyncOptions
) {
  const [state, setState] = useState<AsyncState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    (...args: TArgs) => {
      return new Promise<TData | undefined>((resolve) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setState({ data: null, loading: true, error: null });

        timeoutRef.current = setTimeout(async () => {
          const controller = new AbortController();
          abortControllerRef.current = controller;

          try {
            const data = await asyncFunction(...args);
            
            if (controller.signal.aborted) return;
            
            setState({ data, loading: false, error: null });
            options?.onSuccess?.(data);
            resolve(data);
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              return;
            }

            const error = err instanceof Error 
              ? err 
              : new Error('Erro desconhecido');
            
            setState({ data: null, loading: false, error });
            options?.onError?.(error);
            resolve(undefined);
          } finally {
            options?.onFinally?.();
          }
        }, delay);
      });
    },
    [asyncFunction, delay, options]
  );

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    abortControllerRef.current?.abort();
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
