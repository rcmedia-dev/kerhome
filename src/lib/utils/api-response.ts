/**
 * Helpers para respostas de API
 * Padroniza respostas de sucesso e erro
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Criar resposta de sucesso
 * 
 * @example
 * ```tsx
 * return successResponse({ id: 1, name: 'Test' });
 * ```
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message: message || 'Operação realizada com sucesso',
  };
}

/**
 * Criar resposta de erro
 * 
 * @example
 * ```tsx
 * return errorResponse('Erro ao salvar dados');
 * ```
 */
export function errorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    error,
  };
}

/**
 * Criar resposta paginada
 * 
 * @example
 * ```tsx
 * return paginatedResponse(items, total, page, limit);
 * ```
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 20,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

/**
 * Wrapper seguro para operações assíncronas em API routes
 * 
 * @example
 * ```tsx
 * export async function POST(req: Request) {
 *   return safeApiHandler(async () => {
 *     const data = await db.create(...);
 *     return successResponse(data);
 *   });
 * }
 * ```
 */
export async function safeApiHandler<T>(
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error('Erro em API route:', error);

    const message = error instanceof Error 
      ? error.message 
      : 'Erro interno do servidor';

    return Response.json(
      errorResponse(message),
      { status: 500 }
    );
  }
}
