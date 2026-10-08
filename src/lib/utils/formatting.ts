/**
 * Utilitários para formatação de dados
 * Centralizar funções reutilizáveis
 */

/**
 * Formata um preço numérico para string com separadores de milhar
 * 
 * @param value - Valor a formatar
 * @param locale - Localização (padrão: pt-BR)
 * @returns String formatada
 * 
 * @example
 * ```tsx
 * formatPrice(1500000) // "1.500.000"
 * formatPrice(1500000, 'pt-AO') // "1 500 000"
 * ```
 */
export const formatPrice = (
  value: string | number | null | undefined,
  locale: string = 'pt-BR'
): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  try {
    const numericValue = typeof value === 'number'
      ? value
      : parseInt(String(value).replace(/\D/g, ''), 10);

    if (isNaN(numericValue)) {
      return '';
    }

    return new Intl.NumberFormat(locale, {
      style: 'decimal',
    }).format(numericValue);
  } catch (error) {
    console.error('Erro ao formatar preço:', error);
    return '';
  }
};

/**
 * Formata preço com símbolo de moeda
 * 
 * @param value - Valor a formatar
 * @param currency - Código da moeda (USD, EUR, AOA, etc)
 * @param locale - Localização
 * @returns String formatada com moeda
 * 
 * @example
 * ```tsx
 * formatCurrency(1500000, 'AOA', 'pt-AO') // "1.500.000 Kz"
 * formatCurrency(1500000, 'USD') // "$1,500,000.00"
 * ```
 */
export const formatCurrency = (
  value: string | number | null | undefined,
  currency: string = 'AOA',
  locale: string = 'pt-AO'
): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  try {
    const numericValue = typeof value === 'number'
      ? value
      : parseInt(String(value).replace(/\D/g, ''), 10);

    if (isNaN(numericValue)) {
      return '';
    }

    const formattedValue = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);

    if (currency === 'AOA') {
      return `${formattedValue} Kz`;
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return formatPrice(value, locale);
  }
};

/**
 * Formata preço no padrão único Kercasa: `15 000 000 Kz`
 * (espaço como separador de milhares, sem decimais, sufixo `Kz`).
 *
 * @example
 * formatKzPrice(15000000) // "15 000 000 Kz"
 * formatKzPrice(null) // "Sob consulta"
 */
export const formatKzPrice = (
  value: string | number | null | undefined,
  opts: { isRent?: boolean; negotiable?: boolean } = {}
): string => {
  if (value === null || value === undefined || value === '') {
    return 'Sob consulta';
  }
  const numericValue =
    typeof value === 'number'
      ? value
      : parseInt(String(value).replace(/\D/g, ''), 10);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 'Sob consulta';
  }
  const grouped = new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(numericValue));
  // Normaliza NBSP de pt-AO para espaço simples
  const normalized = grouped.replace(/\u00a0|\u202f/g, ' ');
  const suffix = opts.isRent ? ' Kz/mês' : ' Kz';
  const base = `${normalized}${suffix}`;
  return opts.negotiable ? `${base} (Negociável)` : base;
};

/**
 * Exibe contagens (quartos, casas de banho...).
 * `0`, `null` ou `undefined` => "Não informado" (nunca `0`).
 */
export const formatCount = (
  value: string | number | null | undefined,
  singular: string,
  plural?: string
): string => {
  const n =
    typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n) || n <= 0) return 'Não informado';
  const label = n === 1 ? singular : plural ?? `${singular}s`;
  return `${n} ${label}`;
};

/**
 * Exibe áreas sempre com unidade `m²` e "Não informado" quando ausente.
 * Aceita strings já com unidade sem duplicar.
 */
export const formatArea = (
  value: string | number | null | undefined,
  label?: string
): string => {
  if (value === null || value === undefined || value === '') {
    return label ? `${label}: Não informado` : 'Não informado';
  }
  if (typeof value === 'string' && /não informado|—|–/i.test(value)) {
    return label ? `${label}: Não informado` : 'Não informado';
  }
  const numeric =
    typeof value === 'number'
      ? value
      : parseFloat(String(value).replace(/[^\d.,-]/g, '').replace(',', '.'));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return label ? `${label}: Não informado` : 'Não informado';
  }
  const display =
    typeof value === 'string' && /m\s?²/i.test(value)
      ? String(value).trim()
      : `${numeric} m²`;
  return label ? `${label}: ${display}` : display;
};

