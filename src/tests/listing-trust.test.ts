import { describe, expect, it } from 'vitest';
import {
  detectPriceMismatch,
  detectPhonesInText,
  formatArea,
  formatCount,
  formatKzPrice,
} from '@/lib/utils/formatting';

describe('formato único Kz', () => {
  it('normaliza 15M sem decimais duplicados', () => {
    expect(formatKzPrice(15000000)).toBe('15 000 000 Kz');
  });

  it('nunca retorna 0; usa Sob consulta', () => {
    expect(formatKzPrice(0)).toBe('Sob consulta');
    expect(formatKzPrice(null)).toBe('Sob consulta');
    expect(formatKzPrice(undefined)).toBe('Sob consulta');
  });

  it('arrendamento usa /mês', () => {
    expect(formatKzPrice(500000, { isRent: true })).toBe('500 000 Kz/mês');
  });
});

describe('zeros padrão → Não informado', () => {
  it('T3 com 0 quartos não exibe 0', () => {
    expect(formatCount(0, 'Quarto', 'Quartos')).toBe('Não informado');
    expect(formatCount(null, 'Quarto', 'Quartos')).toBe('Não informado');
    expect(formatCount(3, 'Quarto', 'Quartos')).toBe('3 Quartos');
  });

  it('área 0/ausente exibe Não informado com unidade quando há valor', () => {
    expect(formatArea(0)).toBe('Não informado');
    expect(formatArea(null)).toBe('Não informado');
    expect(formatArea(600)).toBe('600 m²');
    expect(formatArea(740, 'Terreno')).toBe('Terreno: 740 m²');
    expect(formatArea(0, 'Área útil')).toBe('Área útil: Não informado');
  });
});

describe('deteção editorial', () => {
  it('deteta telefones no texto livre', () => {
    expect(detectPhonesInText('Ligue 929 884 781 ou +244 923 000 000')).toHaveLength(2);
  });

  it('sinaliza 15M vs 14M', () => {
    const r = detectPriceMismatch(15000000, 'Preço 15 milhões, mas na verdade 14 milhões');
    expect(r.hasMismatch).toBe(true);
  });
});
