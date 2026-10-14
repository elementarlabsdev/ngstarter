import { DataViewColumnDef, DataViewSavedView, DataViewState, DataViewViewState } from './types';
import { normalizeDataViewFilters } from './filters';

/** Validates persisted state, removes stale fields and appends newly added columns. */
export function normalizeDataViewState(value: unknown, columns: readonly DataViewColumnDef[]): DataViewViewState {
  const state = value as DataViewViewState;
  if (!state || state.version !== 1 || !Array.isArray(state.columns) || typeof state.search !== 'string'
    || !Number.isInteger(state.pageSize) || state.pageSize < 1 || !state.sort
    || typeof state.sort.active !== 'string' || !['asc', 'desc', ''].includes(state.sort.direction)
    || !state.columnFilters || typeof state.columnFilters !== 'object' || Array.isArray(state.columnFilters)) throw new Error('Invalid DataView state');
  const known = new Map(columns.map(c => [c.field, c]));
  const seen = new Set<string>(); const result: DataViewState[] = [];
  for (const item of state.columns) {
    if (!item || typeof item.field !== 'string' || seen.has(item.field)) throw new Error('Invalid or duplicate state column');
    seen.add(item.field); if (!known.has(item.field)) continue;
    if ((item.width !== undefined && (typeof item.width !== 'number' && typeof item.width !== 'string'))
      || (typeof item.width === 'number' && (!Number.isFinite(item.width) || item.width <= 0))
      || (item.visible !== undefined && typeof item.visible !== 'boolean')
      || (item.pinned !== undefined && typeof item.pinned !== 'boolean')
      || (item.pinAlign !== undefined && item.pinAlign !== 'start' && item.pinAlign !== 'end')) throw new Error('Invalid column state');
    const width = typeof item.width === 'number' || (typeof item.width === 'string' && /^\d+$/.test(item.width)) ? `${item.width}px` : item.width;
    result.push({ field: item.field, width, visible: item.visible ?? true, pinned: !!item.pinned, pinAlign: item.pinned ? item.pinAlign ?? 'start' : undefined });
  }
  for (const column of columns) if (!seen.has(column.field)) result.push({ field: column.field,
    width: typeof column.width === 'number' ? `${column.width}px` : column.width, visible: column.visible ?? true, pinned: !!column.pinned, pinAlign: column.pinned ? column.pinAlign ?? 'start' : undefined });
  if (result.length && !result.some(c => c.visible)) throw new Error('Keep at least one column visible');
  const filters = normalizeDataViewFilters(state.columnFilters);
  for (const field of Object.keys(filters)) {
    const column = known.get(field);
    if (!column) delete filters[field];
    else if (column.filter && column.filter.type !== filters[field].type) throw new Error(`Invalid filter type for ${field}`);
  }
  return { version: 1, columns: result, sort: known.has(state.sort.active) ? { active: state.sort.active, direction: state.sort.direction } : { active: '', direction: '' },
    search: state.search, columnFilters: filters, pageSize: state.pageSize };
}

export function normalizeDataViewSavedViews(value: unknown, columns: readonly DataViewColumnDef[]): DataViewSavedView[] {
  if (!Array.isArray(value)) throw new Error('Invalid saved views');
  const ids = new Set<string>();
  const names = new Set<string>();
  return value.map(view => {
    if (!view || typeof view.id !== 'string' || !view.id.trim() || ids.has(view.id) || typeof view.name !== 'string'
      || !view.name.trim() || view.name.trim().length > 100 || names.has(view.name.trim().toLocaleLowerCase())) throw new Error('Invalid saved view');
    ids.add(view.id);
    names.add(view.name.trim().toLocaleLowerCase());
    return { id: view.id, name: view.name.trim(), state: normalizeDataViewState(view.state, columns) };
  });
}
