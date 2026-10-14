import { normalizeDataViewState, normalizeDataViewSavedViews } from './view-state';
import { DataViewViewState } from './types';
const base: DataViewViewState = { version: 1, columns: [{ field: 'old' }, { field: 'a', visible: true, width: 123 }], sort: { active: 'old', direction: 'asc' }, search: 'Needle', columnFilters: {}, pageSize: 20 };
describe('Saved DataView state', () => {
  it('drops removed fields and restores new columns with defaults', () => {
    const state = normalizeDataViewState(base, [{ field: 'a', name: 'A' }, { field: 'b', name: 'B', pinned: true }]);
    expect(state.columns.map(c => c.field)).toEqual(['a', 'b']); expect(state.sort.active).toBe(''); expect(state.columns[1].pinned).toBe(true);
  });
  it('rejects unsupported, duplicate and unusable saved state', () => {
    const cols = [{ field: 'a', name: 'A' }];
    expect(() => normalizeDataViewState({ ...base, version: 2 }, cols)).toThrow();
    expect(() => normalizeDataViewState({ ...base, columns: [{ field: 'a', visible: false }] }, cols)).toThrow();
    expect(() => normalizeDataViewSavedViews([{ id: 'x', name: 'A', state: base }, { id: 'x', name: 'B', state: base }], cols)).toThrow();
  });
});
