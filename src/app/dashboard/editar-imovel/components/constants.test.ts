import { describe, it, expect } from 'vitest';
import { formatarPreco } from './constants';

describe('formatarPreco', () => {
  it('should format numbers with thousands separators', () => {
    expect(formatarPreco('10000')).toBe('10.000');
    expect(formatarPreco('1000000')).toBe('1.000.000');
  });

  it('should remove non-numeric characters before formatting', () => {
    expect(formatarPreco('10abc000')).toBe('10.000');
    expect(formatarPreco('R$ 5000')).toBe('5.000');
  });

  it('should return empty string if no numbers are present', () => {
    expect(formatarPreco('abc')).toBe('');
    expect(formatarPreco('')).toBe('');
  });
});
