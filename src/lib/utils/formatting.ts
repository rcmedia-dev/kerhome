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
 * Converte string formatada para número
 * 
 * @param formatted - String formatada
 * @returns Número
 * 
 * @example
 * ```tsx
 * parseFormattedPrice("1.500.000") // 1500000
 * ```
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
