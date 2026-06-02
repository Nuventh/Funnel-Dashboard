import { describe, it, expect } from 'vitest';
import { formatPct, formatInt } from '../src/lib/format.js';

describe('formatPct', () => {
  it('formats whole percents without decimals', () => {
    expect(formatPct(0.32)).toBe('32%');
    expect(formatPct(1)).toBe('100%');
  });

  it('keeps one decimal when the value is not whole', () => {
    expect(formatPct(0.085)).toBe('8.5%');
    expect(formatPct(0.7344)).toBe('73.4%');
  });

  it('handles zero', () => {
    expect(formatPct(0)).toBe('0%');
  });
});

describe('formatInt', () => {
  it('adds thousands separators', () => {
    expect(formatInt(10000)).toBe('10,000');
  });

  it('leaves small numbers unchanged', () => {
    expect(formatInt(820)).toBe('820');
  });
});
