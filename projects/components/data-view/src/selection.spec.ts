import { DataViewSelection } from './selection';
describe('DataView stable row selection', () => {
  it('rebinds selected records by ID and removes deleted client records', () => {
    const s = new DataViewSelection<{ id: number; name: string }>(r => r.id);
    s.select({ id: 1, name: 'Before' }); const next = { id: 1, name: 'After' };
    expect(s.reconcile([next], true)).toBe(true); expect(s.selected).toEqual([next]);
    expect(s.isSelected(next)).toBe(true); s.reconcile([], true); expect(s.hasValue()).toBe(false);
  });
  it('represents unloaded server records, exclusions and page refreshes', () => {
    const s = new DataViewSelection<{ id: number }>(r => r.id);
    s.selectMatching([{ id: 1 }]); expect(s.isSelected({ id: 500 })).toBe(true);
    s.deselect({ id: 500 }); expect(s.isSelected({ id: 500 })).toBe(false);
    s.reconcile([{ id: 500 }, { id: 600 }], false); expect(s.selected.map(r => r.id)).toEqual([1, 600]);
    s.select({ id: 500 }); expect(s.excluded.size).toBe(0); s.clear(); expect(s.isSelected({ id: 1 })).toBe(false);
  });
});
