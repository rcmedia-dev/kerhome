/**
 * Hook customizado para queries com cache strategy otimizado
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

export interface UseCachedQueryOptions<TData> 
  extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * Hook reutilizável para queries com cache strategy predefinida
 * 
 * @param queryKey - Chave única para a query
 * @param queryFn - Função assíncrona que busca os dados
 * @param options - Opções adicionais do useQuery
 * @returns Resultado da query
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCachedQuery(
 *   ['user-properties', userId],
 *   () => getSupabaseUserProperties(userId),
 *   { enabled: !!userId }
 * );
 * ```
 */
export function useCachedQuery<TData = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseCachedQueryOptions<TData>
): UseQueryResult<TData> {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutos por padrão
    gcTime: 10 * 60 * 1000, // 10 minutos por padrão
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
}

/**
 * Hook para queries que não devem ser cacheadas
 * 
 * @example
 * ```tsx
 * const { data } = useNoCache(
 *   ['search-results', query],
 *   () => searchProperties(query)
 * );
 * ```
 */
export function useNoCache<TData = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseCachedQueryOptions<TData>
): UseQueryResult<TData> {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    ...options,
  });
}

/**
 * Hook para queries com cache agressivo (longa duração)
 * Ideal para dados que mudam raramente
 * 
 * @example
 * ```tsx
 * const { data } = useAggressiveCache(
 *   ['cities'],
 *   () => getCities()
 * );
 * ```
 */
export function useAggressiveCache<TData = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseCachedQueryOptions<TData>
): UseQueryResult<TData> {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1 * 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    retry: 3,
    ...options,
  });
}
