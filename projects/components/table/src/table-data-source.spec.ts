import { TableDataSource } from './table-data-source';

describe('TableDataSource filtering', () => {
  it('rebuilds search cache when existing records are updated and assigned again', () => {
    const row = { name: 'Alice' }; const ds = new TableDataSource([row]);
    ds.filter = 'Alice'; expect(ds.filteredData).toEqual([row]);
    row.name = 'Bob'; ds.data = [row];
    expect(ds.filteredData).toEqual([]);
    ds.filter = 'Bob'; expect(ds.filteredData).toEqual([row]); ds.disconnect();
  });
  it('invalidates a single mutated record on demand', () => {
    const row = { name: 'Before' }; const ds = new TableDataSource([row]);
    ds.filter = 'Before'; row.name = 'After'; ds.invalidateFilterCache(row);
    ds.filter = 'After'; expect(ds.filteredData).toEqual([row]); ds.disconnect();
  });
});
