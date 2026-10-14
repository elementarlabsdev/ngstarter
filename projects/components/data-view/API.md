# DataView workflows API

Import from `@ngstarter-ui/components/data-view`. `DataView` is the operational,
virtualized data grid. Use `Table` for template-defined read-only tables.

```ts
import { DataView, DataViewColumnDef, provideDataView } from '@ngstarter-ui/components/data-view';

interface RecordRow { id: number; name: string; amount: number; created: string; enabled: boolean; status: string; }

const columns: DataViewColumnDef[] = [
  { field: 'id', name: 'ID', width: 80, pinned: true, sortable: true },
  { field: 'name', name: 'Name', filter: { type: 'text' } },
  { field: 'amount', name: 'Amount', filter: { type: 'number' } },
  { field: 'created', name: 'Created', filter: { type: 'date' } },
  { field: 'enabled', name: 'Enabled', filter: { type: 'boolean' } },
  { field: 'status', name: 'Status', filter: { type: 'enum', options: [
    { value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }
  ] } }
];
const getRowId = (row: RecordRow) => row.id;

// Optional environment defaults; all instance inputs still override them.
export const appConfig = { providers: [provideDataView({ pageSize: 20, withSavedViews: true })] };
```

```html
<ngs-data-view #grid="ngsDataView" [data]="records" [columnDefs]="columns"
  [getRowId]="getRowId" withSelection withPagination withColumnSettings withSavedViews
  selectionScope="page" [(search)]="search" [(columnFilters)]="filters"
  [(savedViews)]="views" viewStorageKey="orders:current-user:views"
  ariaLabel="Orders" (stateChanged)="onState($event)"
  (selectionStateChanged)="onSelection($event)" (rowActivated)="openRecord($event)"/>
```

## Stable row selection

`getRowId: (row: T) => string | number` is optional for local/reference-based
selection and required to preserve identity when records are replaced. IDs must
be unique and stable within the dataset. Number `1` and string `"1"` are distinct.

`selectionScope` defaults to `filtered`:

| Scope | Client | Server |
| --- | --- | --- |
| `page` | Current filtered/sorted page (all filtered rows without pagination) | Loaded page |
| `filtered` | All results matching quick search and column filters | All matching records, including unloaded rows, when `getRowId` is supplied |
| `all` | Entire input dataset, including rows hidden by filters | Entire server dataset; query fields are empty |

`api.selectAll(scope?)` can override the configured scope for that operation.
Single selection selects at most one record. Without `getRowId`, server selection
falls back to the loaded page and reports `scope: 'page'`.

```ts
interface DataViewSelectionState<T = unknown> {
  scope: 'page' | 'filtered' | 'all';
  allMatching: boolean;
  rowIds: (string | number)[];
  excludedRowIds: (string | number)[];
  rows: T[];
  search: string;
  columnFilters: DataViewFilterModel;
}
```

`selectionChanged` remains a `T[]` event containing known selected records. It is
not the complete list for a server-wide selection. Use `selectionStateChanged`
or `api.getSelection()` for that descriptor. When `allMatching` is true, interpret
selection as **the query minus excluded IDs**, not as `rowIds`. `rows` and `rowIds`
contain known selected records only. After immutable refresh, these record objects
are updated to their current versions. Deleted client records are removed;
server records remain selected across pages. A query change clears a server
`filtered` all-matching selection; `all` selection survives query changes.
Checkbox events use source `checkbox`, single-row click uses `row`, and keyboard
selection uses `keyboard`. `api.unselectAll()` clears explicit and all-matching
selection.

## Typed column filters

`columnFilters` is a two-way model keyed by field path. Filters combine with AND;
quick search is an additional condition. Column `filter` enables its header
button and declares the UI type; enum options preserve string/number values.
Text comparisons are case-insensitive; enum comparisons preserve value types;
boolean values must be actual booleans; missing/empty numeric values never match.

```ts
type DataViewColumnFilter =
  | { type: 'text'; operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'notContains'; value: string }
  | { type: 'number'; operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between'; value?: number; to?: number }
  | { type: 'date'; from?: string; to?: string }
  | { type: 'enum'; values: (string | number)[] }
  | { type: 'boolean'; value: boolean };
type DataViewFilterModel = Record<string, DataViewColumnFilter>;
```

Number `between` and date ranges are inclusive; either bound may be omitted.
Dates use `YYYY-MM-DD`, interpreted as calendar days. ISO timestamp values use
their date portion; `Date` values use their local calendar day. The date filter
uses NgStarter DateRangeInput/DateRangePicker, not native date inputs.
`DateRangeInput` now exposes `[(range)]="dateRange"` with `DateRange<D> | null`
for both typed values and picker updates.

```ts
grid.api.setColumnFilter('amount', { type: 'number', operator: 'between', value: 100, to: 500 });
grid.api.setColumnFilter('created', { type: 'date', from: '2026-10-01', to: '2026-10-14' });
grid.api.setColumnFilter('status', { type: 'enum', values: ['active'] });
grid.api.setColumnFilter('enabled', { type: 'boolean', value: false });
grid.api.setColumnFilter('status', null); // remove one
grid.api.clearFilters(); // clear column filters AND quick search
```

Empty text/enum/range conditions are removed. Invalid dates, non-finite numbers,
reversed ranges, unknown fields and configured type mismatches are rejected.
Changing filters/search resets the page and vertical scroll. Client page indexes
are also clamped when records shrink. Active chips can remove a single condition
or clear the query, even when no records match.

Public pure helpers `matchesDataViewFilter`, `normalizeDataViewFilter`,
`normalizeDataViewFilters`, `dataViewDateKey`, and `dataViewFilterLabel` share the
contract with adapters. Production servers must implement the same semantics.

