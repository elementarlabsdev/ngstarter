import { matchesDataViewFilter, normalizeDataViewFilter } from './filters';
describe('Typed DataView filters', () => {
  it('matches text, numbers, typed enums and booleans consistently', () => {
    expect(matchesDataViewFilter('ALPHA', { type: 'text', operator: 'contains', value: 'alp' })).toBe(true);
    expect(matchesDataViewFilter('15', { type: 'number', operator: 'between', value: 10, to: 20 })).toBe(true);
    expect(matchesDataViewFilter(null, { type: 'number', operator: 'lessThan', value: 1 })).toBe(false);
    expect(matchesDataViewFilter('1', { type: 'enum', values: [1] })).toBe(false);
    expect(matchesDataViewFilter(false, { type: 'boolean', value: false })).toBe(true);
  });
  it('uses inclusive calendar dates and rejects malformed/reversed ranges', () => {
    const filter = { type: 'date' as const, from: '2026-10-01', to: '2026-10-14' };
    expect(matchesDataViewFilter('2026-10-14T23:59:59Z', filter)).toBe(true);
    expect(matchesDataViewFilter('2026-10-15', filter)).toBe(false);
    expect(() => normalizeDataViewFilter({ type: 'date', from: '2026-02-30' })).toThrow();
    expect(() => normalizeDataViewFilter({ type: 'number', operator: 'between', value: 20, to: 10 })).toThrow();
    expect(normalizeDataViewFilter({ type: 'text', operator: 'contains', value: ' ' })).toBeNull();
    expect(normalizeDataViewFilter({ type: 'enum', values: [] })).toBeNull();
  });
});
