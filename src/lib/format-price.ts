import { formatKzPrice } from '@/lib/utils/formatting';

/**
 * @deprecated Usar `formatKzPrice` de `@/lib/utils/formatting`.
 * Mantido por compatibilidade — agora delega para o formato único `15 000 000 Kz`.
 * Se `withSuffix=false`, retorna só o número agrupado sem `Kz`/`Sob consulta`.
 */
export function formatPriceWithDots(value: number | string | null | undefined, withSuffix = false): string {
  const formatted = formatKzPrice(value);
  if (withSuffix) return formatted;
  if (formatted === 'Sob consulta') return formatted;
  return formatted.replace(/\s?Kz(\/mês)?(\s\(Negociável\))?$/, '');
}