## Server requests, cancellation and errors

```ts
interface DataViewGetRowsParams {
  startRow: number; // inclusive
  endRow: number;   // exclusive
  page: number;    // zero-based
  pageSize: number;
  sortModel: { colId: string; sort: 'asc' | 'desc' | '' }[];
  filterModel: string; // quick search, retained for existing adapters
  columnFilters: DataViewFilterModel;
  signal: AbortSignal;
  successCallback(rows: any[], lastRow?: number): void;
  failCallback(error?: unknown): void;
}
interface DataViewDatasource {
  getItems(params: DataViewGetRowsParams): void | (() => void) | { unsubscribe(): void };
}
```

`lastRow` is the **total number of matching records**, not the last index. Supply
it for accurate server pagination. Newer queries/datasources and destruction abort
`signal`, call pending cleanup/unsubscribe, and reject stale callbacks. Quick
search is debounced by 300ms; column conditions and pagination are immediate.
Synchronous adapter exceptions use the same failure path.

```ts
const datasource: DataViewDatasource = {
  getItems(params) {
    fetch('/api/orders/query', {
      method: 'POST', signal: params.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: params.page, pageSize: params.pageSize,
        search: params.filterModel, filters: params.columnFilters, sort: params.sortModel })
    }).then(response => {
      if (!response.ok) throw new Error('Could not load orders');
      return response.json();
    }).then(result => params.successCallback(result.rows, result.total))
      .catch(error => { if (!params.signal.aborted) params.failCallback(error); });
  }
};
```

`error()` holds the visible message; `loadError` emits the original error.
`loadStatus()` is `idle | loading | refreshing | ready | error`.
`refreshing()` is true during background requests after an initial response.
Previously loaded rows remain visible with an updating status; the initial load
uses a blocking loader. The error alert includes Retry, which calls `refresh()`.
`loadEnd` / `refreshEnd` signal completion of successful **or failed** cycles;
check `error()` when completion alone is insufficient. `api.search(value)` updates
the same model as `[search]` and triggers a server request in server mode.

## State and named views

```ts
interface DataViewViewState {
  version: 1;
  columns: DataViewState[]; // array order is column order
  sort: { active: string; direction: 'asc' | 'desc' | '' };
  search: string;
  columnFilters: DataViewFilterModel;
  pageSize: number;
}
interface DataViewState {
  field: string; visible?: boolean; width?: string | number;
  pinned?: boolean; pinAlign?: 'start' | 'end';
}
interface DataViewSavedView { id: string; name: string; state: DataViewViewState; }
```

`stateChanged` emits a serializable state when columns/query/page size change.
`sortState` is a two-way `{ active, direction }` model. `sortChange` remains the
user sorting event. `columnFilters`, `search`, and `savedViews` expose their normal
model change outputs. `getSnapshot()` / `applyState()` remain column-only APIs and
now restore order and visibility as well as width/pinning.

```ts
const state = grid.api.getState();
grid.api.setState(state);
const view = grid.api.saveView('Review queue');
grid.api.applyView(view.id);
grid.api.saveView('Review queue', view.id); // update current state
// or rename without replacing its state:
grid.api.renameView(view.id, 'Priority queue');
grid.api.deleteView(view.id);
grid.api.applyView(null); // reset to initial instance state
```

Names must contain 1–100 characters and be unique ignoring case.
`withSavedViews` enables the selector and save/update/rename/delete/reset menu.
An unsaved-change indicator compares the current query with the chosen view.
`activeViewId()` exposes the selection; `viewApplied` emits the applied view or
null for the default. Applying a view starts at page zero. Deleting the active
view resets to default. State restoration validates the version/types, removes
stale fields, appends new columns, clears sorting for removed fields, and rejects
views that hide every column. Pure helpers `normalizeDataViewState` and
`normalizeDataViewSavedViews` are also public.

Persistence is opt-in through a unique `viewStorageKey`. The default storage is
localStorage; use a key scoped to the user and dataset. No key means no storage
access. For another synchronous storage adapter:

```ts
provideDataView({
  viewStorage: {
    getItem: key => myStorage.read(key),
    setItem: (key, value) => myStorage.write(key, value)
  }
});
```

Storage failures and malformed payloads are exposed through `viewStorageError()`
and a visible alert when saved views UI is enabled. Named views and the active ID
are persisted; unsaved edits and row selection are not. Consumers can instead
bind `[(savedViews)]` and persist its change event themselves.

## Keyboard and accessibility

The root uses a labelled `grid`, logical row/column counts, row indexes, selected
states and an active descendant. Pinned cell fragments belong to one logical
row through `aria-owns`; virtualized rows report their global position. Provide
`ariaLabel` for the dataset. Icon actions and selection checkboxes have labels.

| Key while grid is focused | Action |
| --- | --- |
| Arrows | Move active cell; scroll virtual rows/center columns into view |
| Home / End | First/last cell in current row |
| Ctrl/Command + Home / End | First/last row and cell in the loaded/client page |
| Page Up / Page Down | Move by one viewport |
| Space | Toggle current row selection |
| Shift + Space or Shift + Up/Down | Extend selection from the selection anchor |
| Ctrl/Command + A | Select configured scope |
| Escape | Clear selection |
| Enter | Emit `rowActivated` for the active record |

Inputs, buttons, custom interactive renderers and overlays retain their own
keyboard behavior. Tab reaches sorting headers and resize separators. Enter /
Space sorts a header. Resize handles support Left/Right (10px), Shift + Left/Right
(1px), Home (minimum), End (maximum, default 2000px). User resize constraints are
respected. Actual screen-reader support should also be evaluated in consumer
applications with their custom renderers.
