export function formatPriceWithDots(value: number | string | null | undefined): string {
  const numericValue = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);

  if (!Number.isFinite(numericValue)) return '0.00';

  const [integerPart, decimalPart] = numericValue.toFixed(2).split('.');
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${groupedInteger}.${decimalPart}`;
}
