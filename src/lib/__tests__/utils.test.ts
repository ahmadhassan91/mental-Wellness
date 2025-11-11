import { describe, it, expect } from 'vitest';
import { parseUTMParams, convertToCSV, formatPhoneNumber } from '../utils';

describe('parseUTMParams', () => {
  it('should extract UTM parameters from URLSearchParams', () => {
    const params = new URLSearchParams('utm_source=google&utm_medium=cpc&utm_campaign=summer');
    const result = parseUTMParams(params);

    expect(result).toEqual({
      source: 'google',
      medium: 'cpc',
      campaign: 'summer',
    });
  });

  it('should return empty object when no UTM params present', () => {
    const params = new URLSearchParams('foo=bar');
    const result = parseUTMParams(params);

    expect(result).toEqual({});
  });

  it('should handle partial UTM params', () => {
    const params = new URLSearchParams('utm_source=facebook');
    const result = parseUTMParams(params);

    expect(result).toEqual({
      source: 'facebook',
    });
  });
});

describe('convertToCSV', () => {
  it('should convert array of objects to CSV', () => {
    const data = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'Los Angeles' },
    ];
    const csv = convertToCSV(data);

    expect(csv).toContain('name,age,city');
    expect(csv).toContain('John,30,New York');
    expect(csv).toContain('Jane,25,Los Angeles');
  });

  it('should handle empty array', () => {
    const csv = convertToCSV([]);
    expect(csv).toBe('');
  });

  it('should escape commas and quotes', () => {
    const data = [{ name: 'Smith, John', notes: 'He said "hello"' }];
    const csv = convertToCSV(data);

    expect(csv).toContain('"Smith, John"');
    expect(csv).toContain('"He said ""hello"""');
  });
});

describe('formatPhoneNumber', () => {
  it('should format 10-digit phone number', () => {
    const result = formatPhoneNumber('5551234567');
    expect(result).toBe('(555) 123-4567');
  });

  it('should return original if not 10 digits', () => {
    const result = formatPhoneNumber('123');
    expect(result).toBe('123');
  });

  it('should strip non-digit characters before formatting', () => {
    const result = formatPhoneNumber('(555) 123-4567');
    expect(result).toBe('(555) 123-4567');
  });
});