/**
 * Deteta telefones em texto livre para padronização editorial.
 * Retorna os candidatos encontrados (ex.: +244 9XX XXX XXX).
 */
export const detectPhonesInText = (text: string | null | undefined): string[] => {
  if (!text) return [];
  const matches = text.match(/(?:\+?244[\s-]?)?9\d{2}[\s-]?\d{3}[\s-]?\d{3}/g);
  return matches ? [...new Set(matches)] : [];
};

/**
 * Deteta discrepância entre preço estruturado e preço citado no texto.
 * Ex.: campo = 15M mas descrição menciona 14M.
 */
export const detectPriceMismatch = (
  structuredPrice: number | null | undefined,
  text: string | null | undefined
): { hasMismatch: boolean; mentionedPrices: number[] } => {
  if (!structuredPrice || !text) return { hasMismatch: false, mentionedPrices: [] };
  const raw = text.match(/\d[\d\s.]*\s?(?:milh(?:ões|ao|oes)?|M\b|Kz\b)/gi) ?? [];
  const mentioned = raw
    .map((m) => {
      const digits = m.replace(/\D/g, '');
      let n = parseInt(digits, 10);
      if (/milh/i.test(m) && n < 1000000) n = n * 1000000;
      return n;
    })
    .filter((n) => Number.isFinite(n) && n > 0);
  const hasMismatch = mentioned.some(
    (m) => Math.abs(m - structuredPrice) / structuredPrice > 0.02
  );
  return { hasMismatch, mentionedPrices: mentioned };
};

/**
 * Converte string formatada para número
 *
 * @example
 * parseFormattedPrice("1.500.000") // 1500000
 */
export const parseFormattedPrice = (formatted: string): number => {
  if (!formatted) return 0;
  const cleaned = formatted.replace(/\D/g, '');
  return parseInt(cleaned, 10) || 0;
};

/**
 * Formata data em formato legível
 * 
 * @param date - Data a formatar
 * @param locale - Localização
 * @returns String formatada
 * 
 * @example
 * ```tsx
 * formatDate(new Date(), 'pt-AO') // "27 de novembro de 2025"
 * ```
 */
export const formatDate = (
  date: Date | string | null | undefined,
  locale: string = 'pt-AO'
): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Formata data e hora
 * 
 * @param date - Data a formatar
 * @param locale - Localização
 * @returns String formatada
 * 
 * @example
 * ```tsx
 * formatDateTime(new Date()) // "27 de novembro de 2025 às 14:30:00"
 * ```
 */
export const formatDateTime = (
  date: Date | string | null | undefined,
  locale: string = 'pt-AO'
): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error);
    return '';
  }
};

/**
 * Formata texto para slug (URL-friendly)
 * 
 * @param text - Texto a converter
 * @returns Slug formatado
 * 
 * @example
 * ```tsx
 * toSlug("Meu Imóvel Incrível!") // "meu-imovel-incrivel"
 * ```
 */
export const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/[\s_-]+/g, '-') // Substitui espaços/underscores por hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens nas extremidades
};

/**
 * Trunca texto com ellipsis
 * 
 * @param text - Texto a truncar
 * @param maxLength - Comprimento máximo
 * @returns Texto truncado
 * 
 * @example
 * ```tsx
 * truncateText("Texto muito longo...", 10) // "Texto mu..."
 * ```
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Remove HTML tags de uma string
 * 
 * @param html - HTML string
 * @returns Texto puro
 * 
 * @example
 * ```tsx
 * stripHtml("<p>Olá <b>mundo</b></p>") // "Olá mundo"
 * ```
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

/**
 * Capitaliza primeira letra de uma palavra
 * 
 * @param text - Texto a capitalizar
 * @returns Texto capitalizado
 * 
 * @example
 * ```tsx
 * capitalize("joão") // "João"
 * ```
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formata telefone
 * 
 * @param phone - Número de telefone
 * @returns Telefone formatado
 * 
 * @example
 * ```tsx
 * formatPhone("+244912345678") // "+244 912 345 678"
 * ```
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  // Angola format: +244 9XX XXX XXX
  if (cleaned.startsWith('244')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  return phone;
};

