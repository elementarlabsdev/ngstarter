import { DataViewColumnFilter, DataViewFilterModel } from './types';

export function dataViewDateKey(value: unknown): string | undefined {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return undefined;
    return `${value.getFullYear().toString().padStart(4, '0')}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return undefined;
  const day = value.slice(0, 10); const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day ? day : undefined;
}

/** Empty filters are removed; malformed values are rejected before reaching a datasource. */
export function normalizeDataViewFilter(filter: DataViewColumnFilter): DataViewColumnFilter | null {
  if (!filter || typeof filter !== 'object') throw new Error('Invalid column filter');
  switch (filter.type) {
    case 'text':
      if (!['contains', 'equals', 'startsWith', 'endsWith', 'notContains'].includes(filter.operator) || typeof filter.value !== 'string') throw new Error('Invalid text filter');
      return filter.value.trim() ? { type: 'text', operator: filter.operator, value: filter.value.trim() } : null;
    case 'number': {
      if (!['equals', 'notEquals', 'greaterThan', 'lessThan', 'between'].includes(filter.operator)) throw new Error('Invalid number operator');
      if ((filter.value !== undefined && !Number.isFinite(filter.value)) || (filter.to !== undefined && !Number.isFinite(filter.to))) throw new Error('Enter a finite number');
      if (filter.operator !== 'between') return filter.value === undefined ? null : { type: 'number', operator: filter.operator, value: filter.value };
      if (filter.value === undefined && filter.to === undefined) return null;
      if (filter.value !== undefined && filter.to !== undefined && filter.value > filter.to) throw new Error('Minimum must not exceed maximum');
      return { type: 'number', operator: filter.operator, value: filter.value, to: filter.to };
    }
    case 'date':
      if ((filter.from && dataViewDateKey(filter.from) !== filter.from) || (filter.to && dataViewDateKey(filter.to) !== filter.to)) throw new Error('Invalid calendar date');
      if (filter.from && filter.to && filter.from > filter.to) throw new Error('Start date must not exceed end date');
      return filter.from || filter.to ? { type: 'date', from: filter.from, to: filter.to } : null;
    case 'enum':
      if (!Array.isArray(filter.values) || filter.values.some(v => typeof v !== 'string' && (typeof v !== 'number' || !Number.isFinite(v)))) throw new Error('Invalid enum values');
      return filter.values.length ? { type: 'enum', values: [...new Set(filter.values)] } : null;
    case 'boolean':
      if (typeof filter.value !== 'boolean') throw new Error('Invalid boolean filter');
      return { type: 'boolean', value: filter.value };
    default: throw new Error('Unknown filter type');
  }
}

export function matchesDataViewFilter(value: unknown, filter: DataViewColumnFilter): boolean {
  switch (filter.type) {
    case 'text': {
      const text = String(value ?? '').toLocaleLowerCase(); const term = filter.value.toLocaleLowerCase();
      switch (filter.operator) {
        case 'equals': return text === term;
        case 'startsWith': return text.startsWith(term);
        case 'endsWith': return text.endsWith(term);
        case 'notContains': return !text.includes(term);
        default: return text.includes(term);
      }
    }
    case 'number': {
      if (value === null || value === undefined || value === '' || typeof value === 'boolean') return false;
      const n = Number(value); if (!Number.isFinite(n)) return false;
      switch (filter.operator) {
        case 'equals': return n === filter.value;
        case 'notEquals': return n !== filter.value;
        case 'greaterThan': return n > filter.value!;
        case 'lessThan': return n < filter.value!;
        default: return (filter.value === undefined || n >= filter.value) && (filter.to === undefined || n <= filter.to);
      }
    }
    case 'date': {
      const day = dataViewDateKey(value);
      return !!day && (!filter.from || day >= filter.from) && (!filter.to || day <= filter.to);
    }
    case 'enum': return filter.values.some(item => item === value);
    case 'boolean': return value === filter.value;
  }
}

export function normalizeDataViewFilters(filters: DataViewFilterModel): DataViewFilterModel {
  const result: DataViewFilterModel = {};
  for (const [field, filter] of Object.entries(filters ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    const normalized = normalizeDataViewFilter(filter); if (normalized) Object.defineProperty(result, field, { value: normalized, enumerable: true, configurable: true, writable: true });
  }
  return result;
}

export function dataViewFilterLabel(filter: DataViewColumnFilter): string {
  const labels: Record<string, string> = { contains: 'Contains', equals: 'Equals', startsWith: 'Starts with', endsWith: 'Ends with', notContains: 'Does not contain', notEquals: 'Does not equal', greaterThan: 'Greater than', lessThan: 'Less than' };
  switch (filter.type) {
    case 'text': return `${labels[filter.operator]}: ${filter.value}`;
    case 'number': return filter.operator === 'between' ? `${filter.value ?? '…'} – ${filter.to ?? '…'}` : `${labels[filter.operator]}: ${filter.value}`;
    case 'date': return `${filter.from ?? '…'} – ${filter.to ?? '…'}`;
    case 'enum': return filter.values.join(', ');
    case 'boolean': return filter.value ? 'Yes' : 'No';
  }
}
